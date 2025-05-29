import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET: Fetch attendance records with filtering options
export async function GET(request: NextRequest) {
  try {
    // Protect route - all authenticated users can access their own attendance
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        // We'll use executeWithRetry for all database operations

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const status = searchParams.get('status');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        // Build where clause based on filters
        let where: any = {};

        // If specific employee is requested
        if (employeeId) {
          where.employeeId = employeeId;
        } else if (authResult.role === UserRole.EMPLOYEE) {
          // For regular employees, only show their own attendance
          const employee = await prisma.employee.findUnique({
            where: { userId: authResult.id },
            select: { id: true }
          });

          if (!employee) {
            return NextResponse.json(
              { error: 'Employee record not found' },
              { status: 404 }
            );
          }

          where.employeeId = employee.id;
        } else if (authResult.role === UserRole.TEAM_LEADER) {
          // For team leaders, show attendance of their team members
          const teamLeader = await prisma.teamLeader.findUnique({
            where: { userId: authResult.id },
            include: { teams: true }
          });

          if (teamLeader && teamLeader.teams.length > 0) {
            const teamIds = teamLeader.teams.map(team => team.id);
            where.employee = {
              teamId: { in: teamIds }
            };
          }
        } else if (authResult.role === UserRole.BRANCH_ADMIN || authResult.role === UserRole.BRANCH_MANAGER) {
          // For branch admins/managers, show attendance of their branch
          let branchId: string | null = null;

          if (authResult.role === UserRole.BRANCH_MANAGER) {
            const branchManager = await prisma.branchManager.findUnique({
              where: { userId: authResult.id },
              select: { branchId: true }
            });
            branchId = branchManager?.branchId || null;
          } else {
            const branchAdmin = await prisma.branchAdmin.findUnique({
              where: { userId: authResult.id },
              select: { branchId: true }
            });
            branchId = branchAdmin?.branchId || null;
          }

          if (branchId) {
            where.employee = {
              branchId
            };
          }
        }

        // Date filters
        if (startDate && endDate) {
          where.date = {
            gte: new Date(startDate),
            lte: new Date(endDate)
          };
        } else if (month && year) {
          // For monthly view
          const monthNum = parseInt(month);
          const yearNum = parseInt(year);

          const startOfMonth = new Date(yearNum, monthNum - 1, 1);
          const endOfMonth = new Date(yearNum, monthNum, 0);

          where.date = {
            gte: startOfMonth,
            lte: endOfMonth
          };
        }

        // Status filter
        if (status) {
          where.status = status;
        }

        // Fetch attendance records
        const attendanceRecords = await prisma.attendance.findMany({
          where,
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
            date: 'desc'
          }
        });

        // Format the response
        const formattedRecords = attendanceRecords.map(record => ({
          id: record.id,
          employeeId: record.employeeId,
          employeeName: `${record.employee.user.firstName} ${record.employee.user.lastName}`,
          email: record.employee.user.email,
          date: record.date,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          status: record.status,
          workHours: record.workHours,
          notes: record.notes
        }));

        return NextResponse.json(formattedRecords);
      } catch (dbError: any) {
        console.error('Database error in attendance GET route:', dbError);

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
        } else if (dbError.code === 'P2002') {
          errorMessage = 'Unique constraint violation. This record already exists.';
        }

        // Check if it's a SQLite database file issue
        if (process.env.DATABASE_URL?.includes('file:') &&
            (dbError.message?.includes('no such table') ||
             dbError.message?.includes('database file does not exist'))) {

          errorMessage = 'SQLite database file issue. The database may need to be initialized.';

          // Try to create the database schema
          try {
            console.log('Attempting to create SQLite database schema...');
            const { execSync } = require('child_process');
            execSync('npx prisma db push', { stdio: 'inherit' });

            errorMessage = 'Database schema has been created. Please try again.';
          } catch (schemaError) {
            console.error('Failed to create database schema:', schemaError);
            errorMessage = 'Failed to create database schema. Please run "npx prisma db push" manually.';
          }
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
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create or update attendance record (check-in/check-out)
export async function POST(request: NextRequest) {
  try {
    // Protect route - employees can check in/out, managers can create records
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        // We'll use executeWithRetry for all database operations

        const data = await request.json();
        const { action, employeeId, date, status, notes } = data;

        // Validate required fields
        if (!action || !date) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        // Get current user's employee ID if not specified
        let targetEmployeeId = employeeId;

        if (!targetEmployeeId && authResult.role === UserRole.EMPLOYEE) {
          const employee = await prisma.employee.findUnique({
            where: { userId: authResult.id },
            select: { id: true }
          });

          if (!employee) {
            return NextResponse.json(
              { error: 'Employee record not found' },
              { status: 404 }
            );
          }

          targetEmployeeId = employee.id;
        }

        // Check if user has permission to modify this attendance record
        if (authResult.role === UserRole.EMPLOYEE && employeeId && employeeId !== targetEmployeeId) {
          return NextResponse.json(
            { error: 'You can only manage your own attendance' },
            { status: 403 }
          );
        }

        // Format the date (strip time part)
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Current time for check-in/check-out
        const currentTime = new Date();

        // Handle different actions
        if (action === 'check-in') {
          // Check if already checked in
          const existingRecord = await prisma.attendance.findUnique({
            where: {
              employeeId_date: {
                employeeId: targetEmployeeId,
                date: attendanceDate
              }
            }
          });

          if (existingRecord && existingRecord.checkIn) {
            return NextResponse.json(
              { error: 'Already checked in for today' },
              { status: 400 }
            );
          }

          // Create or update attendance record with check-in time
          const attendance = await prisma.attendance.upsert({
            where: {
              employeeId_date: {
                employeeId: targetEmployeeId,
                date: attendanceDate
              }
            },
            update: {
              checkIn: currentTime,
              status: 'Present'
            },
            create: {
              employeeId: targetEmployeeId,
              date: attendanceDate,
              checkIn: currentTime,
              status: 'Present'
            }
          });

          // Log activity
          await prisma.activityLog.create({
            data: {
              userId: authResult.id,
              action: 'CHECK_IN',
              details: `Checked in at ${currentTime.toLocaleTimeString('en-US')}`
            }
          });

          return NextResponse.json({
            message: 'Check-in successful',
            attendance
          });
        } else if (action === 'check-out') {
          // Check if checked in first
          const existingRecord = await executeWithRetry(() =>
            prisma.attendance.findUnique({
              where: {
                employeeId_date: {
                  employeeId: targetEmployeeId,
                  date: attendanceDate
                }
              }
            })
          );

          if (!existingRecord || !existingRecord.checkIn) {
            return NextResponse.json(
              { error: 'Must check in before checking out' },
              { status: 400 }
            );
          }

          if (existingRecord.checkOut) {
            return NextResponse.json(
              { error: 'Already checked out for today' },
              { status: 400 }
            );
          }

          // Calculate work hours
          const checkInTime = new Date(existingRecord.checkIn);
          const workHours = Math.round((currentTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) * 10) / 10;

          // Update attendance record with check-out time
          const attendance = await executeWithRetry(() =>
            prisma.attendance.update({
              where: {
                id: existingRecord.id
              },
              data: {
                checkOut: currentTime,
                workHours
              }
            })
          );

          // Log activity
          await executeWithRetry(() =>
            prisma.activityLog.create({
              data: {
                userId: authResult.id,
                action: 'CHECK_OUT',
                details: `Checked out at ${currentTime.toLocaleTimeString('en-US')}`
              }
            })
          );

          return NextResponse.json({
            message: 'Check-out successful',
            attendance
          });
        } else if (action === 'mark-attendance' && (authResult.role !== UserRole.EMPLOYEE)) {
          // Only managers and admins can mark attendance for others
          if (!status || !targetEmployeeId) {
            return NextResponse.json(
              { error: 'Missing required fields for marking attendance' },
              { status: 400 }
            );
          }

          // Create or update attendance record
          const attendance = await executeWithRetry(() =>
            prisma.attendance.upsert({
              where: {
                employeeId_date: {
                  employeeId: targetEmployeeId,
                  date: attendanceDate
                }
              },
              update: {
                status,
                notes: notes || null
              },
              create: {
                employeeId: targetEmployeeId,
                date: attendanceDate,
                status,
                notes: notes || null
              }
            })
          );

          // Log activity
          await executeWithRetry(() =>
            prisma.activityLog.create({
              data: {
                userId: authResult.id,
                action: 'MARK_ATTENDANCE',
                details: `Marked attendance as ${status} for employee ID ${targetEmployeeId}`
              }
            })
          );

          return NextResponse.json({
            message: 'Attendance marked successfully',
            attendance
          });
        } else {
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          );
        }
      } catch (dbError: any) {
        console.error('Database error in attendance POST route:', dbError);

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
        } else if (dbError.code === 'P2002') {
          errorMessage = 'Unique constraint violation. This record already exists.';
        } else if (dbError.code === 'P2025') {
          errorMessage = 'Record not found. The attendance record you are trying to update does not exist.';
        }

        // Check if it's a SQLite database file issue
        if (process.env.DATABASE_URL?.includes('file:') &&
            (dbError.message?.includes('no such table') ||
             dbError.message?.includes('database file does not exist'))) {

          errorMessage = 'SQLite database file issue. The database may need to be initialized.';

          // Try to create the database schema
          try {
            console.log('Attempting to create SQLite database schema...');
            const { execSync } = require('child_process');
            execSync('npx prisma db push', { stdio: 'inherit' });

            errorMessage = 'Database schema has been created. Please try again.';
          } catch (schemaError) {
            console.error('Failed to create database schema:', schemaError);
            errorMessage = 'Failed to create database schema. Please run "npx prisma db push" manually.';
          }
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
    console.error('Error managing attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
