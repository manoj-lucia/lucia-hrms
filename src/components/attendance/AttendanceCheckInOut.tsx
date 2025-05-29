'use client';

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface AttendanceCheckInOutProps {
  onSuccess?: () => void;
}

export default function AttendanceCheckInOut({ onSuccess }: AttendanceCheckInOutProps) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'checked-out' | 'checked-in'>('checked-out');
  const [lastAction, setLastAction] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);



  // Fetch current attendance status
  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      const response = await axios.get('/api/attendance/current');
      if (response.data) {
        setCurrentStatus(response.data.status);
        setLastAction(response.data.lastAction);
      }
    } catch (error) {
      console.error('Error fetching current status:', error);
    }
  };

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      setLoading(true);

      const response = await axios.post('/api/attendance/checkin', {
        action: 'check-in',
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        setCurrentStatus('checked-in');
        setLastAction({
          action: 'check-in',
          timestamp: new Date().toISOString()
        });

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    try {
      setLoading(true);

      const response = await axios.post('/api/attendance/checkin', {
        action: 'check-out',
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        setCurrentStatus('checked-out');
        setLastAction({
          action: 'check-out',
          timestamp: new Date().toISOString()
        });

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error during check-out:', error);
      alert('Failed to check out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left: Time & Status */}
          <div className="flex items-center space-x-4">
            <div>
              <div className="text-2xl font-bold text-gray-900 font-mono">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(currentTime)}
              </div>
            </div>

            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              currentStatus === 'checked-in'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                currentStatus === 'checked-in' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              }`}></div>
              {currentStatus === 'checked-in' ? 'Working' : 'Not Working'}
            </div>
          </div>

          {/* Center: Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleCheckIn}
              disabled={loading || currentStatus === 'checked-in'}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                currentStatus === 'checked-out' && !loading
                  ? 'bg-[#0745fe] hover:bg-[#0635d1] text-white focus:ring-[#0745fe]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-2">
                {loading && currentStatus === 'checked-out' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
                <span>Check In</span>
              </div>
            </button>

            <button
              onClick={handleCheckOut}
              disabled={loading || currentStatus === 'checked-out'}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                currentStatus === 'checked-in' && !loading
                  ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-2">
                {loading && currentStatus === 'checked-in' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <StopIcon className="w-4 h-4" />
                )}
                <span>Check Out</span>
              </div>
            </button>
          </div>

          {/* Right: Today's Summary */}
          <div className="text-right">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Today's Summary</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Started at</span>
                </div>
                <span className="font-medium text-gray-900">
                  {lastAction?.action === 'check-in' ? new Date(lastAction.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                </span>
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Ended at</span>
                </div>
                <span className="font-medium text-gray-900">
                  {lastAction?.action === 'check-out' ? new Date(lastAction.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                </span>
              </div>

              <div className="flex items-center justify-between space-x-4 pt-1 border-t border-gray-200">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-3 h-3 text-[#0745fe]" />
                  <span className="text-gray-900 font-medium">Total Hours</span>
                </div>
                <span className="font-bold text-[#0745fe]">
                  {currentStatus === 'checked-in' && lastAction?.action === 'check-in'
                    ? `${Math.floor((new Date().getTime() - new Date(lastAction.timestamp).getTime()) / (1000 * 60 * 60))}h ${Math.floor(((new Date().getTime() - new Date(lastAction.timestamp).getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m`
                    : '0h 0m'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Last Action Info */}
        {lastAction && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-1 rounded ${
                  lastAction.action === 'check-in' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {lastAction.action === 'check-in' ? (
                    <CheckCircleIcon className="w-3 h-3 text-green-600" />
                  ) : (
                    <StopIcon className="w-3 h-3 text-red-600" />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-900">
                  {lastAction.action === 'check-in' ? 'Last Check-in' : 'Last Check-out'}
                </span>
              </div>
              <span className="text-xs text-gray-600">
                {new Date(lastAction.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
