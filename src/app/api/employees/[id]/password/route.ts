import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { decrypt, isEncrypted, isBcryptHash, simpleDecode } from '@/lib/encryption';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;

    // Validate employee ID format
    if (!employeeId || typeof employeeId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    // Find the employee and get their password
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        user: {
          select: {
            password: true
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    if (!employee.user?.password) {
      return NextResponse.json(
        { error: 'No password found for this employee' },
        { status: 404 }
      );
    }

    let decryptedPassword = null;
    const storedPassword = employee.user.password;

    try {
      if (storedPassword.startsWith('SIMPLE:')) {
        // Handle simple encoded passwords
        const encodedPart = storedPassword.substring(7); // Remove 'SIMPLE:' prefix
        decryptedPassword = simpleDecode(encodedPart);

        return NextResponse.json({
          password: decryptedPassword,
          hasPassword: true,
          encrypted: true,
          method: 'simple'
        });
      } else if (isEncrypted(storedPassword)) {
        // Decrypt the password using our encryption system
        decryptedPassword = decrypt(storedPassword);

        return NextResponse.json({
          password: decryptedPassword,
          hasPassword: true,
          encrypted: true,
          method: 'aes'
        });
      } else if (isBcryptHash(storedPassword)) {
        // This is a bcrypt hash - cannot be decrypted
        return NextResponse.json({
          password: null,
          error: 'This password uses old bcrypt format and cannot be displayed. Please run password migration or reset the password.',
          hasPassword: true,
          encrypted: false,
          needsMigration: true
        });
      } else {
        // Assume it's plain text (for development/testing only)
        return NextResponse.json({
          password: storedPassword,
          hasPassword: true,
          encrypted: false,
          warning: 'Password is stored in plain text - this is not secure'
        });
      }
    } catch (error) {
      console.error('Error decrypting password:', error);

      // Provide more specific error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown decryption error';

      return NextResponse.json({
        password: null,
        error: `Failed to decrypt password: ${errorMessage}`,
        hasPassword: true,
        encrypted: true
      });
    }

  } catch (error) {
    console.error('Error fetching employee password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
