'use client';

import { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import AttendanceCheckInOut from '@/components/attendance/AttendanceCheckInOut';
import AttendanceStats from '@/components/attendance/AttendanceStats';

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

interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending' | 'rejected';
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [leaveData, setLeaveData] = useState<LeaveRecord[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demonstration
  const mockAttendanceData: AttendanceRecord[] = [
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      date: '2024-12-20',
      checkIn: '09:00',
      checkOut: '18:00',
      status: 'Present',
      workHours: 8
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      date: '2024-12-20',
      checkIn: '09:15',
      checkOut: '17:45',
      status: 'Late',
      workHours: 7.5
    }
  ];

  const mockLeaveData: LeaveRecord[] = [
    {
      id: '1',
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      leaveType: 'Annual Leave',
      startDate: '2024-12-21',
      endDate: '2024-12-23',
      status: 'approved'
    },
    {
      id: '2',
      employeeId: 'EMP004',
      employeeName: 'Sarah Wilson',
      leaveType: 'Sick Leave',
      startDate: '2024-12-20',
      endDate: '2024-12-20',
      status: 'approved'
    }
  ];

  // Fetch attendance and leave data
  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Simulate API calls - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAttendanceData(mockAttendanceData);
      setLeaveData(mockLeaveData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [currentDate]);

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Get calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    if (!day) return { attendance: [], leaves: [] };

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const attendance = attendanceData.filter(record => record.date === dateStr);
    const leaves = leaveData.filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate && leave.status === 'approved';
    });

    return { attendance, leaves };
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Attendance Management
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                Track employee attendance, manage check-ins, and view leave schedules
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white opacity-50">
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </div>
            </div>
          </div>
        </div>

        {/* Check-in/Check-out Skeleton */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="bg-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-300 rounded-lg w-10 h-10"></div>
                  <div>
                    <div className="h-5 bg-gray-300 rounded w-32 mb-1"></div>
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="text-center space-y-4">
                  <div className="h-12 bg-gray-200 rounded w-32 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-28 mx-auto"></div>
                </div>
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, index) => (
                <div key={index} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Attendance Management
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Track employee attendance, manage check-ins, and view leave schedules
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Check-in/Check-out Section */}
      <div className="mb-8">
        <AttendanceCheckInOut onSuccess={fetchData} />
      </div>

      {/* Attendance Stats */}
      <div className="mb-8">
        <AttendanceStats data={attendanceData} />
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance & Leave Calendar
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {daysOfWeek.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-lg">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Calendar days */}
            {days.map((day, index) => {
              const events = day ? getEventsForDate(day) : { attendance: [], leaves: [] };
              const isToday = day &&
                currentDate.getFullYear() === new Date().getFullYear() &&
                currentDate.getMonth() === new Date().getMonth() &&
                day === new Date().getDate();

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 rounded-lg transition-all duration-200 ${
                    day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-[#0745fe] bg-blue-50' : ''}`}
                  onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-[#0745fe]' : 'text-gray-900'
                      }`}>
                        {day}
                      </div>

                      {/* Attendance indicators */}
                      <div className="space-y-1">
                        {events.attendance.map(record => (
                          <div
                            key={record.id}
                            className={`text-xs p-1 rounded text-white truncate ${
                              record.status === 'Present' ? 'bg-green-500' :
                              record.status === 'Late' ? 'bg-yellow-500' :
                              record.status === 'Absent' ? 'bg-red-500' : 'bg-gray-500'
                            }`}
                            title={`${record.employeeName} - ${record.status}`}
                          >
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>{record.employeeId}</span>
                            </div>
                          </div>
                        ))}

                        {/* Leave indicators */}
                        {events.leaves.map(leave => (
                          <div
                            key={leave.id}
                            className="text-xs p-1 rounded text-white truncate bg-purple-500"
                            title={`${leave.employeeName} - ${leave.leaveType}`}
                          >
                            <div className="flex items-center space-x-1">
                              <UserIcon className="w-3 h-3" />
                              <span>{leave.employeeId}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Present</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">Late</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Absent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">On Leave</span>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
          <div className="space-y-3">
            {attendanceData.filter(record => record.date === new Date().toISOString().split('T')[0]).map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    record.status === 'Present' ? 'bg-green-500' :
                    record.status === 'Late' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{record.employeeName}</p>
                    <p className="text-xs text-gray-500">{record.employeeId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{record.checkIn} - {record.checkOut || 'Active'}</p>
                  <p className="text-xs text-gray-500">{record.workHours}h</p>
                </div>
              </div>
            ))}
            {attendanceData.filter(record => record.date === new Date().toISOString().split('T')[0]).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No attendance records for today</p>
            )}
          </div>
        </div>

        {/* Today's Leaves */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Leaves</h3>
          <div className="space-y-3">
            {leaveData.filter(leave => {
              const today = new Date().toISOString().split('T')[0];
              return leave.startDate <= today && leave.endDate >= today && leave.status === 'approved';
            }).map(leave => (
              <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{leave.employeeName}</p>
                    <p className="text-xs text-gray-500">{leave.employeeId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{leave.leaveType}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {leaveData.filter(leave => {
              const today = new Date().toISOString().split('T')[0];
              return leave.startDate <= today && leave.endDate >= today && leave.status === 'approved';
            }).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No leaves for today</p>
            )}
          </div>
        </div>
      </div>



      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}