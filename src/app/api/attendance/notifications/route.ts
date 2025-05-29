import { NextRequest, NextResponse } from 'next/server';
import prisma, { executeWithRetry } from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET: Fetch attendance notifications
export async function GET(request: NextRequest) {
  try {
    // Protect route - authenticated users can access
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        // We'll use executeWithRetry for all database operations

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // Build where clause based on user role
        let whereEmployee: any = {};
        let whereNotification: any = {};

        // For regular employees, only show their own notifications
        if (authResult.role === UserRole.EMPLOYEE) {
          const employee = await executeWithRetry(() =>
            prisma.employee.findUnique({
              where: { userId: authResult.id },
              select: { id: true }
            })
          );

          if (!employee) {
            return NextResponse.json(
              { error: 'Employee record not found' },
              { status: 404 }
            );
          }

          whereNotification.employeeId = employee.id;
        } else if (authResult.role === UserRole.TEAM_LEADER) {
          // For team leaders, show notifications of their team members
          const teamLeader = await executeWithRetry(() =>
            prisma.teamLeader.findUnique({
              where: { userId: authResult.id },
              include: { teams: true }
            })
          );

          if (teamLeader && teamLeader.teams.length > 0) {
            const teamIds = teamLeader.teams.map(team => team.id);
            whereEmployee.teamId = { in: teamIds };
          }
        } else if (authResult.role === UserRole.BRANCH_ADMIN || authResult.role === UserRole.BRANCH_MANAGER) {
          // For branch admins/managers, show notifications of their branch
          let branchId: string | null = null;

          if (authResult.role === UserRole.BRANCH_MANAGER) {
            const branchManager = await executeWithRetry(() =>
              prisma.branchManager.findUnique({
                where: { userId: authResult.id },
                select: { branchId: true }
              })
            );
            branchId = branchManager?.branchId || null;
          } else {
            const branchAdmin = await executeWithRetry(() =>
              prisma.branchAdmin.findUnique({
                where: { userId: authResult.id },
                select: { branchId: true }
              })
            );
            branchId = branchAdmin?.branchId || null;
          }

          if (branchId) {
            whereEmployee.branchId = branchId;
          }
        }

        // Get employee IDs based on filters (for managers/admins)
        let employeeIds: string[] = [];

        if (Object.keys(whereEmployee).length > 0) {
          const employees = await executeWithRetry(() =>
            prisma.employee.findMany({
              where: whereEmployee,
              select: { id: true }
            })
          );

          employeeIds = employees.map(emp => emp.id);

          if (employeeIds.length > 0) {
            whereNotification.employeeId = { in: employeeIds };
          }
        }

        // Fetch attendance notifications
        const notifications = await executeWithRetry(() =>
          prisma.attendanceNotification.findMany({
            where: whereNotification,
            include: {
              employee: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: limit
          })
        );

        // Format the response
        const formattedNotifications = notifications.map(notification => ({
          id: notification.id,
          employeeId: notification.employeeId,
          employeeName: `${notification.employee.user.firstName} ${notification.employee.user.lastName}`,
          email: notification.employee.user.email,
          type: notification.type,
          message: notification.message,
          date: notification.date,
          isRead: notification.isRead,
          createdAt: notification.createdAt
        }));

        return NextResponse.json(formattedNotifications);
      } catch (dbError: any) {
        console.error('Database error in notifications GET route:', dbError);

        // Provide more specific error messages based on error type
        let errorMessage = 'Database error. Please try again later.';
        let statusCode = 500;

        if (dbError.code === 'P1001') {
          errorMessage = 'Cannot reach database server. Please check your connection.';
        } else if (dbError.code === 'P1002') {
          errorMessage = 'Database connection timed out. Please try again later.';
        } else if (dbError.code === 'P1003') {
          errorMessage = 'Database record not found. The requested data may not exist.';
        } else if (dbError.code === 'P1008') {
          errorMessage = 'Database operation timeout. The server is under heavy load.';
        } else if (dbError.code === 'P1017') {
          errorMessage = 'Database connection was forcibly closed. Please try again.';
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
    console.error('Error fetching attendance notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create attendance notification
export async function POST(request: NextRequest) {
  try {
    // Protect route - only managers and admins can create notifications
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR,
      UserRole.BRANCH_ADMIN,
      UserRole.TEAM_LEADER
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        // We'll use executeWithRetry for all database operations

        const data = await request.json();
        const { employeeId, type, message, date } = data;

        // Validate required fields
        if (!employeeId || !type || !message || !date) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        // Create notification
        const notification = await executeWithRetry(() =>
          prisma.attendanceNotification.create({
            data: {
              employeeId,
              type,
              message,
              date: new Date(date),
              isRead: false
            }
          })
        );

        return NextResponse.json({
          message: 'Notification created successfully',
          notification
        });
      } catch (dbError: any) {
        console.error('Database error in notifications POST route:', dbError);

        // Provide more specific error messages based on error type
        let errorMessage = 'Database error. Please try again later.';
        let statusCode = 500;

        if (dbError.code === 'P1001') {
          errorMessage = 'Cannot reach database server. Please check your connection.';
        } else if (dbError.code === 'P1002') {
          errorMessage = 'Database connection timed out. Please try again later.';
        } else if (dbError.code === 'P1003') {
          errorMessage = 'Database record not found. The requested data may not exist.';
        } else if (dbError.code === 'P1008') {
          errorMessage = 'Database operation timeout. The server is under heavy load.';
        } else if (dbError.code === 'P1017') {
          errorMessage = 'Database connection was forcibly closed. Please try again.';
        } else if (dbError.code === 'P2003') {
          errorMessage = 'Foreign key constraint failed. The employee ID may not exist.';
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
    console.error('Error creating attendance notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    // Protect route - authenticated users can mark their notifications as read
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        // We'll use executeWithRetry for all database operations

        const data = await request.json();
        const { notificationId } = data;

        // Validate required fields
        if (!notificationId) {
          return NextResponse.json(
            { error: 'Missing notification ID' },
            { status: 400 }
          );
        }

        // Check if user has permission to mark this notification as read
        if (authResult.role === UserRole.EMPLOYEE) {
          const employee = await executeWithRetry(() =>
            prisma.employee.findUnique({
              where: { userId: authResult.id },
              select: { id: true }
            })
          );

          if (!employee) {
            return NextResponse.json(
              { error: 'Employee record not found' },
              { status: 404 }
            );
          }

          const notification = await executeWithRetry(() =>
            prisma.attendanceNotification.findUnique({
              where: { id: notificationId },
              select: { employeeId: true }
            })
          );

          if (!notification || notification.employeeId !== employee.id) {
            return NextResponse.json(
              { error: 'You can only mark your own notifications as read' },
              { status: 403 }
            );
          }
        }

        // Mark notification as read
        const notification = await executeWithRetry(() =>
          prisma.attendanceNotification.update({
            where: { id: notificationId },
            data: { isRead: true }
          })
        );

        return NextResponse.json({
          message: 'Notification marked as read',
          notification
        });
      } catch (dbError: any) {
        console.error('Database error in notifications PATCH route:', dbError);

        // Provide more specific error messages based on error type
        let errorMessage = 'Database error. Please try again later.';
        let statusCode = 500;

        if (dbError.code === 'P1001') {
          errorMessage = 'Cannot reach database server. Please check your connection.';
        } else if (dbError.code === 'P1002') {
          errorMessage = 'Database connection timed out. Please try again later.';
        } else if (dbError.code === 'P1003') {
          errorMessage = 'Database record not found. The requested data may not exist.';
        } else if (dbError.code === 'P1008') {
          errorMessage = 'Database operation timeout. The server is under heavy load.';
        } else if (dbError.code === 'P1017') {
          errorMessage = 'Database connection was forcibly closed. Please try again.';
        } else if (dbError.code === 'P2025') {
          errorMessage = 'Record not found. The notification you are trying to update does not exist.';
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
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
