'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, BellIcon, UserGroupIcon, BuildingOfficeIcon, UsersIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED';
  targetType: 'INDIVIDUAL' | 'BRANCH' | 'TEAM' | 'ROLE' | 'ALL';
  targetValue?: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  stats: {
    totalDeliveries: number;
    readCount: number;
    unreadCount: number;
    readRate: number;
  };
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
};

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800'
};

const targetTypeIcons = {
  INDIVIDUAL: UserGroupIcon,
  BRANCH: BuildingOfficeIcon,
  TEAM: UsersIcon,
  ROLE: UserGroupIcon,
  ALL: GlobeAltIcon
};

export default function AdminNotificationsPage() {
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'scheduled'>('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications');

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true;
    return campaign.status.toLowerCase() === filter;
  });

  const getTargetTypeLabel = (targetType: string, targetValue?: string) => {
    switch (targetType) {
      case 'INDIVIDUAL':
        return `Individual: ${targetValue || 'Unknown'}`;
      case 'BRANCH':
        return `Branch: ${targetValue || 'Unknown'}`;
      case 'TEAM':
        return `Team: ${targetValue || 'Unknown'}`;
      case 'ROLE':
        return `Role: ${targetValue || 'Unknown'}`;
      case 'ALL':
        return 'All Users';
      default:
        return targetType;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0745fe]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcement Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send targeted announcements to employees, branches, teams, or all users
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/notifications/create"
            className="inline-flex items-center px-4 py-2 bg-[#0745fe] text-white text-sm font-medium rounded-full hover:bg-[#0635d1] transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Announcement
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Campaigns' },
            { key: 'draft', label: 'Drafts' },
            { key: 'sent', label: 'Sent' },
            { key: 'scheduled', label: 'Scheduled' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-[#0745fe] text-[#0745fe]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all'
                ? 'Get started by creating your first notification campaign.'
                : `No ${filter} campaigns found.`
              }
            </p>
            {filter === 'all' && (
              <div className="mt-6">
                <Link
                  href="/admin/notifications/create"
                  className="inline-flex items-center px-4 py-2 bg-[#0745fe] text-white text-sm font-medium rounded-full hover:bg-[#0635d1] transition-colors duration-200"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Notification
                </Link>
              </div>
            )}
          </div>
        ) : (
          filteredCampaigns.map((campaign) => {
            const TargetIcon = targetTypeIcons[campaign.targetType];

            return (
              <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[campaign.priority]}`}>
                        {campaign.priority}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                        {campaign.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">{campaign.message}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <TargetIcon className="w-4 h-4 mr-1" />
                        {getTargetTypeLabel(campaign.targetType, campaign.targetValue)}
                      </div>
                      <div>
                        Created by {campaign.createdBy.firstName} {campaign.createdBy.lastName}
                      </div>
                      <div>
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {campaign.status === 'SENT' && (
                    <div className="ml-6 text-right">
                      <div className="text-sm text-gray-500 mb-1">Delivery Stats</div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">{campaign.stats.totalDeliveries}</span> sent
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-green-600">{campaign.stats.readCount}</span> read
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{campaign.stats.readRate}%</span> read rate
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
