import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';

// GET: Fetch leave requests pending final approval (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await protectRoute(request, ['SUPER_ADMIN']);

    if (!(authResult instanceof NextResponse)) {
      try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'PRIMARY_APPROVED';
        const branchId = searchParams.get('branchId');
        const priority = searchParams.get('priority');

        // Build where clause
        const where: any = {
          status: status
        };

        if (branchId) {
          where.employee = {
            branchId: branchId
          };
        }

        if (priority) {
          where.priority = priority;
        }

        // Fetch leave requests for final approval
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
                },
                branch: {
                  select: {
                    name: true
                  }
                },
                team: {
                  select: {
                    name: true
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
          orderBy: [
            { priority: 'desc' },
            { primaryApprovedAt: 'asc' }
          ]
        });

        return NextResponse.json({
          success: true,
          data: leaveRequests
        });

      } catch (dbError: any) {
        console.error('Database error in final approval route:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching leave requests for final approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Process final approval (approve/reject) - Super Admin only
export async function POST(request: NextRequest) {
  try {
    const authResult = await protectRoute(request, ['SUPER_ADMIN']);

    if (!(authResult instanceof NextResponse)) {
      try {
        const {
          leaveRequestId,
          action, // 'approve' or 'reject'
          comments
        } = await request.json();

        // Validate required fields
        if (!leaveRequestId || !action || !['approve', 'reject'].includes(action)) {
          return NextResponse.json(
            { error: 'Invalid request. Required: leaveRequestId, action (approve/reject)' },
            { status: 400 }
          );
        }

        // Get leave request
        const leaveRequest = await prisma.leaveRequest.findUnique({
          where: { id: leaveRequestId },
          include: {
            employee: {
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
                    name: true
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
            }
          }
        });

        if (!leaveRequest) {
          return NextResponse.json(
            { error: 'Leave request not found' },
            { status: 404 }
          );
        }

        // Check if request is in correct status for final approval
        if (leaveRequest.status !== 'PRIMARY_APPROVED') {
          return NextResponse.json(
            { error: 'Leave request must be primary approved before final approval' },
            { status: 400 }
          );
        }

        const now = new Date();
        let updateData: any = {
          finalApproverId: authResult.id,
          finalComments: comments,
          updatedAt: now
        };

        if (action === 'approve') {
          updateData.status = 'FINAL_APPROVED';
          updateData.finalApprovedAt = now;
          
          // Update leave balance when finally approved
          const currentYear = new Date().getFullYear();
          
          // Check if leave balance exists for this employee and leave type
          const existingBalance = await prisma.leaveBalance.findUnique({
            where: {
              employeeId_year_leaveType: {
                employeeId: leaveRequest.employeeId,
                year: currentYear,
                leaveType: leaveRequest.leaveType
              }
            }
          });

          if (existingBalance) {
            // Update existing balance
            await prisma.leaveBalance.update({
              where: {
                employeeId_year_leaveType: {
                  employeeId: leaveRequest.employeeId,
                  year: currentYear,
                  leaveType: leaveRequest.leaveType
                }
              },
              data: {
                used: existingBalance.used + leaveRequest.totalDays,
                available: existingBalance.available - leaveRequest.totalDays
              }
            });
          }

          // Create balance adjustment record
          await prisma.leaveBalanceAdjustment.create({
            data: {
              leaveRequestId: leaveRequest.id,
              employeeId: leaveRequest.employeeId,
              leaveType: leaveRequest.leaveType,
              year: currentYear,
              adjustmentType: 'DEDUCT',
              days: leaveRequest.totalDays,
              reason: `Leave approved: ${leaveRequest.reason}`,
              adjustedBy: authResult.id
            }
          });

        } else {
          updateData.status = 'FINAL_REJECTED';
          updateData.rejectionReason = comments;
          updateData.rejectedBy = authResult.id;
          updateData.rejectedAt = now;
        }

        // Update leave request
        const updatedLeaveRequest = await prisma.leaveRequest.update({
          where: { id: leaveRequestId },
          data: updateData,
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
          }
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: authResult.id,
            action: action === 'approve' ? 'LEAVE_FINAL_APPROVED' : 'LEAVE_FINAL_REJECTED',
            details: `${action === 'approve' ? 'Final approved' : 'Final rejected'} leave request for ${leaveRequest.employee.user.firstName} ${leaveRequest.employee.user.lastName} (${leaveRequest.leaveType}, ${leaveRequest.totalDays} days)`
          }
        });

        return NextResponse.json({
          success: true,
          message: `Leave request ${action === 'approve' ? 'finally approved' : 'finally rejected'} successfully`,
          data: updatedLeaveRequest
        });

      } catch (dbError: any) {
        console.error('Database error in final approval processing:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error processing final approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
