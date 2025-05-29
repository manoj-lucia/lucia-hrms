import { NextRequest, NextResponse } from 'next/server';
import prisma, { executeWithRetry } from '@/lib/db';
import { protectRoute } from '@/lib/auth';

// PUT: Update user profile image
export async function PUT(request: NextRequest) {
  try {
    // Protect route - all authenticated users can update their own profile image
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        const userId = authResult.id;
        const { profileImage } = await request.json();

        // Validate profile image data
        if (!profileImage || typeof profileImage !== 'string') {
          return NextResponse.json(
            { error: 'Invalid profile image data' },
            { status: 400 }
          );
        }

        // Update user profile image
        const updatedUser = await executeWithRetry(() =>
          prisma.user.update({
            where: { id: userId },
            data: { profileImage },
            select: {
              id: true,
              profileImage: true
            }
          })
        );

        return NextResponse.json({
          success: true,
          profileImage: updatedUser.profileImage
        });
      } catch (dbError: any) {
        console.error('Database error in profile image PUT route:', dbError);

        // Provide more specific error messages based on error type
        let errorMessage = 'Database error. Please try again later.';
        let statusCode = 500;

        if (dbError.code === 'P1001') {
          errorMessage = 'Cannot reach database server. Please check your connection.';
        } else if (dbError.code === 'P1002') {
          errorMessage = 'Database connection timed out. Please try again later.';
        }

        return NextResponse.json(
          {
            error: errorMessage,
            code: dbError.code || 'UNKNOWN',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          },
          { status: statusCode }
        );
      } finally {
        try {
          await prisma.$disconnect();
        } catch (disconnectError) {
          console.error('Error disconnecting from database:', disconnectError);
        }
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error updating profile image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove user profile image
export async function DELETE(request: NextRequest) {
  try {
    // Protect route - all authenticated users can remove their own profile image
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        const userId = authResult.id;

        // Update user to remove profile image
        await executeWithRetry(() =>
          prisma.user.update({
            where: { id: userId },
            data: { profileImage: null }
          })
        );

        return NextResponse.json({
          success: true,
          message: 'Profile image removed successfully'
        });
      } catch (dbError: any) {
        console.error('Database error in profile image DELETE route:', dbError);

        // Provide more specific error messages based on error type
        let errorMessage = 'Database error. Please try again later.';
        let statusCode = 500;

        if (dbError.code === 'P1001') {
          errorMessage = 'Cannot reach database server. Please check your connection.';
        } else if (dbError.code === 'P1002') {
          errorMessage = 'Database connection timed out. Please try again later.';
        }

        return NextResponse.json(
          {
            error: errorMessage,
            code: dbError.code || 'UNKNOWN',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          },
          { status: statusCode }
        );
      } finally {
        try {
          await prisma.$disconnect();
        } catch (disconnectError) {
          console.error('Error disconnecting from database:', disconnectError);
        }
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error removing profile image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
