import { NextRequest, NextResponse } from 'next/server';
import prisma, { executeWithRetry } from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// POST: Upload employee profile image
export async function POST(
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
        
        // Parse the form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
          return NextResponse.json(
            { error: 'No file provided' },
            { status: 400 }
          );
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          return NextResponse.json(
            { error: 'Invalid file type. Supported formats: JPG, PNG, GIF' },
            { status: 400 }
          );
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File size should be less than 5MB' },
            { status: 400 }
          );
        }
        
        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64Image}`;
        
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

        // Update user profile image
        await executeWithRetry(() =>
          prisma.user.update({
            where: { id: employee.userId },
            data: { profileImage: dataUrl }
          })
        );

        return NextResponse.json({
          success: true,
          message: 'Profile image uploaded successfully',
          imageUrl: dataUrl
        });
      } catch (dbError: any) {
        console.error('Database error in profile image upload route:', dbError);

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
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
