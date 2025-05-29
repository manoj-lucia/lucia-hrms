'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, CalendarDaysIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
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
  primaryApprover?: {
    firstName: string;
    lastName: string;
  };
  finalApprover?: {
    firstName: string;
    lastName: string;
  };
}

interface LeaveBalance {
  id: string;
  leaveType: string;
  totalAllowed: number;
  used: number;
  pending: number;
  available: number;
  carriedForward: number;
}

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [requestsResponse, balancesResponse] = await Promise.all([
        axios.get('/api/leave/request'),
        axios.get('/api/leave/balance')
      ]);

      if (requestsResponse.data.success) {
        setLeaveRequests(requestsResponse.data.data);
      }

      if (balancesResponse.data.success) {
        setLeaveBalances(balancesResponse.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching leave data:', err);
      setError('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PRIMARY_APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'FINAL_APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PRIMARY_REJECTED':
      case 'FINAL_REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FINAL_APPROVED':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'PRIMARY_REJECTED':
      case 'FINAL_REJECTED':
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-yellow-600" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your leave requests and view your leave balances
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/leave/request"
            className="inline-flex items-center px-4 py-2 bg-[#0745fe] text-white text-sm font-medium rounded-full hover:bg-[#0635d1] focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:ring-offset-2 transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Leave Request
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'requests'
                ? 'border-[#0745fe] text-[#0745fe]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Requests
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'balance'
                ? 'border-[#0745fe] text-[#0745fe]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Leave Balance
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {leaveRequests.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new leave request.</p>
              <div className="mt-6">
                <Link
                  href="/leave/request"
                  className="inline-flex items-center px-4 py-2 bg-[#0745fe] text-white text-sm font-medium rounded-full hover:bg-[#0635d1] focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:ring-offset-2 transition-colors duration-200"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Leave Request
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {leaveRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatLeaveType(request.leaveType)}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <CalendarDaysIcon className="w-4 h-4 mr-1" />
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </span>
                        <span>{request.totalDays} day{request.totalDays > 1 ? 's' : ''}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{request.reason}</p>
                      {(request.primaryApprover || request.finalApprover) && (
                        <div className="mt-3 text-xs text-gray-500">
                          {request.primaryApprover && (
                            <span>Primary approved by {request.primaryApprover.firstName} {request.primaryApprover.lastName}</span>
                          )}
                          {request.finalApprover && (
                            <span className="ml-4">Final approved by {request.finalApprover.firstName} {request.finalApprover.lastName}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Applied on</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'balance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaveBalances.map((balance) => (
            <div key={balance.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {formatLeaveType(balance.leaveType)}
                </h3>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#0745fe]">{balance.available}</p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Allowed:</span>
                  <span className="font-medium">{balance.totalAllowed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Used:</span>
                  <span className="font-medium text-red-600">{balance.used}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending:</span>
                  <span className="font-medium text-yellow-600">{balance.pending}</span>
                </div>
                {balance.carriedForward > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Carried Forward:</span>
                    <span className="font-medium text-green-600">{balance.carriedForward}</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#0745fe] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (balance.used / balance.totalAllowed) * 100)}%`
                    }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500 text-center">
                  {Math.round((balance.used / balance.totalAllowed) * 100)}% used
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}


