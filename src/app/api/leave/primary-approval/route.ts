import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';

// GET: Fetch leave requests pending primary approval
export async function GET(request: NextRequest) {
  try {
    const authResult = await protectRoute(request, ['BRANCH_ADMIN', 'BRANCH_MANAGER']);

    if (!(authResult instanceof NextResponse)) {
      try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'PENDING';
        const branchId = searchParams.get('branchId');

        // Get user's branch access
        let userBranchId = null;

        if (authResult.role === 'BRANCH_ADMIN') {
          const branchAdmin = await prisma.branchAdmin.findUnique({
            where: { userId: authResult.id },
            select: { branchId: true }
          });
          userBranchId = branchAdmin?.branchId;
        } else if (authResult.role === 'BRANCH_MANAGER') {
          const branchManager = await prisma.branchManager.findUnique({
            where: { userId: authResult.id },
            select: { branchId: true }
          });
          userBranchId = branchManager?.branchId;
        }

        if (!userBranchId) {
          return NextResponse.json(
            { error: 'Branch access not found' },
            { status: 403 }
          );
        }

        // Build where clause
        const where: any = {
          status: status,
          employee: {
            branchId: branchId || userBranchId
          }
        };

        // Fetch leave requests for primary approval
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
            { createdAt: 'asc' }
          ]
        });

        return NextResponse.json({
          success: true,
          data: leaveRequests
        });

      } catch (dbError: any) {
        console.error('Database error in primary approval route:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching leave requests for primary approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Process primary approval (approve/reject)
export async function POST(request: NextRequest) {
  try {
    const authResult = await protectRoute(request, ['BRANCH_ADMIN', 'BRANCH_MANAGER']);

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
                    id: true,
                    name: true
                  }
                }
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

        // Check if user has access to this branch
        let userBranchId = null;

        if (authResult.role === 'BRANCH_ADMIN') {
          const branchAdmin = await prisma.branchAdmin.findUnique({
            where: { userId: authResult.id },
            select: { branchId: true }
          });
          userBranchId = branchAdmin?.branchId;
        } else if (authResult.role === 'BRANCH_MANAGER') {
          const branchManager = await prisma.branchManager.findUnique({
            where: { userId: authResult.id },
            select: { branchId: true }
          });
          userBranchId = branchManager?.branchId;
        }

        if (userBranchId !== leaveRequest.employee.branch.id) {
          return NextResponse.json(
            { error: 'Access denied. You can only approve requests from your branch.' },
            { status: 403 }
          );
        }

        // Check if request is in correct status
        if (leaveRequest.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Leave request is not in pending status' },
            { status: 400 }
          );
        }

        const now = new Date();
        let updateData: any = {
          primaryApproverId: authResult.id,
          primaryComments: comments,
          updatedAt: now
        };

        if (action === 'approve') {
          updateData.status = 'PRIMARY_APPROVED';
          updateData.primaryApprovedAt = now;
          updateData.currentApprovalLevel = 2; // Move to final approval level
        } else {
          updateData.status = 'PRIMARY_REJECTED';
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
            }
          }
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: authResult.id,
            action: action === 'approve' ? 'LEAVE_PRIMARY_APPROVED' : 'LEAVE_PRIMARY_REJECTED',
            details: `${action === 'approve' ? 'Approved' : 'Rejected'} leave request for ${leaveRequest.employee.user.firstName} ${leaveRequest.employee.user.lastName} (${leaveRequest.leaveType}, ${leaveRequest.totalDays} days)`
          }
        });

        return NextResponse.json({
          success: true,
          message: `Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
          data: updatedLeaveRequest
        });

      } catch (dbError: any) {
        console.error('Database error in primary approval processing:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error processing primary approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
