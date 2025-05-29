'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

interface Incident {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedDate: string;
  reportedBy: string;
  assignedTo?: string;
  description: string;
  location: string;
}

const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Network Security Breach Attempt',
    type: 'Security',
    severity: 'high',
    status: 'investigating',
    reportedDate: '2024-01-15',
    reportedBy: 'John Doe',
    assignedTo: 'Security Team',
    description: 'Suspicious login attempts detected from unknown IP addresses',
    location: 'Server Room'
  },
  {
    id: '2',
    title: 'Workplace Injury - Slip and Fall',
    type: 'Safety',
    severity: 'medium',
    status: 'resolved',
    reportedDate: '2024-01-12',
    reportedBy: 'Jane Smith',
    assignedTo: 'HR Team',
    description: 'Employee slipped on wet floor in cafeteria area',
    location: 'Cafeteria'
  },
  {
    id: '3',
    title: 'Equipment Malfunction',
    type: 'Equipment',
    severity: 'low',
    status: 'open',
    reportedDate: '2024-01-10',
    reportedBy: 'Mike Johnson',
    description: 'Printer in office not working properly',
    location: 'Office Floor 2'
  },
  {
    id: '4',
    title: 'Data Loss Incident',
    type: 'Data',
    severity: 'critical',
    status: 'closed',
    reportedDate: '2024-01-08',
    reportedBy: 'Sarah Wilson',
    assignedTo: 'IT Team',
    description: 'Accidental deletion of important project files',
    location: 'Development Department'
  },
];

const incidentTypes = ['Security', 'Safety', 'Equipment', 'Data', 'Environmental', 'Other'];

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
    case 'high':
      return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
    case 'medium':
      return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    default:
      return <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'resolved':
    case 'closed':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case 'investigating':
      return <ClockIcon className="w-5 h-5 text-blue-500" />;
    default:
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'resolved':
    case 'closed':
      return 'bg-green-100 text-green-800';
    case 'investigating':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

export default function IncidentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredIncidents = mockIncidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesType = typeFilter === 'all' || incident.type === typeFilter;
    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incident Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Report, track, and manage workplace incidents
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/incident/report"
            className="inline-flex items-center px-4 py-2 bg-[#0745fe] text-white text-sm font-medium rounded-full hover:bg-[#0635d1] transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Report Incident
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{filteredIncidents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open/Investigating</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredIncidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShieldExclamationIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High/Critical</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredIncidents.filter(i => i.severity === 'high' || i.severity === 'critical').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredIncidents.filter(i => i.status === 'resolved' || i.status === 'closed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            >
              <option value="all">All Types</option>
              {incidentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredIncidents.map((incident) => (
            <div key={incident.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(incident.status)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{incident.title}</h4>
                      <p className="text-sm text-gray-500">{incident.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Type: {incident.type}</span>
                    <span>•</span>
                    <span>Location: {incident.location}</span>
                    <span>•</span>
                    <span>Reported by: {incident.reportedBy}</span>
                    <span>•</span>
                    <span>Date: {new Date(incident.reportedDate).toLocaleDateString()}</span>
                    {incident.assignedTo && (
                      <>
                        <span>•</span>
                        <span>Assigned to: {incident.assignedTo}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/incident/report"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Report Incident</h3>
              <p className="text-sm text-gray-500">Submit new incident</p>
            </div>
          </div>
        </Link>
        <Link
          href="/incident/my-incidents"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
              <EyeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">My Incidents</h3>
              <p className="text-sm text-gray-500">View my reports</p>
            </div>
          </div>
        </Link>
        <Link
          href="/incident/all"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">All Incidents</h3>
              <p className="text-sm text-gray-500">Manage all reports</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
