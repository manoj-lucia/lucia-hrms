import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';

// GET: Fetch leave balance for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year') || new Date().getFullYear().toString();
        const employeeId = searchParams.get('employeeId'); // For admin access

        let targetEmployeeId = null;

        // If employeeId is provided and user is admin, use that
        if (employeeId && ['SUPER_ADMIN', 'BRANCH_ADMIN', 'BRANCH_MANAGER'].includes(authResult.role)) {
          targetEmployeeId = employeeId;
        } else {
          // Get employee record for authenticated user
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

        // Fetch leave balances for the year
        const leaveBalances = await prisma.leaveBalance.findMany({
          where: {
            employeeId: targetEmployeeId,
            year: parseInt(year)
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
          },
          orderBy: {
            leaveType: 'asc'
          }
        });

        // If no balances exist, create default ones
        if (leaveBalances.length === 0) {
          const defaultLeaveTypes = [
            { type: 'CASUAL', allowed: 12 },
            { type: 'SICK', allowed: 12 },
            { type: 'ANNUAL', allowed: 21 },
            { type: 'MATERNITY', allowed: 180 },
            { type: 'PATERNITY', allowed: 15 }
          ];

          const createdBalances = [];
          for (const leaveType of defaultLeaveTypes) {
            const balance = await prisma.leaveBalance.create({
              data: {
                employeeId: targetEmployeeId,
                year: parseInt(year),
                leaveType: leaveType.type as any,
                totalAllowed: leaveType.allowed,
                used: 0,
                pending: 0,
                available: leaveType.allowed,
                carriedForward: 0
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
            createdBalances.push(balance);
          }

          return NextResponse.json({
            success: true,
            data: createdBalances
          });
        }

        // Calculate pending days from current leave requests
        const pendingRequests = await prisma.leaveRequest.findMany({
          where: {
            employeeId: targetEmployeeId,
            status: {
              in: ['PENDING', 'PRIMARY_APPROVED']
            },
            startDate: {
              gte: new Date(parseInt(year), 0, 1),
              lt: new Date(parseInt(year) + 1, 0, 1)
            }
          }
        });

        // Update pending counts
        const pendingByType: { [key: string]: number } = {};
        pendingRequests.forEach(request => {
          pendingByType[request.leaveType] = (pendingByType[request.leaveType] || 0) + request.totalDays;
        });

        // Update balances with current pending counts
        const updatedBalances = [];
        for (const balance of leaveBalances) {
          const pendingDays = pendingByType[balance.leaveType] || 0;
          const available = balance.totalAllowed + balance.carriedForward - balance.used - pendingDays;

          if (balance.pending !== pendingDays || balance.available !== available) {
            const updatedBalance = await prisma.leaveBalance.update({
              where: { id: balance.id },
              data: {
                pending: pendingDays,
                available: Math.max(0, available)
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
            updatedBalances.push(updatedBalance);
          } else {
            updatedBalances.push(balance);
          }
        }

        return NextResponse.json({
          success: true,
          data: updatedBalances
        });

      } catch (dbError: any) {
        console.error('Database error in leave balance route:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update leave balance (Admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await protectRoute(request, ['SUPER_ADMIN', 'BRANCH_ADMIN', 'BRANCH_MANAGER']);

    if (!(authResult instanceof NextResponse)) {
      try {
        const {
          employeeId,
          year,
          leaveType,
          adjustmentType, // 'ADD', 'DEDUCT', 'SET', 'CARRY_FORWARD'
          days,
          reason
        } = await request.json();

        // Validate required fields
        if (!employeeId || !year || !leaveType || !adjustmentType || days === undefined || !reason) {
          return NextResponse.json(
            { error: 'Missing required fields: employeeId, year, leaveType, adjustmentType, days, reason' },
            { status: 400 }
          );
        }

        // Get or create leave balance
        let leaveBalance = await prisma.leaveBalance.findUnique({
          where: {
            employeeId_year_leaveType: {
              employeeId,
              year: parseInt(year),
              leaveType
            }
          }
        });

        if (!leaveBalance) {
          // Create new balance
          leaveBalance = await prisma.leaveBalance.create({
            data: {
              employeeId,
              year: parseInt(year),
              leaveType,
              totalAllowed: adjustmentType === 'SET' ? days : 0,
              used: 0,
              pending: 0,
              available: adjustmentType === 'SET' ? days : 0,
              carriedForward: adjustmentType === 'CARRY_FORWARD' ? days : 0
            }
          });
        }

        // Apply adjustment
        let updateData: any = {};
        
        switch (adjustmentType) {
          case 'ADD':
            updateData.totalAllowed = leaveBalance.totalAllowed + days;
            updateData.available = leaveBalance.available + days;
            break;
          case 'DEDUCT':
            updateData.used = leaveBalance.used + days;
            updateData.available = Math.max(0, leaveBalance.available - days);
            break;
          case 'SET':
            updateData.totalAllowed = days;
            updateData.available = days - leaveBalance.used - leaveBalance.pending;
            break;
          case 'CARRY_FORWARD':
            updateData.carriedForward = days;
            updateData.available = leaveBalance.totalAllowed + days - leaveBalance.used - leaveBalance.pending;
            break;
        }

        // Update balance
        const updatedBalance = await prisma.leaveBalance.update({
          where: { id: leaveBalance.id },
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
            }
          }
        });

        // Create adjustment record
        await prisma.leaveBalanceAdjustment.create({
          data: {
            leaveRequestId: '', // Manual adjustment, no leave request
            employeeId,
            leaveType,
            year: parseInt(year),
            adjustmentType,
            days,
            reason,
            adjustedBy: authResult.id
          }
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: authResult.id,
            action: 'LEAVE_BALANCE_ADJUSTED',
            details: `${adjustmentType} ${days} days for ${leaveType} leave - ${reason}`
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Leave balance updated successfully',
          data: updatedBalance
        });

      } catch (dbError: any) {
        console.error('Database error in leave balance update:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error updating leave balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
