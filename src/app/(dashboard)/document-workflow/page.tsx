'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CloudArrowUpIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  uploadedDate: string;
  size: string;
  uploadedBy: string;
  approver?: string;
  comments?: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Employee Handbook Update.pdf',
    type: 'Policy Document',
    status: 'pending',
    uploadedDate: '2024-01-15',
    size: '2.4 MB',
    uploadedBy: 'John Doe'
  },
  {
    id: '2',
    name: 'Q4 Financial Report.xlsx',
    type: 'Financial Report',
    status: 'approved',
    uploadedDate: '2024-01-12',
    size: '1.8 MB',
    uploadedBy: 'Jane Smith',
    approver: 'Mike Johnson'
  },
  {
    id: '3',
    name: 'New Hire Checklist.docx',
    type: 'HR Document',
    status: 'in_review',
    uploadedDate: '2024-01-10',
    size: '856 KB',
    uploadedBy: 'Sarah Wilson'
  },
  {
    id: '4',
    name: 'Security Protocol.pdf',
    type: 'Security Document',
    status: 'rejected',
    uploadedDate: '2024-01-08',
    size: '3.2 MB',
    uploadedBy: 'Tom Brown',
    comments: 'Requires additional security measures'
  },
];

const documentTypes = [
  'Policy Document',
  'Financial Report',
  'HR Document',
  'Security Document',
  'Training Material',
  'Contract',
  'Other'
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case 'rejected':
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    case 'in_review':
      return <ClockIcon className="w-5 h-5 text-blue-500" />;
    default:
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'in_review':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'in_review':
      return 'In Review';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export default function DocumentWorkflowPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Workflow</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage document uploads, reviews, and approvals
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/document-workflow/upload"
            className="inline-flex items-center px-4 py-2 bg-[#0745fe] text-white text-sm font-medium rounded-full hover:bg-[#0635d1] transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Upload Document
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{filteredDocuments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredDocuments.filter(d => d.status === 'pending' || d.status === 'in_review').length}
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
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredDocuments.filter(d => d.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredDocuments.filter(d => d.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search documents..."
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
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            >
              <option value="all">All Types</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredDocuments.map((document) => (
            <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(document.status)}
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{document.name}</h4>
                        <p className="text-sm text-gray-500">{document.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Uploaded by: {document.uploadedBy}</span>
                    <span>•</span>
                    <span>Size: {document.size}</span>
                    <span>•</span>
                    <span>Date: {new Date(document.uploadedDate).toLocaleDateString()}</span>
                    {document.approver && (
                      <>
                        <span>•</span>
                        <span>Approved by: {document.approver}</span>
                      </>
                    )}
                  </div>
                  {document.comments && (
                    <div className="mt-2">
                      <p className="text-sm text-red-600">Comments: {document.comments}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                    {getStatusText(document.status)}
                  </span>
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
          href="/document-workflow/upload"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
              <CloudArrowUpIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
              <p className="text-sm text-gray-500">Submit new document</p>
            </div>
          </div>
        </Link>
        <Link
          href="/document-workflow/my-documents"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
              <FolderIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">My Documents</h3>
              <p className="text-sm text-gray-500">View uploaded files</p>
            </div>
          </div>
        </Link>
        <Link
          href="/document-workflow/approvals"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
              <CheckCircleIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
              <p className="text-sm text-gray-500">Review documents</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
