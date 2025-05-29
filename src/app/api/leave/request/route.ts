import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET: Fetch leave requests for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const year = searchParams.get('year');
        const leaveType = searchParams.get('leaveType');

        // Get employee record
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

        // Build where clause
        const where: any = {
          employeeId: employee.id
        };

        if (status) {
          where.status = status;
        }

        if (leaveType) {
          where.leaveType = leaveType;
        }

        if (year) {
          const yearInt = parseInt(year);
          where.startDate = {
            gte: new Date(yearInt, 0, 1),
            lt: new Date(yearInt + 1, 0, 1)
          };
        }

        // Fetch leave requests
        const leaveRequests = await prisma.leaveRequest.findMany({
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
            },
            primaryApprover: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            finalApprover: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return NextResponse.json({
          success: true,
          data: leaveRequests
        });

      } catch (dbError: any) {
        console.error('Database error in leave request route:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Submit a new leave request
export async function POST(request: NextRequest) {
  try {
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        const {
          leaveType,
          priority = 'MEDIUM',
          startDate,
          endDate,
          reason,
          attachmentUrl
        } = await request.json();

        // Validate required fields
        if (!leaveType || !startDate || !endDate || !reason) {
          return NextResponse.json(
            { error: 'Missing required fields: leaveType, startDate, endDate, reason' },
            { status: 400 }
          );
        }

        // Get employee record
        const employee = await prisma.employee.findUnique({
          where: { userId: authResult.id },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            branch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        if (!employee) {
          return NextResponse.json(
            { error: 'Employee record not found' },
            { status: 404 }
          );
        }

        // Calculate total days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

        if (totalDays <= 0) {
          return NextResponse.json(
            { error: 'End date must be after start date' },
            { status: 400 }
          );
        }

        // Check for overlapping leave requests
        const overlappingRequests = await prisma.leaveRequest.findMany({
          where: {
            employeeId: employee.id,
            status: {
              in: ['PENDING', 'PRIMARY_APPROVED', 'FINAL_APPROVED']
            },
            OR: [
              {
                startDate: { lte: end },
                endDate: { gte: start }
              }
            ]
          }
        });

        if (overlappingRequests.length > 0) {
          return NextResponse.json(
            { error: 'You have overlapping leave requests for the selected dates' },
            { status: 400 }
          );
        }

        // Create leave request
        const leaveRequest = await prisma.leaveRequest.create({
          data: {
            employeeId: employee.id,
            leaveType,
            priority,
            startDate: start,
            endDate: end,
            totalDays,
            reason,
            attachmentUrl,
            status: 'PENDING',
            currentApprovalLevel: 1
          },
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
          }
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: authResult.id,
            action: 'LEAVE_REQUEST_SUBMITTED',
            details: `Submitted ${leaveType} leave request for ${totalDays} days from ${start.toDateString()} to ${end.toDateString()}`
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Leave request submitted successfully',
          data: leaveRequest
        });

      } catch (dbError: any) {
        console.error('Database error in leave request submission:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error submitting leave request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
