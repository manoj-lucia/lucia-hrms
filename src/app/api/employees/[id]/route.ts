import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { encrypt } from '@/lib/encryption';

// GET: Fetch a single employee by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Enhanced debugging for params
    console.log('API: GET employee - Request URL:', request.url);

    // Protect route - only authenticated users with specific roles can access
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR,
      UserRole.BRANCH_ADMIN,
      UserRole.TEAM_LEADER
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        // Properly unwrap params
        const unwrappedParams = await Promise.resolve(params);
        const { id } = unwrappedParams;

        // Log the ID for debugging
        console.log('API: Fetching employee with ID:', id);

        // Validate ID
        if (!id) {
          console.error('API: Missing employee ID in request');
          return NextResponse.json(
            { error: 'Employee ID is required' },
            { status: 400 }
          );
        }

        // Validate ID format (should be a UUID)
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          console.error('API: Invalid employee ID format:', id);
          return NextResponse.json(
            { error: 'Invalid employee ID format' },
            { status: 400 }
          );
        }

        // Fetch employee with user data
        const employee = await prisma.employee.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
                phone: true,
                address: true,
                profileImage: true,
                role: true
              }
            },
            branch: {
              select: {
                id: true,
                name: true
              }
            },
            team: {
              select: {
                id: true,
                name: true
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

        // Transform the data for the frontend
        const formattedEmployee = {
          id: employee.id,
          userId: employee.userId,
          employeeId: employee.employeeId,
          firstName: employee.user.firstName,
          lastName: employee.user.lastName,
          name: `${employee.user.firstName} ${employee.user.lastName}`,
          email: employee.user.email,
          department: employee.department,
          designation: employee.designation,
          status: employee.user.status,
          role: employee.user.role,
          branch: {
            id: employee.branch.id,
            name: employee.branch.name
          },
          team: employee.team ? {
            id: employee.team.id,
            name: employee.team.name
          } : null,
          joiningDate: employee.joiningDate,
          phone: employee.user.phone || '',
          address: employee.user.address || '',
          profileImage: employee.user.profileImage || '',
          salary: employee.salary,
          bankAccountNo: employee.bankAccountNo || '',
          ifscCode: employee.ifscCode || '',
          panCard: employee.panCard || '',
          aadharCard: employee.aadharCard || ''
        };

        return NextResponse.json(formattedEmployee);
      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      } finally {
        await prisma.$disconnect().catch(console.error);
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update an employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Protect route - only admins and HR can update employees
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR,
      UserRole.BRANCH_ADMIN
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        // Properly unwrap params
        const unwrappedParams = await Promise.resolve(params);
        const { id } = unwrappedParams;
        const data = await request.json();

        // Validate required fields
        if (!data.firstName || !data.lastName || !data.email ||
            !data.employeeId || !data.department || !data.designation ||
            !data.salary || !data.joiningDate || !data.branchId ||
            !data.bankAccountNo || !data.ifscCode || !data.panCard || !data.aadharCard) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        // Check if employee exists
        const existingEmployee = await prisma.employee.findUnique({
          where: { id },
          include: { user: true }
        });

        if (!existingEmployee) {
          return NextResponse.json(
            { error: 'Employee not found' },
            { status: 404 }
          );
        }

        // Check if email is being changed and if it's already in use
        if (data.email !== existingEmployee.user.email) {
          const emailExists = await prisma.user.findUnique({
            where: { email: data.email }
          });

          if (emailExists) {
            return NextResponse.json(
              { error: 'Email already in use' },
              { status: 400 }
            );
          }
        }

        // Check if employee ID is being changed and if it's already in use
        if (data.employeeId !== existingEmployee.employeeId) {
          const employeeIdExists = await prisma.employee.findFirst({
            where: {
              employeeId: data.employeeId,
              id: { not: id }
            }
          });

          if (employeeIdExists) {
            return NextResponse.json(
              { error: 'Employee ID already in use' },
              { status: 400 }
            );
          }
        }

        // Create transaction to update both user and employee
        const result = await prisma.$transaction(async (tx) => {
          // Update user with all data including profile image
          const user = await tx.user.update({
            where: { id: existingEmployee.userId },
            data: {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              status: data.status || existingEmployee.user.status,
              phone: data.phone,
              address: data.address,
              profileImage: data.profileImage
            }
          });

          // Update password if provided
          if (data.password) {
            const encryptedPassword = encrypt(data.password);
            await tx.user.update({
              where: { id: user.id },
              data: { password: encryptedPassword }
            });
          }

          // Update employee record
          const employee = await tx.employee.update({
            where: { id },
            data: {
              employeeId: data.employeeId,
              designation: data.designation,
              department: data.department,
              joiningDate: new Date(data.joiningDate),
              salary: parseFloat(data.salary.toString()),
              branchId: data.branchId,
              teamId: data.teamId || null,
              bankAccountNo: data.bankAccountNo,
              ifscCode: data.ifscCode,
              panCard: data.panCard,
              aadharCard: data.aadharCard
            },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  status: true
                }
              }
            }
          });

          // Log activity
          await tx.activityLog.create({
            data: {
              userId: authResult.id,
              action: 'UPDATE_EMPLOYEE',
              details: `Updated employee: ${employee.employeeId} - ${user.firstName} ${user.lastName}`
            }
          });

          return employee;
        });

        return NextResponse.json({
          message: 'Employee updated successfully',
          employee: result
        });
      } catch (error) {
        console.error('Error updating employee:', error);

        // Check for specific error types
        if (error instanceof Error) {
          if (error.message.includes('Unique constraint')) {
            if (error.message.includes('email')) {
              return NextResponse.json(
                { error: 'Email already in use' },
                { status: 400 }
              );
            }
            if (error.message.includes('employeeId')) {
              return NextResponse.json(
                { error: 'Employee ID already in use' },
                { status: 400 }
              );
            }
          }
        }

        return NextResponse.json(
          { error: 'Failed to update employee. Please try again.' },
          { status: 500 }
        );
      } finally {
        await prisma.$disconnect().catch(console.error);
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Protect route - only admins and HR can delete employees
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        // Properly unwrap params
        const unwrappedParams = await Promise.resolve(params);
        const { id } = unwrappedParams;
        console.log(`Attempting to delete employee with ID: ${id}`);

        // Check if employee exists
        const employee = await prisma.employee.findUnique({
          where: { id },
          include: { user: true }
        });

        if (!employee) {
          console.log(`Employee with ID ${id} not found`);
          return NextResponse.json(
            { error: 'Employee not found' },
            { status: 404 }
          );
        }

        console.log(`Found employee: ${employee.employeeId} - ${employee.user.firstName} ${employee.user.lastName}`);

        // Store employee details for logging
        const employeeDetails = {
          id: employee.id,
          userId: employee.userId,
          employeeId: employee.employeeId,
          firstName: employee.user.firstName,
          lastName: employee.user.lastName
        };

        // Use a raw SQL approach to delete the employee and related records
        try {
          // Create a transaction to ensure all operations succeed or fail together
          await prisma.$transaction(async (tx) => {
            // 1. Delete attendance records
            console.log('Deleting attendance records...');
            await tx.attendance.deleteMany({
              where: { employeeId: id }
            });

            // 2. Delete attendance notifications
            console.log('Deleting attendance notifications...');
            await tx.attendanceNotification.deleteMany({
              where: { employeeId: id }
            });

            // 3. Delete documents
            console.log('Deleting documents...');
            await tx.document.deleteMany({
              where: { employeeId: id }
            });

            // 4. Delete payrolls
            console.log('Deleting payrolls...');
            await tx.payroll.deleteMany({
              where: { employeeId: id }
            });

            // 5. Delete tasks
            console.log('Deleting tasks...');
            await tx.task.deleteMany({
              where: { assigneeId: id }
            });

            // 6. Delete leave requests
            console.log('Deleting leave requests...');
            await tx.leaveRequest.deleteMany({
              where: { userId: employee.userId }
            });

            // 7. Update leave approvals
            console.log('Updating leave approvals...');
            await tx.leaveRequest.updateMany({
              where: { approverId: employee.userId },
              data: { approverId: null, approvedAt: null }
            });

            // 8. Delete notifications
            console.log('Deleting notifications...');
            await tx.notification.deleteMany({
              where: { userId: employee.userId }
            });

            // 9. Delete activity logs
            console.log('Deleting activity logs...');
            await tx.activityLog.deleteMany({
              where: { userId: employee.userId }
            });

            // 10. Delete the employee record
            console.log('Deleting employee record...');
            await tx.employee.delete({
              where: { id }
            });

            // 11. Delete the user record
            console.log('Deleting user record...');
            await tx.user.delete({
              where: { id: employee.userId }
            });

            // 12. Log activity for the admin who performed the deletion
            console.log('Creating activity log...');
            await tx.activityLog.create({
              data: {
                userId: authResult.id,
                action: 'DELETE_EMPLOYEE',
                details: `Deleted employee: ${employeeDetails.employeeId} - ${employeeDetails.firstName} ${employeeDetails.lastName}`
              }
            });
          });

          console.log('Employee deletion completed successfully');
          return NextResponse.json({
            message: 'Employee deleted successfully'
          });
        } catch (deleteError: any) {
          console.error('Error during deletion process:', deleteError);

          // Provide more specific error message based on the error
          let errorMessage = 'Failed to delete employee due to database constraints.';

          if (deleteError.message) {
            if (deleteError.message.includes('foreign key constraint')) {
              errorMessage = 'Cannot delete employee because they are referenced by other records in the system.';
            } else if (deleteError.message.includes('not found')) {
              errorMessage = 'Employee record not found or already deleted.';
            }
          }

          return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
          );
        }
      } catch (error: any) {
        console.error('Error in employee deletion handler:', error);
        return NextResponse.json(
          { error: 'Failed to delete employee. Please try again.' },
          { status: 500 }
        );
      } finally {
        await prisma.$disconnect().catch(console.error);
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error in DELETE route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
