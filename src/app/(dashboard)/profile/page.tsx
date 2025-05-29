'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UserIcon,
  PencilIcon,
  CogIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

interface UserProfile {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    emergencyContact: string;
    avatar?: string;
  };
  professional: {
    employeeId: string;
    designation: string;
    department: string;
    joiningDate: string;
    reportingManager: string;
    workLocation: string;
    employmentType: string;
    skills: string[];
  };
  settings: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'team' | 'private';
      showContactInfo: boolean;
    };
    preferences: {
      language: string;
      timezone: string;
      theme: 'light' | 'dark' | 'auto';
    };
  };
}

const mockProfile: UserProfile = {
  personal: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+91 9876543210',
    dateOfBirth: '1990-05-15',
    address: '123 Main Street, Bangalore, Karnataka 560001',
    emergencyContact: 'Jane Doe - +91 9876543211 (Spouse)',
  },
  professional: {
    employeeId: 'EMP001',
    designation: 'Senior Software Developer',
    department: 'Engineering',
    joiningDate: '2022-03-15',
    reportingManager: 'Jane Smith',
    workLocation: 'Bangalore Office',
    employmentType: 'Full-time',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker'],
  },
  settings: {
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    privacy: {
      profileVisibility: 'team',
      showContactInfo: true,
    },
    preferences: {
      language: 'English',
      timezone: 'Asia/Kolkata',
      theme: 'light',
    },
  },
};

export default function ProfilePage() {
  const [profile] = useState<UserProfile>(mockProfile);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const calculateTenure = (joiningDate: string) => {
    const joining = new Date(joiningDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joining.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information, professional details, and account settings
          </p>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-[#0745fe] to-[#0635d1] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {getInitials(profile.personal.firstName, profile.personal.lastName)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.personal.firstName} {profile.personal.lastName}
                </h2>
                <p className="text-lg text-gray-600">{profile.professional.designation}</p>
                <p className="text-sm text-gray-500">{profile.professional.department}</p>
              </div>
              <Link
                href="/profile/personal"
                className="inline-flex items-center px-4 py-2 bg-[#0745fe] text-white text-sm font-medium rounded-lg hover:bg-[#0635d1] transition-colors duration-200"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <EnvelopeIcon className="w-4 h-4" />
                <span>{profile.personal.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <PhoneIcon className="w-4 h-4" />
                <span>{profile.personal.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <BuildingOfficeIcon className="w-4 h-4" />
                <span>{profile.professional.workLocation}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4" />
                <span>Joined {new Date(profile.professional.joiningDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BriefcaseIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tenure</p>
              <p className="text-lg font-bold text-gray-900">
                {calculateTenure(profile.professional.joiningDate)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Employee ID</p>
              <p className="text-lg font-bold text-gray-900">{profile.professional.employeeId}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CogIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Skills</p>
              <p className="text-lg font-bold text-gray-900">{profile.professional.skills.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <Link
            href="/profile/personal"
            className="text-[#0745fe] hover:text-[#0635d1] text-sm font-medium"
          >
            Edit
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
            <p className="text-sm text-gray-900">{new Date(profile.personal.dateOfBirth).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Emergency Contact</label>
            <p className="text-sm text-gray-900">{profile.personal.emergencyContact}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
            <p className="text-sm text-gray-900">{profile.personal.address}</p>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
          <Link
            href="/profile/professional"
            className="text-[#0745fe] hover:text-[#0635d1] text-sm font-medium"
          >
            Edit
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Reporting Manager</label>
            <p className="text-sm text-gray-900">{profile.professional.reportingManager}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Employment Type</label>
            <p className="text-sm text-gray-900">{profile.professional.employmentType}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Skills</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.professional.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Preview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
          <Link
            href="/profile/settings"
            className="text-[#0745fe] hover:text-[#0635d1] text-sm font-medium"
          >
            Manage
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Language</label>
            <p className="text-sm text-gray-900">{profile.settings.preferences.language}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Timezone</label>
            <p className="text-sm text-gray-900">{profile.settings.preferences.timezone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Profile Visibility</label>
            <p className="text-sm text-gray-900 capitalize">{profile.settings.privacy.profileVisibility}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/profile/personal"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Info</h3>
              <p className="text-sm text-gray-500">Update personal details</p>
            </div>
          </div>
        </Link>
        <Link
          href="/profile/professional"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
              <BriefcaseIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Professional Info</h3>
              <p className="text-sm text-gray-500">Manage work details</p>
            </div>
          </div>
        </Link>
        <Link
          href="/profile/settings"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
              <CogIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              <p className="text-sm text-gray-500">Account preferences</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
