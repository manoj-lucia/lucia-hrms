import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET: Generate attendance reports
export async function GET(request: NextRequest) {
  try {
    // Protect route - only managers and admins can access reports
    const authResult = await protectRoute(request, [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.HR,
      UserRole.BRANCH_ADMIN,
      UserRole.TEAM_LEADER
    ]);

    if (!(authResult instanceof NextResponse)) {
      try {
        // Test database connection
        await prisma.$connect().catch(error => {
          console.error('Database connection error:', error);
          throw new Error('Database connection failed');
        });

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const reportType = searchParams.get('type') || 'monthly';
        const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1 + '');
        const year = parseInt(searchParams.get('year') || new Date().getFullYear() + '');
        const departmentFilter = searchParams.get('department');
        const branchId = searchParams.get('branchId');
        const teamId = searchParams.get('teamId');

        // Build where clause based on filters and user role
        let whereEmployee: any = {};

        // Apply department filter if provided
        if (departmentFilter) {
          whereEmployee.department = departmentFilter;
        }

        // Apply branch filter if provided or based on user role
        if (branchId) {
          whereEmployee.branchId = branchId;
        } else if (authResult.role !== UserRole.SUPER_ADMIN) {
          // For non-super admins, restrict to their branch
          if (authResult.role === UserRole.BRANCH_MANAGER) {
            const branchManager = await prisma.branchManager.findUnique({
              where: { userId: authResult.id },
              select: { branchId: true }
            });

            if (branchManager?.branchId) {
              whereEmployee.branchId = branchManager.branchId;
            }
          } else if (authResult.role === UserRole.BRANCH_ADMIN) {
            const branchAdmin = await prisma.branchAdmin.findUnique({
              where: { userId: authResult.id },
              select: { branchId: true }
            });

            if (branchAdmin?.branchId) {
              whereEmployee.branchId = branchAdmin.branchId;
            }
          }
        }

        // Apply team filter if provided or based on user role
        if (teamId) {
          whereEmployee.teamId = teamId;
        } else if (authResult.role === UserRole.TEAM_LEADER) {
          const teamLeader = await prisma.teamLeader.findUnique({
            where: { userId: authResult.id },
            include: { teams: true }
          });

          if (teamLeader && teamLeader.teams.length > 0) {
            const teamIds = teamLeader.teams.map(team => team.id);
            whereEmployee.teamId = { in: teamIds };
          }
        }

        // Get all employees based on filters
        const employees = await prisma.employee.findMany({
          where: whereEmployee,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                status: true
              }
            }
          }
        });

        // Calculate date range based on report type
        let startDate: Date, endDate: Date;

        if (reportType === 'monthly') {
          startDate = new Date(year, month - 1, 1);
          endDate = new Date(year, month, 0);
        } else if (reportType === 'yearly') {
          startDate = new Date(year, 0, 1);
          endDate = new Date(year, 11, 31);
        } else {
          // Default to current month
          const now = new Date();
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        // Get attendance records for all employees in the date range
        const attendanceRecords = await prisma.attendance.findMany({
          where: {
            employeeId: { in: employees.map(emp => emp.id) },
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        });

        // Calculate statistics for each employee
        const employeeStats = employees.map(employee => {
          const employeeAttendance = attendanceRecords.filter(
            record => record.employeeId === employee.id
          );

          // Count different attendance statuses
          const presentDays = employeeAttendance.filter(record => record.status === 'Present').length;
          const absentDays = employeeAttendance.filter(record => record.status === 'Absent').length;
          const lateDays = employeeAttendance.filter(record => record.status === 'Late').length;
          const leaveDays = employeeAttendance.filter(record => record.status === 'On Leave').length;

          // Calculate total work hours
          const totalWorkHours = employeeAttendance.reduce(
            (sum, record) => sum + (record.workHours || 0),
            0
          );

          // Calculate attendance percentage
          const workingDays = getWorkingDaysInRange(startDate, endDate);
          const attendancePercentage = workingDays > 0
            ? Math.round((presentDays / workingDays) * 100)
            : 0;

          return {
            employeeId: employee.id,
            employeeCode: employee.employeeId,
            name: `${employee.user.firstName} ${employee.user.lastName}`,
            email: employee.user.email,
            department: employee.department,
            status: employee.user.status,
            presentDays,
            absentDays,
            lateDays,
            leaveDays,
            totalWorkHours,
            attendancePercentage,
            workingDays
          };
        });

        // Calculate overall statistics
        const totalEmployees = employees.length;
        const totalPresentDays = employeeStats.reduce((sum, stat) => sum + stat.presentDays, 0);
        const totalAbsentDays = employeeStats.reduce((sum, stat) => sum + stat.absentDays, 0);
        const totalLateDays = employeeStats.reduce((sum, stat) => sum + stat.lateDays, 0);
        const totalLeaveDays = employeeStats.reduce((sum, stat) => sum + stat.leaveDays, 0);
        const totalWorkHours = employeeStats.reduce((sum, stat) => sum + stat.totalWorkHours, 0);

        // Calculate average attendance percentage
        const avgAttendancePercentage = totalEmployees > 0
          ? Math.round(employeeStats.reduce((sum, stat) => sum + stat.attendancePercentage, 0) / totalEmployees)
          : 0;

        // Return the report data
        return NextResponse.json({
          reportType,
          period: {
            startDate,
            endDate,
            month,
            year
          },
          summary: {
            totalEmployees,
            totalPresentDays,
            totalAbsentDays,
            totalLateDays,
            totalLeaveDays,
            totalWorkHours,
            avgAttendancePercentage
          },
          employeeStats
        });
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
    console.error('Error generating attendance report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate working days in a date range
function getWorkingDaysInRange(startDate: Date, endDate: Date): number {
  let count = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Check if it's a weekday (Monday to Friday)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}
