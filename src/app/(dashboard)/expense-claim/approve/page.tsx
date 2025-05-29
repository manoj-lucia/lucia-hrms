'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface PendingClaim {
  id: string;
  title: string;
  amount: number;
  category: string;
  submittedDate: string;
  description: string;
  submittedBy: {
    name: string;
    email: string;
    department: string;
  };
  receipt?: string;
}

const mockPendingClaims: PendingClaim[] = [
  {
    id: '1',
    title: 'Business Travel - Client Meeting',
    amount: 1250.00,
    category: 'Travel',
    submittedDate: '2024-01-15',
    description: 'Flight and accommodation for client meeting in Mumbai',
    submittedBy: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Sales'
    }
  },
  {
    id: '2',
    title: 'Conference Registration',
    amount: 3500.00,
    category: 'Training',
    submittedDate: '2024-01-14',
    description: 'Registration fee for tech conference',
    submittedBy: {
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      department: 'Engineering'
    }
  },
  {
    id: '3',
    title: 'Marketing Materials',
    amount: 750.00,
    category: 'Marketing',
    submittedDate: '2024-01-13',
    description: 'Printed brochures and promotional materials',
    submittedBy: {
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      department: 'Marketing'
    }
  },
  {
    id: '4',
    title: 'Office Equipment',
    amount: 1800.00,
    category: 'Office',
    submittedDate: '2024-01-12',
    description: 'Ergonomic chair and desk accessories',
    submittedBy: {
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      department: 'HR'
    }
  },
];

export default function ApproveClaimsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

  const filteredClaims = mockPendingClaims.filter(claim => {
    const matchesSearch = claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || claim.submittedBy.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(mockPendingClaims.map(claim => claim.submittedBy.department))];
  const totalPendingAmount = filteredClaims.reduce((sum, claim) => sum + claim.amount, 0);

  const handleSelectClaim = (claimId: string) => {
    setSelectedClaims(prev => 
      prev.includes(claimId) 
        ? prev.filter(id => id !== claimId)
        : [...prev, claimId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClaims.length === filteredClaims.length) {
      setSelectedClaims([]);
    } else {
      setSelectedClaims(filteredClaims.map(claim => claim.id));
    }
  };

  const handleBulkApprove = () => {
    if (selectedClaims.length === 0) return;
    
    const selectedClaimTitles = filteredClaims
      .filter(claim => selectedClaims.includes(claim.id))
      .map(claim => claim.title)
      .join(', ');
    
    if (confirm(`Are you sure you want to approve ${selectedClaims.length} claim(s)?\n\n${selectedClaimTitles}`)) {
      alert(`${selectedClaims.length} claim(s) approved successfully!`);
      setSelectedClaims([]);
    }
  };

  const handleBulkReject = () => {
    if (selectedClaims.length === 0) return;
    
    const selectedClaimTitles = filteredClaims
      .filter(claim => selectedClaims.includes(claim.id))
      .map(claim => claim.title)
      .join(', ');
    
    if (confirm(`Are you sure you want to reject ${selectedClaims.length} claim(s)?\n\n${selectedClaimTitles}`)) {
      alert(`${selectedClaims.length} claim(s) rejected successfully!`);
      setSelectedClaims([]);
    }
  };

  const handleIndividualAction = (claimId: string, action: 'approve' | 'reject') => {
    const claim = filteredClaims.find(c => c.id === claimId);
    if (!claim) return;

    const actionText = action === 'approve' ? 'approve' : 'reject';
    if (confirm(`Are you sure you want to ${actionText} "${claim.title}"?`)) {
      alert(`Claim ${action}d successfully!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/expense-claim"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approve Expense Claims</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve pending expense claims from your team
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Claims</p>
              <p className="text-2xl font-bold text-gray-900">{filteredClaims.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalPendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Selected</p>
              <p className="text-2xl font-bold text-gray-900">{selectedClaims.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          {selectedClaims.length > 0 && (
            <div className="flex space-x-3">
              <button
                onClick={handleBulkApprove}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Approve ({selectedClaims.length})
              </button>
              <button
                onClick={handleBulkReject}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Reject ({selectedClaims.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pending Claims</h3>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedClaims.length === filteredClaims.length && filteredClaims.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-[#0745fe] focus:ring-[#0745fe]"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </label>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedClaims.includes(claim.id)}
                  onChange={() => handleSelectClaim(claim.id)}
                  className="rounded border-gray-300 text-[#0745fe] focus:ring-[#0745fe]"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{claim.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{claim.description}</p>
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4" />
                          <span>{claim.submittedBy.name}</span>
                        </div>
                        <span>•</span>
                        <span>{claim.submittedBy.department}</span>
                        <span>•</span>
                        <span>Submitted: {new Date(claim.submittedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">₹{claim.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{claim.category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleIndividualAction(claim.id, 'approve')}
                          className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleIndividualAction(claim.id, 'reject')}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
