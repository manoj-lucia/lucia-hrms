'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workHours: number | null;
}

interface AttendanceCalendarProps {
  attendanceData: AttendanceRecord[];
  month: number;
  year: number;
  onMonthYearChange: (month: number, year: number) => void;
}

export default function AttendanceCalendar({
  attendanceData,
  month,
  year,
  onMonthYearChange
}: AttendanceCalendarProps) {
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [currentMonthName, setCurrentMonthName] = useState('');

  // Generate calendar days for the current month
  useEffect(() => {
    generateCalendarDays();

    // Set month name
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    setCurrentMonthName(monthNames[month - 1]);
  }, [month, year, attendanceData]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();

    // Create array for all days in the month
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];

      // Find attendance record for this day
      const dayAttendance = attendanceData.find(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return recordDate === dateString;
      });

      days.push({
        day,
        date: dateString,
        isCurrentMonth: true,
        attendance: dayAttendance || null
      });
    }

    // Add empty cells for days after the last day of the month to complete the grid
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    setCalendarDays(days);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    let newMonth = month - 1;
    let newYear = year;

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    onMonthYearChange(newMonth, newYear);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    onMonthYearChange(newMonth, newYear);
  };

  // Get status color class
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'On Leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentMonthName} {year}
        </h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="grid grid-cols-7 gap-px border-b border-gray-200 bg-gray-200 text-center text-xs font-semibold text-gray-700">
          <div className="py-2">Sun</div>
          <div className="py-2">Mon</div>
          <div className="py-2">Tue</div>
          <div className="py-2">Wed</div>
          <div className="py-2">Thu</div>
          <div className="py-2">Fri</div>
          <div className="py-2">Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] bg-white p-2 ${
                !day.isCurrentMonth ? 'bg-gray-50' : ''
              }`}
            >
              {day.day && (
                <>
                  <div className="text-right text-sm font-medium text-gray-500">
                    {day.day}
                  </div>

                  {day.attendance ? (
                    <div className="mt-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColorClass(day.attendance.status)}`}>
                        {day.attendance.status}
                      </span>

                      {day.attendance.checkIn && (
                        <div className="mt-1 text-xs text-gray-500">
                          In: {new Date(day.attendance.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}

                      {day.attendance.checkOut && (
                        <div className="text-xs text-gray-500">
                          Out: {new Date(day.attendance.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}

                      {day.attendance.workHours !== null && (
                        <div className="text-xs text-gray-500">
                          Hours: {day.attendance.workHours}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-400">No data</div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
