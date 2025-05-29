'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CalendarDaysIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import axios from 'axios';

interface LeaveBalance {
  id: string;
  leaveType: string;
  totalAllowed: number;
  used: number;
  pending: number;
  available: number;
  carriedForward: number;
}

export default function LeaveRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    leaveType: '',
    priority: 'MEDIUM',
    startDate: '',
    endDate: '',
    reason: '',
    attachmentUrl: ''
  });
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    fetchLeaveBalances();
  }, []);

  useEffect(() => {
    calculateTotalDays();
  }, [formData.startDate, formData.endDate]);

  const fetchLeaveBalances = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leave/balance');
      if (response.data.success) {
        setLeaveBalances(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching leave balances:', err);
      setError('Failed to load leave balances');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      setTotalDays(days > 0 ? days : 0);
    } else {
      setTotalDays(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }

    if (totalDays <= 0) {
      setError('End date must be after start date');
      return;
    }

    // Check if user has sufficient leave balance
    const selectedBalance = leaveBalances.find(b => b.leaveType === formData.leaveType);
    if (selectedBalance && totalDays > selectedBalance.available) {
      setError(`Insufficient leave balance. You have ${selectedBalance.available} days available.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await axios.post('/api/leave/request', {
        ...formData,
        totalDays
      });

      if (response.data.success) {
        router.push('/leave?tab=requests');
      } else {
        setError(response.data.error || 'Failed to submit leave request');
      }
    } catch (err: any) {
      console.error('Error submitting leave request:', err);
      setError(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatLeaveType = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSelectedBalance = () => {
    return leaveBalances.find(b => b.leaveType === formData.leaveType);
  };

  const selectedBalance = getSelectedBalance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/leave"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Leave Request</h1>
          <p className="mt-1 text-sm text-gray-500">
            Submit a new leave request for approval
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type *
                  </label>
                  <select
                    id="leaveType"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                  >
                    <option value="">Select leave type</option>
                    {leaveBalances.map((balance) => (
                      <option key={balance.id} value={balance.leaveType}>
                        {formatLeaveType(balance.leaveType)} ({balance.available} days available)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                  />
                </div>
              </div>

              {totalDays > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      Total Days: {totalDays} day{totalDays > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  placeholder="Please provide a detailed reason for your leave request..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="attachmentUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Document (Optional)
                </label>
                <div className="flex items-center space-x-2">
                  <DocumentArrowUpIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    id="attachmentUrl"
                    name="attachmentUrl"
                    value={formData.attachmentUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/document.pdf"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Upload medical certificates or other supporting documents (URL)
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href="/leave"
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason}
                className="px-6 py-2 bg-[#0745fe] text-white rounded-lg hover:bg-[#0635d1] focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leave Balance Summary */}
          {selectedBalance && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {formatLeaveType(selectedBalance.leaveType)} Balance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Allowed:</span>
                  <span className="text-sm font-medium">{selectedBalance.totalAllowed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Used:</span>
                  <span className="text-sm font-medium text-red-600">{selectedBalance.used}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Pending:</span>
                  <span className="text-sm font-medium text-yellow-600">{selectedBalance.pending}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-sm font-medium text-gray-900">Available:</span>
                  <span className="text-sm font-bold text-[#0745fe]">{selectedBalance.available}</span>
                </div>
              </div>
              
              {totalDays > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>After this request:</span>
                    <span className={`font-medium ${
                      selectedBalance.available - totalDays >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedBalance.available - totalDays} days
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Guidelines</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="w-2 h-2 bg-[#0745fe] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Submit requests at least 3 days in advance for planned leave</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-[#0745fe] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Provide medical certificates for sick leave exceeding 3 days</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-[#0745fe] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Emergency leave requires immediate supervisor approval</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-[#0745fe] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>All leave requests require two-tier approval process</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
