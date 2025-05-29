'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BanknotesIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface SalarySlip {
  id: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'generated' | 'paid' | 'pending';
  payDate?: string;
}

interface TaxDocument {
  id: string;
  type: string;
  financialYear: string;
  amount: number;
  generatedDate: string;
  status: 'available' | 'pending';
}

const mockSalarySlips: SalarySlip[] = [
  {
    id: '1',
    month: 'January',
    year: 2024,
    basicSalary: 50000,
    allowances: 15000,
    deductions: 8000,
    netSalary: 57000,
    status: 'paid',
    payDate: '2024-01-31'
  },
  {
    id: '2',
    month: 'December',
    year: 2023,
    basicSalary: 50000,
    allowances: 15000,
    deductions: 8000,
    netSalary: 57000,
    status: 'paid',
    payDate: '2023-12-31'
  },
  {
    id: '3',
    month: 'November',
    year: 2023,
    basicSalary: 50000,
    allowances: 15000,
    deductions: 8000,
    netSalary: 57000,
    status: 'paid',
    payDate: '2023-11-30'
  },
];

const mockTaxDocuments: TaxDocument[] = [
  {
    id: '1',
    type: 'Form 16',
    financialYear: '2023-24',
    amount: 684000,
    generatedDate: '2024-01-15',
    status: 'available'
  },
  {
    id: '2',
    type: 'TDS Certificate',
    financialYear: '2023-24',
    amount: 45000,
    generatedDate: '2024-01-15',
    status: 'available'
  },
  {
    id: '3',
    type: 'Form 16',
    financialYear: '2022-23',
    amount: 650000,
    generatedDate: '2023-04-15',
    status: 'available'
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'generated':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

export default function PayrollPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');

  const filteredSlips = mockSalarySlips.filter(slip => {
    const matchesSearch = slip.month.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = yearFilter === 'all' || slip.year.toString() === yearFilter;
    return matchesSearch && matchesYear;
  });

  const filteredTaxDocs = mockTaxDocuments.filter(doc => {
    const matchesSearch = doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.financialYear.includes(searchTerm);
    return matchesSearch;
  });

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  // Calculate yearly totals
  const yearlyTotals = {
    grossSalary: filteredSlips.reduce((sum, slip) => sum + slip.basicSalary + slip.allowances, 0),
    totalDeductions: filteredSlips.reduce((sum, slip) => sum + slip.deductions, 0),
    netSalary: filteredSlips.reduce((sum, slip) => sum + slip.netSalary, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Access your salary slips, tax documents, and payroll information
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">YTD Gross Salary</p>
              <p className="text-2xl font-bold text-gray-900">₹{yearlyTotals.grossSalary.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BanknotesIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">YTD Net Salary</p>
              <p className="text-2xl font-bold text-gray-900">₹{yearlyTotals.netSalary.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">YTD Deductions</p>
              <p className="text-2xl font-bold text-gray-900">₹{yearlyTotals.totalDeductions.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tax Documents</p>
              <p className="text-2xl font-bold text-gray-900">{mockTaxDocuments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by month or document type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0745fe] focus:border-transparent"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Salary Slips */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Salary Slips</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredSlips.map((slip) => (
            <div key={slip.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {slip.month} {slip.year}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Basic: ₹{slip.basicSalary.toLocaleString()} | 
                        Allowances: ₹{slip.allowances.toLocaleString()} | 
                        Deductions: ₹{slip.deductions.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {slip.payDate && (
                    <div className="mt-2 text-sm text-gray-500">
                      Paid on: {new Date(slip.payDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">₹{slip.netSalary.toLocaleString()}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(slip.status)}`}>
                      {slip.status.charAt(0).toUpperCase() + slip.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Tax Documents</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredTaxDocs.map((doc) => (
            <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{doc.type}</h4>
                      <p className="text-sm text-gray-500">
                        Financial Year: {doc.financialYear} | 
                        Amount: ₹{doc.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Generated on: {new Date(doc.generatedDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/payroll/salary-slips"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
              <BanknotesIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Salary Slips</h3>
              <p className="text-sm text-gray-500">View all pay slips</p>
            </div>
          </div>
        </Link>
        <Link
          href="/payroll/tax-documents"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Tax Documents</h3>
              <p className="text-sm text-gray-500">Download tax forms</p>
            </div>
          </div>
        </Link>
        <Link
          href="/payroll/reports"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Payroll Reports</h3>
              <p className="text-sm text-gray-500">View analytics</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
