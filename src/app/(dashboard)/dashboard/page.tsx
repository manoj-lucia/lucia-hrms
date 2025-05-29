'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  EyeIcon,
  ArrowPathIcon,
  PlusIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  UserGroupIcon as UserGroupIconSolid,
  CalendarIcon as CalendarIconSolid,
  ClockIcon as ClockIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

// Real-time dashboard data interface
interface DashboardStats {
  totalEmployees: { value: number; change: string; trend: 'up' | 'down' | 'neutral' };
  attendanceToday: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
  activeProjects: { value: number; change: string; trend: 'up' | 'down' | 'neutral' };
  pendingTasks: { value: number; change: string; trend: 'up' | 'down' | 'neutral' };
  monthlyRevenue: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
  systemHealth: { value: string; status: 'excellent' | 'good' | 'warning' | 'critical' };
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  details: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

interface QuickAction {
  name: string;
  href: string;
  icon: any;
  color: string;
  description: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      name: 'Add Employee',
      href: '/employees/add',
      icon: UserIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Register new team member'
    },
    {
      name: 'Mark Attendance',
      href: '/attendance',
      icon: ClockIcon,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Check-in/out employees'
    },
    {
      name: 'Create Document',
      href: '/document-workflow',
      icon: DocumentTextIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Start new workflow'
    },
    {
      name: 'View Reports',
      href: '/attendance/reports',
      icon: ChartBarIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Analytics & insights'
    }
  ];

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // For now, use mock data since API might not be ready
      // In production, replace this with actual API call
      const mockStats: DashboardStats = {
        totalEmployees: {
          value: 150,
          change: '+5%',
          trend: 'up'
        },
        attendanceToday: {
          value: '142/150',
          change: '+2%',
          trend: 'up'
        },
        activeProjects: {
          value: 24,
          change: '+12%',
          trend: 'up'
        },
        pendingTasks: {
          value: 156,
          change: '-8%',
          trend: 'down'
        },
        monthlyRevenue: {
          value: '₹12.5L',
          change: '+15.3%',
          trend: 'up'
        },
        systemHealth: {
          value: '98.5%',
          status: 'excellent'
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setStats(mockStats);
      setRecentActivity([]);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-red-200 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Dashboard Error</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="w-full bg-[#0745fe] text-white px-4 py-2 rounded-lg hover:bg-[#0635d1] transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Modern Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Welcome back! Here's what's happening with your organization today.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* Last Updated Indicator */}
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              Updated {lastUpdated.toLocaleTimeString()}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
        {/* Total Employees */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalEmployees.value}</p>
              <div className="flex items-center mt-2">
                {stats?.totalEmployees.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : stats?.totalEmployees.trend === 'down' ? (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                <span className={`text-sm font-medium ${
                  stats?.totalEmployees.trend === 'up' ? 'text-green-600' :
                  stats?.totalEmployees.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stats?.totalEmployees.change}
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIconSolid className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Attendance Today */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Attendance Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.attendanceToday.value}</p>
              <div className="flex items-center mt-2">
                {stats?.attendanceToday.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : stats?.attendanceToday.trend === 'down' ? (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                <span className={`text-sm font-medium ${
                  stats?.attendanceToday.trend === 'up' ? 'text-green-600' :
                  stats?.attendanceToday.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stats?.attendanceToday.change}
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarIconSolid className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeProjects.value}</p>
              <div className="flex items-center mt-2">
                {stats?.activeProjects.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : stats?.activeProjects.trend === 'down' ? (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                <span className={`text-sm font-medium ${
                  stats?.activeProjects.trend === 'up' ? 'text-green-600' :
                  stats?.activeProjects.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stats?.activeProjects.change}
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIconSolid className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingTasks.value}</p>
              <div className="flex items-center mt-2">
                {stats?.pendingTasks.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 mr-1" />
                ) : stats?.pendingTasks.trend === 'down' ? (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : null}
                <span className={`text-sm font-medium ${
                  stats?.pendingTasks.trend === 'up' ? 'text-red-600' :
                  stats?.pendingTasks.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {stats?.pendingTasks.change}
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ClockIconSolid className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.monthlyRevenue.value}</p>
              <div className="flex items-center mt-2">
                {stats?.monthlyRevenue.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : stats?.monthlyRevenue.trend === 'down' ? (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                <span className={`text-sm font-medium ${
                  stats?.monthlyRevenue.trend === 'up' ? 'text-green-600' :
                  stats?.monthlyRevenue.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stats?.monthlyRevenue.change}
                </span>
              </div>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">System Health</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.systemHealth.value}</p>
              <div className="flex items-center mt-2">
                {stats?.systemHealth.status === 'excellent' ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : stats?.systemHealth.status === 'good' ? (
                  <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-1" />
                ) : stats?.systemHealth.status === 'warning' ? (
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stats?.systemHealth.status === 'excellent' ? 'text-green-600' :
                  stats?.systemHealth.status === 'good' ? 'text-blue-600' :
                  stats?.systemHealth.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stats?.systemHealth.status ? stats.systemHealth.status.charAt(0).toUpperCase() + stats.systemHealth.status.slice(1) : 'Unknown'}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${
              stats?.systemHealth.status === 'excellent' ? 'bg-green-100' :
              stats?.systemHealth.status === 'good' ? 'bg-blue-100' :
              stats?.systemHealth.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Cog6ToothIcon className={`h-6 w-6 ${
                stats?.systemHealth.status === 'excellent' ? 'text-green-600' :
                stats?.systemHealth.status === 'good' ? 'text-blue-600' :
                stats?.systemHealth.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <PlusIcon className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
                >
                  <div className={`p-2 rounded-lg ${action.color} transition-all duration-200`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#0745fe] transition-colors duration-200">
                      {action.name}
                    </p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                  <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed maxItems={8} />
        </div>
      </div>

      {/* Performance Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance Trends Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Trends</h3>
            <div className="flex items-center space-x-2">
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-[#0745fe]">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
          </div>

          {/* Placeholder for Chart */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Attendance Chart</p>
              <p className="text-xs text-gray-500">Interactive chart coming soon</p>
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
            <Link
              href="/reports/departments"
              className="text-sm text-[#0745fe] hover:text-[#0635d1] font-medium transition-colors duration-200"
            >
              View Details
            </Link>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Engineering', performance: 95, color: 'bg-green-500' },
              { name: 'Sales', performance: 88, color: 'bg-blue-500' },
              { name: 'Marketing', performance: 92, color: 'bg-purple-500' },
              { name: 'HR', performance: 85, color: 'bg-orange-500' },
              { name: 'Finance', performance: 90, color: 'bg-emerald-500' }
            ].map((dept) => (
              <div key={dept.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                  <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${dept.color}`}
                      style={{ width: `${dept.performance}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8">{dept.performance}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications & Alerts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">System Notifications</h3>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              3 Critical
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              5 Warnings
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Critical Alert */}
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm font-medium text-red-800">Critical</span>
            </div>
            <p className="text-sm text-red-700">Database backup failed</p>
            <p className="text-xs text-red-600 mt-1">2 minutes ago</p>
          </div>

          {/* Warning Alert */}
          <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-yellow-800">Warning</span>
            </div>
            <p className="text-sm text-yellow-700">High server load detected</p>
            <p className="text-xs text-yellow-600 mt-1">15 minutes ago</p>
          </div>

          {/* Info Alert */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center mb-2">
              <BellIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-800">Info</span>
            </div>
            <p className="text-sm text-blue-700">System maintenance scheduled</p>
            <p className="text-xs text-blue-600 mt-1">1 hour ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}