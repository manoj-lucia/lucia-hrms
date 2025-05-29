import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET: Get current attendance status for the logged-in user
export async function GET(request: NextRequest) {
  try {
    // Protect route - only authenticated users can access their attendance status
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        // Get the employee record for the authenticated user
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

        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Get today's attendance records for this employee
        const todayAttendance = await prisma.attendance.findMany({
          where: {
            employeeId: employee.id,
            date: {
              gte: startOfDay,
              lt: endOfDay
            }
          },
          orderBy: {
            checkIn: 'desc'
          },
          take: 1
        });

        let status = 'checked-out';
        let lastAction = null;

        if (todayAttendance.length > 0) {
          const latestRecord = todayAttendance[0];

          // If there's a check-in but no check-out, user is checked in
          if (latestRecord.checkIn && !latestRecord.checkOut) {
            status = 'checked-in';
            lastAction = {
              action: 'check-in',
              timestamp: latestRecord.checkIn.toISOString(),
              location: 'Office' // Default location since schema doesn't have location fields
            };
          } else if (latestRecord.checkOut) {
            status = 'checked-out';
            lastAction = {
              action: 'check-out',
              timestamp: latestRecord.checkOut.toISOString(),
              location: 'Office' // Default location since schema doesn't have location fields
            };
          }
        }

        return NextResponse.json({
          status,
          lastAction,
          employeeId: employee.id,
          date: today.toISOString().split('T')[0]
        });

      } catch (dbError: any) {
        console.error('Database error in attendance current route:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error fetching current attendance status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
