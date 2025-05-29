import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { signJWT, setAuthCookie, JWTPayload } from '@/lib/auth';
import { decrypt, isEncrypted, isBcryptHash, simpleDecode } from '@/lib/encryption';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    try {
      // Test database connection
      await prisma.$connect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection error. Please make sure PostgreSQL is running and properly set up.' },
        { status: 503 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    }).catch(error => {
      console.error('Database query error:', error);

      // Check if the error is related to missing tables
      if (error instanceof Error &&
          (error.message.includes('does not exist') ||
          error.message.includes('relation') ||
          error.message.includes('table'))) {
        throw new Error('Database schema not set up. Please run database migrations.');
      }

      throw error;
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if password matches using encryption only
    let passwordMatch = false;

    try {
      if (user.password.startsWith('SIMPLE:')) {
        // Handle simple encoded passwords
        const encodedPart = user.password.substring(7);
        const decryptedPassword = simpleDecode(encodedPart);
        passwordMatch = password === decryptedPassword;
      } else if (isEncrypted(user.password)) {
        // Decrypt and compare
        const decryptedPassword = decrypt(user.password);
        passwordMatch = password === decryptedPassword;
      } else if (isBcryptHash(user.password)) {
        // Legacy bcrypt passwords - require password reset
        return NextResponse.json(
          { error: 'Password needs to be reset. Please contact administrator.' },
          { status: 401 }
        );
      } else {
        // Plain text comparison (for development/testing)
        passwordMatch = password === user.password;
      }
    } catch (error) {
      console.error('Password verification error:', error);
      passwordMatch = false;
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT payload
    const jwtPayload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    // Generate JWT token
    const token = await signJWT(jwtPayload);

    // Set auth cookie
    setAuthCookie(token);

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);

    // Provide more specific error messages based on the error type
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Disconnect from the database to prevent connection leaks
    await prisma.$disconnect();
  }
}
