import { NextRequest, NextResponse } from 'next/server';
import prisma, { executeWithRetry } from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET: Fetch current user profile
export async function GET(request: NextRequest) {
  try {
    // Protect route - all authenticated users can access their own profile
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        // Get user details based on role
        const userId = authResult.id;
        const userRole = authResult.role;

        // Base user data
        const user = await executeWithRetry(() =>
          prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          })
        );

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Get role-specific data
        let roleData = null;
        let employeeId = null;

        if (userRole === UserRole.EMPLOYEE) {
          const employee = await executeWithRetry(() =>
            prisma.employee.findUnique({
              where: { userId },
              include: {
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
            })
          );

          if (employee) {
            roleData = {
              employeeId: employee.id,
              department: employee.department,
              designation: employee.designation,
              branch: employee.branch,
              team: employee.team,
              joiningDate: employee.joiningDate
            };
            employeeId = employee.id;
          }
        } else if (userRole === UserRole.TEAM_LEADER) {
          const teamLeader = await executeWithRetry(() =>
            prisma.teamLeader.findUnique({
              where: { userId },
              include: {
                teams: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            })
          );

          if (teamLeader) {
            roleData = {
              teamLeaderId: teamLeader.id,
              teams: teamLeader.teams
            };
          }
        } else if (userRole === UserRole.BRANCH_MANAGER) {
          const branchManager = await executeWithRetry(() =>
            prisma.branchManager.findUnique({
              where: { userId },
              include: {
                branch: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            })
          );

          if (branchManager) {
            roleData = {
              branchManagerId: branchManager.id,
              branch: branchManager.branch
            };
          }
        } else if (userRole === UserRole.BRANCH_ADMIN) {
          const branchAdmin = await executeWithRetry(() =>
            prisma.branchAdmin.findUnique({
              where: { userId },
              include: {
                branch: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            })
          );

          if (branchAdmin) {
            roleData = {
              branchAdminId: branchAdmin.id,
              branch: branchAdmin.branch
            };
          }
        }

        // Return combined user profile
        return NextResponse.json({
          ...user,
          roleData,
          employeeId // Include employeeId at the top level for convenience
        });
      } catch (dbError: any) {
        console.error('Database error in user profile GET route:', dbError);

        // Provide more specific error messages based on error type
        let errorMessage = 'Database error. Please try again later.';
        let statusCode = 500;

        if (dbError.code === 'P1001') {
          errorMessage = 'Cannot reach database server. Please check your connection.';
        } else if (dbError.code === 'P1002') {
          errorMessage = 'Database connection timed out. Please try again later.';
        } else if (dbError.code === 'P1003') {
          errorMessage = 'Database record not found. The requested data may not exist.';
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
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
