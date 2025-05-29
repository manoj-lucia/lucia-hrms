'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PaperAirplaneIcon, DocumentIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface FormData {
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetType: 'INDIVIDUAL' | 'BRANCH' | 'TEAM' | 'ROLE' | 'ALL';
  targetValue: string;
  scheduledAt: string;
}

interface TargetOption {
  id: string;
  name: string;
  email?: string;
}

export default function CreateNotificationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    message: '',
    priority: 'MEDIUM',
    targetType: 'ALL',
    targetValue: '',
    scheduledAt: ''
  });

  const [targetOptions, setTargetOptions] = useState<TargetOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formData.targetType !== 'ALL') {
      fetchTargetOptions();
    }
  }, [formData.targetType]);

  const fetchTargetOptions = async () => {
    try {
      setLoading(true);
      let endpoint = '';

      switch (formData.targetType) {
        case 'INDIVIDUAL':
          endpoint = '/api/employees?limit=100';
          break;
        case 'BRANCH':
          endpoint = '/api/branches';
          break;
        case 'TEAM':
          endpoint = '/api/teams';
          break;
        case 'ROLE':
          // Static role options
          setTargetOptions([
            { id: 'EMPLOYEE', name: 'Employee' },
            { id: 'TEAM_LEADER', name: 'Team Leader' },
            { id: 'BRANCH_ADMIN', name: 'Branch Admin' },
            { id: 'BRANCH_MANAGER', name: 'Branch Manager' },
            { id: 'HR', name: 'HR' },
            { id: 'SUPER_ADMIN', name: 'Super Admin' }
          ]);
          setLoading(false);
          return;
      }

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();

        if (formData.targetType === 'INDIVIDUAL') {
          setTargetOptions(data.employees?.map((emp: any) => ({
            id: emp.user.id,
            name: `${emp.user.firstName} ${emp.user.lastName}`,
            email: emp.user.email
          })) || []);
        } else {
          setTargetOptions(data.branches || data.teams || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch target options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.message.trim()) {
        throw new Error('Title and message are required');
      }

      if (formData.targetType !== 'ALL' && !formData.targetValue) {
        throw new Error('Please select a target');
      }

      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        priority: formData.priority,
        targetType: formData.targetType,
        targetValue: formData.targetType === 'ALL' ? null : formData.targetValue,
        scheduledAt: isDraft ? null : (formData.scheduledAt || null)
      };

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create notification');
      }

      const result = await response.json();

      // If not a draft and not scheduled, send immediately
      if (!isDraft && !formData.scheduledAt) {
        await fetch('/api/admin/notifications/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ campaignId: result.campaign.id }),
        });
      }

      router.push('/admin/notifications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetLabel = () => {
    switch (formData.targetType) {
      case 'INDIVIDUAL':
        return 'Select Employee';
      case 'BRANCH':
        return 'Select Branch';
      case 'TEAM':
        return 'Select Team';
      case 'ROLE':
        return 'Select Role';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/notifications"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Announcement</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send targeted announcements to specific users or groups
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Announcement Details</h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                placeholder="Enter announcement title"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                placeholder="Enter your message"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Audience</h2>

          <div className="space-y-4">
            {/* Target Type */}
            <div>
              <label htmlFor="targetType" className="block text-sm font-medium text-gray-700 mb-1">
                Send To
              </label>
              <select
                id="targetType"
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value as any, targetValue: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
              >
                <option value="ALL">All Users</option>
                <option value="INDIVIDUAL">Specific Employee</option>
                <option value="BRANCH">Entire Branch</option>
                <option value="TEAM">Entire Team</option>
                <option value="ROLE">All Users with Role</option>
              </select>
            </div>

            {/* Target Value */}
            {formData.targetType !== 'ALL' && (
              <div>
                <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700 mb-1">
                  {getTargetLabel()} *
                </label>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0745fe]"></div>
                  </div>
                ) : (
                  <select
                    id="targetValue"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                    required
                  >
                    <option value="">{getTargetLabel()}</option>
                    {targetOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} {option.email && `(${option.email})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Schedule */}
            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">
                Schedule for Later (Optional)
              </label>
              <input
                type="datetime-local"
                id="scheduledAt"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to send immediately
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            <DocumentIcon className="w-4 h-4 inline mr-2" />
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#0745fe] text-white rounded-lg hover:bg-[#0635d1] transition-colors duration-200 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="w-4 h-4 inline mr-2" />
            {formData.scheduledAt ? 'Schedule' : 'Send Now'}
          </button>
        </div>
      </form>
    </div>
  );
}
