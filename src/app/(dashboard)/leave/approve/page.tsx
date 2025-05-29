'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface LeaveRequest {
  id: string;
  leaveType: string;
  priority: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  createdAt: string;
  employee: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    branch: {
      name: string;
    };
    team?: {
      name: string;
    };
  };
  primaryApprover?: {
    firstName: string;
    lastName: string;
  };
}

export default function LeaveApprovePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'PENDING',
    priority: '',
    leaveType: '',
    search: ''
  });
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leaveRequests, filters]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leave/primary-approval', {
        params: { status: filters.status }
      });

      if (response.data.success) {
        setLeaveRequests(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching leave requests:', err);
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leaveRequests];

    if (filters.priority) {
      filtered = filtered.filter(req => req.priority === filters.priority);
    }

    if (filters.leaveType) {
      filtered = filtered.filter(req => req.leaveType === filters.leaveType);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(req =>
        req.employee.user.firstName.toLowerCase().includes(searchLower) ||
        req.employee.user.lastName.toLowerCase().includes(searchLower) ||
        req.employee.user.email.toLowerCase().includes(searchLower) ||
        req.reason.toLowerCase().includes(searchLower)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const openModal = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setModalAction(action);
    setComments('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setComments('');
  };

  const handleApproval = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(selectedRequest.id);

      const response = await axios.post('/api/leave/primary-approval', {
        leaveRequestId: selectedRequest.id,
        action: modalAction,
        comments: comments.trim() || undefined
      });

      if (response.data.success) {
        // Refresh the list
        await fetchLeaveRequests();
        closeModal();
      } else {
        setError(response.data.error || `Failed to ${modalAction} leave request`);
      }
    } catch (err: any) {
      console.error(`Error ${modalAction}ing leave request:`, err);
      setError(err.response?.data?.error || `Failed to ${modalAction} leave request`);
    } finally {
      setProcessing(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLeaveType = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Leave Approvals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve leave requests from your team
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => {
                handleFilterChange('status', e.target.value);
                fetchLeaveRequests();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            >
              <option value="PENDING">Pending</option>
              <option value="PRIMARY_APPROVED">Primary Approved</option>
              <option value="PRIMARY_REJECTED">Primary Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
            <select
              value={filters.leaveType}
              onChange={(e) => handleFilterChange('leaveType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="CASUAL">Casual</option>
              <option value="SICK">Sick</option>
              <option value="ANNUAL">Annual</option>
              <option value="MATERNITY">Maternity</option>
              <option value="PATERNITY">Paternity</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name or reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.status === 'PENDING'
                ? 'No pending leave requests to review.'
                : `No ${filters.status.toLowerCase().replace('_', ' ')} requests found.`}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.employee.user.firstName} {request.employee.user.lastName}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Leave Type</p>
                      <p className="font-medium">{formatLeaveType(request.leaveType)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{request.totalDays} day{request.totalDays > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dates</p>
                      <p className="font-medium">{formatDate(request.startDate)} - {formatDate(request.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Applied On</p>
                      <p className="font-medium">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Reason</p>
                    <p className="text-sm text-gray-700">{request.reason}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{request.employee.user.email}</span>
                    <span>•</span>
                    <span>{request.employee.branch.name}</span>
                    {request.employee.team && (
                      <>
                        <span>•</span>
                        <span>{request.employee.team.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => openModal(request, 'approve')}
                      disabled={processing === request.id}
                      className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => openModal(request, 'reject')}
                      disabled={processing === request.id}
                      className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approval Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              {modalAction === 'approve' ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-600" />
              )}
              <h3 className="text-lg font-medium text-gray-900">
                {modalAction === 'approve' ? 'Approve' : 'Reject'} Leave Request
              </h3>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {selectedRequest.employee.user.firstName} {selectedRequest.employee.user.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {formatLeaveType(selectedRequest.leaveType)} - {selectedRequest.totalDays} days
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(selectedRequest.startDate)} to {formatDate(selectedRequest.endDate)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments {modalAction === 'reject' ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder={modalAction === 'approve'
                  ? 'Add any comments for the employee...'
                  : 'Please provide a reason for rejection...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleApproval}
                disabled={processing === selectedRequest.id || (modalAction === 'reject' && !comments.trim())}
                className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200 ${
                  modalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {processing === selectedRequest.id ? 'Processing...' :
                  modalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
