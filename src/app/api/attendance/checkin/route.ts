import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// POST: Handle check-in and check-out
export async function POST(request: NextRequest) {
  try {
    // Protect route - only authenticated users can check in/out
    const authResult = await protectRoute(request);

    if (!(authResult instanceof NextResponse)) {
      try {
        const { action, location, timestamp } = await request.json();

        // Validate required fields
        if (!action || !['check-in', 'check-out'].includes(action)) {
          return NextResponse.json(
            { error: 'Invalid action. Must be "check-in" or "check-out"' },
            { status: 400 }
          );
        }

        // Get the employee record for the authenticated user
        const employee = await prisma.employee.findUnique({
          where: { userId: authResult.id },
          select: { id: true, firstName: true, lastName: true }
        });

        if (!employee) {
          return NextResponse.json(
            { error: 'Employee record not found' },
            { status: 404 }
          );
        }

        const now = new Date(timestamp || new Date());
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        if (action === 'check-in') {
          // Check if already checked in today
          const existingCheckIn = await prisma.attendance.findFirst({
            where: {
              employeeId: employee.id,
              date: {
                gte: today,
                lt: endOfDay
              },
              checkIn: { not: null },
              checkOut: null
            }
          });

          if (existingCheckIn) {
            return NextResponse.json(
              { error: 'Already checked in today' },
              { status: 400 }
            );
          }

          // Create new attendance record
          const attendance = await prisma.attendance.create({
            data: {
              employeeId: employee.id,
              date: today,
              checkIn: now,
              status: 'Present'
            }
          });

          return NextResponse.json({
            success: true,
            message: 'Checked in successfully',
            attendance: {
              id: attendance.id,
              checkIn: attendance.checkIn,
              location: location || 'Office'
            }
          });

        } else if (action === 'check-out') {
          // Find today's check-in record without check-out
          const attendanceRecord = await prisma.attendance.findFirst({
            where: {
              employeeId: employee.id,
              date: {
                gte: today,
                lt: endOfDay
              },
              checkIn: { not: null },
              checkOut: null
            }
          });

          if (!attendanceRecord) {
            return NextResponse.json(
              { error: 'No check-in record found for today' },
              { status: 400 }
            );
          }

          // Calculate hours worked
          const checkInTime = new Date(attendanceRecord.checkIn!);
          const checkOutTime = now;
          const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

          // Update attendance record with check-out
          const updatedAttendance = await prisma.attendance.update({
            where: { id: attendanceRecord.id },
            data: {
              checkOut: checkOutTime,
              workHours: Math.round(hoursWorked * 100) / 100 // Round to 2 decimal places
            }
          });

          return NextResponse.json({
            success: true,
            message: 'Checked out successfully',
            attendance: {
              id: updatedAttendance.id,
              checkIn: updatedAttendance.checkIn,
              checkOut: updatedAttendance.checkOut,
              workHours: updatedAttendance.workHours,
              location: location || 'Office'
            }
          });
        }

      } catch (dbError: any) {
        console.error('Database error in attendance checkin route:', dbError);
        return NextResponse.json(
          { error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return authResult;
  } catch (error) {
    console.error('Error processing attendance check-in/out:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
