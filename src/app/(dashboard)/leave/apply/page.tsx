'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import LoadingButton from '@/components/ui/LoadingButton';

interface LeaveForm {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  emergencyContact: string;
  handoverNotes: string;
}

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', maxDays: 21, available: 13 },
  { value: 'sick', label: 'Sick Leave', maxDays: 12, available: 9 },
  { value: 'personal', label: 'Personal Leave', maxDays: 5, available: 3 },
  { value: 'maternity', label: 'Maternity Leave', maxDays: 180, available: 180 },
  { value: 'paternity', label: 'Paternity Leave', maxDays: 15, available: 15 },
  { value: 'emergency', label: 'Emergency Leave', maxDays: 3, available: 3 },
];

export default function ApplyLeavePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<LeaveForm>({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: '',
    handoverNotes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const selectedLeaveType = leaveTypes.find(type => type.value === form.type);
  const requestedDays = calculateDays();
  const isValidDuration = selectedLeaveType ? requestedDays <= selectedLeaveType.available : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Reset form and redirect
    setForm({
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
      emergencyContact: '',
      handoverNotes: ''
    });
    setIsSubmitting(false);

    // Show success message and redirect
    alert('Leave application submitted successfully!');
    router.push('/leave');
  };

  const isFormValid = form.type && form.startDate && form.endDate && form.reason && isValidDuration;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
          <p className="mt-1 text-sm text-gray-500">
            Submit your leave application with all required details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Leave Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Leave Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type *
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                required
              >
                <option value="">Select leave type</option>
                {leaveTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.available} days available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={form.startDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                required
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
                value={form.endDate}
                onChange={handleInputChange}
                min={form.startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                required
              />
            </div>

            {/* Duration Summary */}
            {form.startDate && form.endDate && (
              <div className="md:col-span-2">
                <div className={`p-4 rounded-lg border ${isValidDuration ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center space-x-2">
                    {isValidDuration ? (
                      <ClockIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${isValidDuration ? 'text-green-800' : 'text-red-800'}`}>
                        Duration: {requestedDays} day{requestedDays > 1 ? 's' : ''}
                      </p>
                      {selectedLeaveType && (
                        <p className={`text-xs ${isValidDuration ? 'text-green-600' : 'text-red-600'}`}>
                          {isValidDuration
                            ? `${selectedLeaveType.available - requestedDays} days will remain available`
                            : `Exceeds available balance of ${selectedLeaveType.available} days`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Leave *
              </label>
              <textarea
                id="reason"
                name="reason"
                value={form.reason}
                onChange={handleInputChange}
                rows={4}
                placeholder="Please provide the reason for your leave request..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <DocumentTextIcon className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={form.emergencyContact}
                onChange={handleInputChange}
                placeholder="Name and phone number of emergency contact"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="handoverNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Work Handover Notes
              </label>
              <textarea
                id="handoverNotes"
                name="handoverNotes"
                value={form.handoverNotes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Provide details about work handover, pending tasks, or coverage arrangements..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Leave Policy Reminder */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Leave Policy Reminder</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Annual leave requests should be submitted at least 2 weeks in advance</li>
                  <li>Sick leave can be applied retroactively with medical certificate</li>
                  <li>Emergency leave requires manager approval within 24 hours</li>
                  <li>Ensure proper work handover before going on leave</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            disabled={!isFormValid}
            variant="primary"
            size="lg"
            loadingText="Submitting..."
          >
            Submit Application
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
