import { NextRequest, NextResponse } from 'next/server';
import prisma, { executeWithRetry } from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// PUT: Update employee profile image
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Protect route - only admins and HR can update employee profile images
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR,
      UserRole.BRANCH_ADMIN
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        const employeeId = params.id;
        const { profileImage } = await request.json();

        // Validate profile image data
        if (!profileImage || typeof profileImage !== 'string') {
          return NextResponse.json(
            { error: 'Invalid profile image data' },
            { status: 400 }
          );
        }

        // Find the employee to get the user ID
        const employee = await executeWithRetry(() =>
          prisma.employee.findUnique({
            where: { id: employeeId },
            select: { userId: true }
          })
        );

        if (!employee) {
          return NextResponse.json(
            { error: 'Employee not found' },
            { status: 404 }
          );
        }

        // Ensure profileImage is a valid data URL
        let formattedProfileImage = profileImage;

        // If it's not a data URL but looks like base64, add the prefix
        if (profileImage && !profileImage.startsWith('data:image/')) {
          // Check if it's a base64 string without the data URL prefix
          if (profileImage.match(/^[A-Za-z0-9+/=]+$/)) {
            formattedProfileImage = `data:image/jpeg;base64,${profileImage}`;
          }
          // If it's not base64 and not a data URL, it might be invalid
          else if (!profileImage.match(/^(https?:\/\/|\/)/)) {
            console.warn('Invalid profile image format received');
          }
        }

        // Update user profile image
        const updatedUser = await executeWithRetry(() =>
          prisma.user.update({
            where: { id: employee.userId },
            data: { profileImage: formattedProfileImage },
            select: {
              id: true,
              profileImage: true
            }
          })
        );

        return NextResponse.json({
          success: true,
          message: 'Profile image updated successfully',
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

// DELETE: Remove employee profile image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Protect route - only admins and HR can remove employee profile images
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR,
      UserRole.BRANCH_ADMIN
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        const employeeId = params.id;

        // Find the employee to get the user ID
        const employee = await executeWithRetry(() =>
          prisma.employee.findUnique({
            where: { id: employeeId },
            select: { userId: true }
          })
        );

        if (!employee) {
          return NextResponse.json(
            { error: 'Employee not found' },
            { status: 404 }
          );
        }

        // Update user to remove profile image
        await executeWithRetry(() =>
          prisma.user.update({
            where: { id: employee.userId },
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
