'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import React from 'react';
import {
  ArrowLeftIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CreditCardIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: string;
  profileImage?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  panCard?: string;
  aadharCard?: string;
  branch: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  };
}

export default function EmployeePreviewPage({ params }: { params: { id: string } }) {
  const unwrappedParams = React.use(params as any) as { id: string };
  const employeeId = unwrappedParams.id;
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        if (!employeeId) {
          throw new Error('Employee ID is missing');
        }

        const response = await axios.get(`/api/employees/${employeeId}`);
        setEmployee(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching employee:', err);
        setError(err.response?.data?.error || 'Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="py-8 min-h-screen" style={{ backgroundColor: '#f7f7fa' }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0745fe] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading employee details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 min-h-screen" style={{ backgroundColor: '#f7f7fa' }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">Error: {error}</div>
            <Link href="/employees" className="text-[#0745fe] hover:text-[#0635d1]">
              Back to Employees
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="py-8 min-h-screen" style={{ backgroundColor: '#f7f7fa' }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">Employee not found</div>
            <Link href="/employees" className="text-[#0745fe] hover:text-[#0635d1]">
              Back to Employees
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 ring-1 ring-green-600/20';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
      case 'ON_LEAVE':
        return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
    }
  };

  return (
    <div className="py-8 min-h-screen" style={{ backgroundColor: '#f7f7fa' }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/employees"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-150"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Employees
              </Link>
            </div>
            <Link
              href={`/employees/${employeeId}`}
              className="inline-flex items-center px-4 py-2 bg-[#0745fe] text-white text-sm font-medium rounded-lg hover:bg-[#0635d1] transition-colors duration-200"
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit Employee
            </Link>
          </div>
        </div>

        {/* Employee Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-6">
            <div className="flex items-start space-x-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {employee.profileImage ? (
                  <img
                    className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-lg ring-2 ring-gray-200"
                    src={employee.profileImage}
                    alt={`${employee.firstName} ${employee.lastName}`}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#0745fe] to-[#0635d1] flex items-center justify-center border-2 border-white shadow-lg ring-2 ring-gray-200">
                    <span className="text-xl font-bold text-white">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Employee Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {employee.firstName} {employee.middleName ? `${employee.middleName} ` : ''}{employee.lastName}
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">{employee.designation}</p>
                    <p className="text-sm text-gray-500 mt-1">ID: {employee.employeeId}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(employee.status)}`}>
                    <svg className={`mr-1.5 h-2 w-2 ${
                      employee.status === 'ACTIVE'
                        ? 'fill-green-500'
                        : employee.status === 'INACTIVE'
                        ? 'fill-gray-500'
                        : employee.status === 'SUSPENDED'
                        ? 'fill-red-500'
                        : employee.status === 'ON_LEAVE'
                        ? 'fill-yellow-500'
                        : 'fill-gray-500'
                    }`} viewBox="0 0 6 6" aria-hidden="true">
                      <circle cx={3} cy={3} r={3} />
                    </svg>
                    {employee.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Department and Branch */}
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    {employee.department}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {employee.branch.name}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Joined {formatDate(employee.joiningDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{employee.email}</dd>
              </div>
              {employee.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{employee.phone}</dd>
                </div>
              )}
              {employee.address && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{employee.address}</dd>
                </div>
              )}
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Work Information</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{employee.department}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">{employee.designation}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Branch</dt>
                <dd className="mt-1 text-sm text-gray-900">{employee.branch.name}</dd>
              </div>
              {employee.team && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Team</dt>
                  <dd className="mt-1 text-sm text-gray-900">{employee.team.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Joining Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(employee.joiningDate)}</dd>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {employee.dateOfBirth && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(employee.dateOfBirth)}</dd>
                </div>
              )}
              {employee.gender && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900">{employee.gender}</dd>
                </div>
              )}
              {(!employee.dateOfBirth && !employee.gender) && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No personal information available</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Financial Information</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Salary</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">₹{employee.salary.toLocaleString()}</dd>
              </div>
              {employee.bankAccountNo && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bank Account</dt>
                  <dd className="mt-1 text-sm text-gray-900">****{employee.bankAccountNo.slice(-4)}</dd>
                </div>
              )}
              {employee.ifscCode && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">IFSC Code</dt>
                  <dd className="mt-1 text-sm text-gray-900">{employee.ifscCode}</dd>
                </div>
              )}
              {employee.panCard && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">PAN Card</dt>
                  <dd className="mt-1 text-sm text-gray-900">{employee.panCard}</dd>
                </div>
              )}
              {employee.aadharCard && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Aadhar Card</dt>
                  <dd className="mt-1 text-sm text-gray-900">****-****-{employee.aadharCard.slice(-4)}</dd>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
