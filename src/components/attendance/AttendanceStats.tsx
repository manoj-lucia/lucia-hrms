'use client';

import { ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface AttendanceStatsProps {
  data: any[];
}

export default function AttendanceStats({ data }: AttendanceStatsProps) {
  // Calculate statistics from attendance data
  const calculateStats = () => {
    if (!data || data.length === 0) {
      return {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        attendanceRate: 0,
        totalHours: 0,
        averageHours: 0
      };
    }

    const totalDays = data.length;
    const presentDays = data.filter(record => record.status === 'PRESENT').length;
    const absentDays = data.filter(record => record.status === 'ABSENT').length;
    const lateDays = data.filter(record => record.status === 'LATE').length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Calculate total hours worked
    const totalHours = data.reduce((sum, record) => {
      if (record.checkIn && record.checkOut) {
        const checkIn = new Date(record.checkIn);
        const checkOut = new Date(record.checkOut);
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    const averageHours = presentDays > 0 ? totalHours / presentDays : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendanceRate,
      totalHours,
      averageHours
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: 'Total Days',
      value: stats.totalDays,
      icon: ClockIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Present Days',
      value: stats.presentDays,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Absent Days',
      value: stats.absentDays,
      icon: XCircleIcon,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Late Days',
      value: stats.lateDays,
      icon: ExclamationCircleIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Basic Stats Cards */}
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Attendance Rate Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Attendance Rate</p>
            <div className="flex items-center mt-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stats.attendanceRate, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.attendanceRate.toFixed(1)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Hours/Day</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {stats.averageHours.toFixed(1)}h
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">Total Hours Worked</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">
            {stats.totalHours.toFixed(1)} hours
          </p>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            <ClockIcon className="w-4 h-4 mr-2" />
            View Reports
          </button>
          <button className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200">
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
        
        {/* Performance Indicator */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Performance</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              stats.attendanceRate >= 95 
                ? 'bg-green-100 text-green-800'
                : stats.attendanceRate >= 85
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {stats.attendanceRate >= 95 
                ? 'Excellent'
                : stats.attendanceRate >= 85
                ? 'Good'
                : 'Needs Improvement'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
