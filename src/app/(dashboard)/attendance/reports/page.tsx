'use client';

import { useState, useEffect } from 'react';
import { DocumentChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function AttendanceReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [filters, setFilters] = useState({
    type: 'monthly',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    department: '',
    branchId: '',
    teamId: ''
  });

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('type', filters.type);
      params.append('month', filters.month.toString());
      params.append('year', filters.year.toString());
      if (filters.department) params.append('department', filters.department);
      if (filters.branchId) params.append('branchId', filters.branchId);
      if (filters.teamId) params.append('teamId', filters.teamId);

      const response = await axios.get(`/api/attendance/reports?${params.toString()}`);
      setReportData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(err.response?.data?.error || 'Failed to load attendance report. Please try again later.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchReportData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: name === 'month' || name === 'year' ? parseInt(value) : value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchReportData();
  };

  // Generate month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Generate year options (current year and 5 years back)
  const currentYearValue = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYearValue - i);

  // Export report as CSV
  const exportReportAsCSV = () => {
    if (!reportData || !reportData.employeeStats) return;

    // Create CSV header
    let csvContent = 'Employee ID,Name,Department,Present Days,Absent Days,Late Days,Leave Days,Total Work Hours,Attendance %\n';

    // Add data rows
    reportData.employeeStats.forEach((stat: any) => {
      const row = [
        stat.employeeCode,
        stat.name,
        stat.department,
        stat.presentDays,
        stat.absentDays,
        stat.lateDays,
        stat.leaveDays,
        stat.totalWorkHours,
        stat.attendancePercentage
      ].join(',');

      csvContent += row + '\n';
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${filters.month}_${filters.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Attendance Reports</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        {/* Filters */}
        <div className="mt-6 bg-white shadow rounded-md p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Report Type
              </label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="monthly">Monthly Report</option>
                <option value="yearly">Yearly Report</option>
              </select>
            </div>

            {filters.type === 'monthly' && (
              <div className="sm:col-span-2">
                <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                  Month
                </label>
                <select
                  id="month"
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="sm:col-span-2">
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Year
              </label>
              <select
                id="year"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-6 flex justify-end">
              <button
                type="button"
                onClick={applyFilters}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <DocumentChartBarIcon className="-ml-1 mr-2 h-5 w-5" />
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-center">
                <p className="text-gray-500">Loading report data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          ) : reportData ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {filters.type === 'monthly'
                      ? `Monthly Attendance Report - ${monthOptions.find(m => m.value === filters.month)?.label} ${filters.year}`
                      : `Yearly Attendance Report - ${filters.year}`
                    }
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Summary of attendance for {reportData.summary.totalEmployees} employees
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportReportAsCSV}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                  Export CSV
                </button>
              </div>

              {/* Summary Stats */}
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Average Attendance</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{reportData.summary.avgAttendancePercentage}%</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Present Days</dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">{reportData.summary.totalPresentDays}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Absent Days</dt>
                    <dd className="mt-1 text-3xl font-semibold text-red-600">{reportData.summary.totalAbsentDays}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Late Days</dt>
                    <dd className="mt-1 text-3xl font-semibold text-yellow-600">{reportData.summary.totalLateDays}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Total Work Hours</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{reportData.summary.totalWorkHours}</dd>
                  </div>
                </dl>
              </div>

              {/* Employee Stats Table */}
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Employee Attendance Details</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Employee</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Department</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Present</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Absent</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Late</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Leave</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Work Hours</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {reportData.employeeStats.map((stat: any) => (
                        <tr key={stat.employeeId}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="font-medium text-gray-900">{stat.name}</div>
                              <div className="text-gray-500 ml-1">({stat.employeeCode})</div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.department}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.presentDays}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.absentDays}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.lateDays}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.leaveDays}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.totalWorkHours}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    stat.attendancePercentage >= 90 ? 'bg-green-600' :
                                    stat.attendancePercentage >= 75 ? 'bg-yellow-400' : 'bg-red-600'
                                  }`}
                                  style={{ width: `${stat.attendancePercentage}%` }}
                                ></div>
                              </div>
                              <span className="ml-2">{stat.attendancePercentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Report Generated</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select the report parameters and click "Generate Report" to view attendance data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
