import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole, UserStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Protect route - only authenticated users can access
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        // Test database connection
        await prisma.$connect();

        // Get the user's role and branch information
        const userId = authResult.id;
        const userRole = authResult.role;

        // Determine which branch to filter by based on user role
        let branchId: string | null = null;

        if (userRole !== UserRole.SUPER_ADMIN) {
          // For non-super admins, get their branch
          if (userRole === UserRole.BRANCH_MANAGER) {
            const branchManager = await prisma.branchManager.findUnique({
              where: { userId },
              select: { branchId: true }
            });
            branchId = branchManager?.branchId || null;
          } else if (userRole === UserRole.BRANCH_ADMIN) {
            const branchAdmin = await prisma.branchAdmin.findUnique({
              where: { userId },
              select: { branchId: true }
            });
            branchId = branchAdmin?.branchId || null;
          } else if (userRole === UserRole.TEAM_LEADER) {
            const teamLeader = await prisma.teamLeader.findUnique({
              where: { userId },
              select: {
                teams: {
                  select: {
                    branchId: true
                  },
                  take: 1
                }
              }
            });
            branchId = teamLeader?.teams[0]?.branchId || null;
          } else if (userRole === UserRole.EMPLOYEE) {
            const employee = await prisma.employee.findUnique({
              where: { userId },
              select: { branchId: true }
            });
            branchId = employee?.branchId || null;
          }
        }

        // Build where clause for branch filtering
        const whereClause = branchId ? { branchId } : {};

        // Get total employees count
        const totalEmployees = await prisma.employee.count({
          where: whereClause
        });

        // Get previous month's employee count for comparison
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const previousMonthEmployees = await prisma.employee.count({
          where: {
            ...whereClause,
            joiningDate: { lt: oneMonthAgo }
          }
        });

        // Calculate employee growth percentage
        const employeeGrowth = previousMonthEmployees > 0
          ? Math.round(((totalEmployees - previousMonthEmployees) / previousMonthEmployees) * 100)
          : 0;

        // Get today's date at midnight for attendance calculations
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's attendance
        const todayAttendance = await prisma.attendance.count({
          where: {
            date: {
              gte: today,
              lt: tomorrow
            },
            employee: whereClause,
            status: 'Present'
          }
        });

        // Calculate attendance percentage
        const attendancePercentage = totalEmployees > 0
          ? Math.round((todayAttendance / totalEmployees) * 100)
          : 0;

        // Get yesterday's attendance for comparison
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayAttendance = await prisma.attendance.count({
          where: {
            date: {
              gte: yesterday,
              lt: today
            },
            employee: whereClause,
            status: 'Present'
          }
        });

        // Calculate attendance change
        const yesterdayPercentage = totalEmployees > 0
          ? Math.round((yesterdayAttendance / totalEmployees) * 100)
          : 0;

        const attendanceChange = attendancePercentage - yesterdayPercentage;

        // Get open positions count
        // This would typically come from a job postings table, but we'll simulate it
        // In a real application, you would have a JobPosting model
        const openPositions = 12; // Placeholder
        const openPositionsChange = -3; // Placeholder

        // Get upcoming reviews
        // This would typically come from a performance reviews table, but we'll simulate it
        // In a real application, you would have a PerformanceReview model
        const upcomingReviews = 8; // Placeholder
        const reviewsChange = 2; // Placeholder

        // Get recent activity
        const recentActivity = await prisma.activityLog.findMany({
          where: {
            // Filter by branch if applicable
            ...(branchId ? {
              user: {
                OR: [
                  { employee: { branchId } },
                  { branchManager: { branchId } },
                  { branchAdmin: { branchId } }
                ]
              }
            } : {})
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: 5
        });

        // Format the activity data
        const formattedActivity = recentActivity.map(activity => {
          const timeAgo = getTimeAgo(activity.timestamp);
          return {
            id: activity.id,
            user: `${activity.user.firstName} ${activity.user.lastName}`,
            action: activity.action,
            details: activity.details,
            time: timeAgo
          };
        });

        // Return the dashboard data
        return NextResponse.json({
          stats: {
            totalEmployees: {
              value: totalEmployees,
              change: `${employeeGrowth > 0 ? '+' : ''}${employeeGrowth}%`
            },
            attendanceToday: {
              value: `${attendancePercentage}%`,
              change: `${attendanceChange > 0 ? '+' : ''}${attendanceChange}%`
            },
            openPositions: {
              value: openPositions,
              change: `${openPositionsChange}`
            },
            upcomingReviews: {
              value: upcomingReviews,
              change: `${reviewsChange > 0 ? '+' : ''}${reviewsChange}`
            }
          },
          recentActivity: formattedActivity
        });
      } catch (dbError) {
        console.error('Database error:', dbError);

        return NextResponse.json(
          { error: 'Database connection error. Please make sure PostgreSQL is running and properly set up.' },
          { status: 503 }
        );
      } finally {
        // Disconnect from the database to prevent connection leaks
        await prisma.$disconnect().catch(console.error);
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) {
    return `${diffSec} seconds ago`;
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffDay < 30) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
