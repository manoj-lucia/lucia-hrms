'use client';

import { useState, useEffect } from 'react';
import {
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  user: string;
  action: string;
  details: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'error';
  icon?: string;
}

// Mock real-time activity data
const generateMockActivity = (): Activity[] => {
  const activities = [
    {
      id: '1',
      user: 'John Doe',
      action: 'checked in',
      details: 'Engineering Department',
      time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      type: 'success' as const,
      icon: 'clock'
    },
    {
      id: '2',
      user: 'Sarah Wilson',
      action: 'submitted leave request',
      details: 'Annual leave from Dec 25-30',
      time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: 'info' as const,
      icon: 'document'
    },
    {
      id: '3',
      user: 'Mike Johnson',
      action: 'completed task',
      details: 'Q4 Financial Report',
      time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'success' as const,
      icon: 'check'
    },
    {
      id: '4',
      user: 'System',
      action: 'backup completed',
      details: 'Daily database backup successful',
      time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      type: 'success' as const,
      icon: 'check'
    },
    {
      id: '5',
      user: 'Emma Davis',
      action: 'updated profile',
      details: 'Changed contact information',
      time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      type: 'info' as const,
      icon: 'user'
    },
    {
      id: '6',
      user: 'System',
      action: 'detected anomaly',
      details: 'Unusual login pattern detected',
      time: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      type: 'warning' as const,
      icon: 'warning'
    }
  ];

  return activities;
};

interface ActivityFeedProps {
  className?: string;
  maxItems?: number;
  showHeader?: boolean;
  autoRefresh?: boolean;
}

export default function ActivityFeed({
  className = '',
  maxItems = 10,
  showHeader = true,
  autoRefresh = true
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch activities
  const fetchActivities = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      // Simulate API call - in real app, this would be an actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockData = generateMockActivity();
      setActivities(mockData.slice(0, maxItems));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchActivities(true);
  };

  // Auto-refresh setup
  useEffect(() => {
    fetchActivities();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchActivities(true);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [maxItems, autoRefresh]);

  // Format time ago
  const formatTimeAgo = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Get icon component
  const getIcon = (iconType: string, activityType: string) => {
    const iconClass = `h-4 w-4 ${
      activityType === 'success' ? 'text-green-600' :
      activityType === 'warning' ? 'text-yellow-600' :
      activityType === 'error' ? 'text-red-600' : 'text-blue-600'
    }`;

    switch (iconType) {
      case 'clock':
        return <ClockIcon className={iconClass} />;
      case 'document':
        return <DocumentTextIcon className={iconClass} />;
      case 'check':
        return <CheckCircleIcon className={iconClass} />;
      case 'warning':
        return <ExclamationTriangleIcon className={iconClass} />;
      case 'error':
        return <XCircleIcon className={iconClass} />;
      case 'user':
        return <UserIcon className={iconClass} />;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
        )}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="flex items-center space-x-3">
            {/* Live indicator */}
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>

            {/* Last updated */}
            <span className="text-xs text-gray-400">
              {lastUpdated.toLocaleTimeString()}
            </span>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                activity.type === 'success' ? 'bg-green-100' :
                activity.type === 'warning' ? 'bg-yellow-100' :
                activity.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {getIcon(activity.icon || 'bell', activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  <span className="font-semibold">{activity.user}</span> {activity.action}
                </p>
                {activity.details && (
                  <p className="text-sm text-gray-500 mt-1">{activity.details}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.time)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
