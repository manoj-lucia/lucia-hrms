'use client';

import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, PlusIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import LoadingButton from '@/components/ui/LoadingButton';
import SkeletonLoader, { TableRowSkeleton } from '@/components/ui/SkeletonLoader';

// Types for employee data
interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: string;
  branch: string;
  team?: string;
  profileImage?: string;
  gender?: string;
}

type SortField = 'name' | 'department' | 'designation' | 'status';
type SortDirection = 'asc' | 'desc';

interface FilterOptions {
  departments: string[];
  designations: string[];
  statuses: string[];
  branches: string[];
  genders: string[];
}

export default function EmployeesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter states
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]); // Store all employees for client-side filtering
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Check for deleted=true query parameter to show success message
  useEffect(() => {
    if (searchParams.get('deleted') === 'true') {
      setSuccessMessage('Employee deleted successfully');

      // Clear the success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
      setAllEmployees(response.data); // Store all employees for client-side filtering
      setError(null);
    } catch (err: any) {
      console.error('Error fetching employees:', err);

      // Handle specific error cases
      if (err.response && err.response.status === 503) {
        setError('Database connection error. Please make sure the database is running and properly set up.');
      } else {
        setError('Failed to load employees. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Sort function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle row click for preview
  const handleRowClick = (employeeId: string) => {
    router.push(`/employees/${employeeId}/preview`);
  };

  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent, employeeId: string) => {
    e.stopPropagation(); // Prevent row click
    router.push(`/employees/${employeeId}`);
  };

  // Get unique filter options from all employees
  const getFilterOptions = (): FilterOptions => {
    const departments = [...new Set(allEmployees.map(emp => emp.department))].sort();
    const designations = [...new Set(allEmployees.map(emp => emp.designation))].sort();
    // Define all possible status types
    const statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_LEAVE'];
    const branches = [...new Set(allEmployees.map(emp => emp.branch).filter(Boolean))].sort();
    const genders = [...new Set(allEmployees.map(emp => emp.gender).filter(Boolean))].sort();

    return { departments, designations, statuses, branches, genders };
  };

  // Filter and sort employees
  const filteredAndSortedEmployees = employees
    .filter(employee => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchesDepartment = selectedDepartments.length === 0 ||
        selectedDepartments.includes(employee.department);

      // Designation filter
      const matchesDesignation = selectedDesignations.length === 0 ||
        selectedDesignations.includes(employee.designation);

      // Status filter
      const matchesStatus = selectedStatuses.length === 0 ||
        selectedStatuses.includes(employee.status);

      // Branch filter
      const matchesBranch = selectedBranches.length === 0 ||
        selectedBranches.includes(employee.branch);

      // Gender filter
      const matchesGender = selectedGenders.length === 0 ||
        selectedGenders.includes(employee.gender);

      return matchesSearch && matchesDepartment && matchesDesignation && matchesStatus && matchesBranch && matchesGender;
    })
    .sort((a, b) => {
      let aValue = '';
      let bValue = '';

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case 'designation':
          aValue = a.designation.toLowerCase();
          bValue = b.designation.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
      }

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      if (searchValue.length === 0) {
        // Show all employees when search is cleared
        setEmployees(allEmployees);
      } else {
        // Filter employees client-side for better performance
        const filtered = allEmployees.filter(employee =>
          employee.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchValue.toLowerCase()) ||
          employee.department.toLowerCase().includes(searchValue.toLowerCase()) ||
          employee.designation.toLowerCase().includes(searchValue.toLowerCase()) ||
          employee.employeeId.toLowerCase().includes(searchValue.toLowerCase())
        );
        setEmployees(filtered);
      }
    }, 300),
    [allEmployees]
  );

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 lg:py-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Employees</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 font-medium">Manage your team members</p>
          </div>

          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3 sm:ml-4">
            {/* Enhanced Search Bar */}
            <div className="relative flex-1 sm:flex-none sm:w-64 md:w-72 lg:w-80">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 sm:py-2 pl-10 pr-10 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-[#0745fe] text-sm transition-all duration-200 shadow-sm"
                placeholder="Search employees..."
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setEmployees(allEmployees);
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md relative"
              >
                <FunnelIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
                {(selectedDepartments.length > 0 || selectedDesignations.length > 0 || selectedStatuses.length > 0 || selectedBranches.length > 0 || selectedGenders.length > 0) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#0745fe] rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {selectedDepartments.length + selectedDesignations.length + selectedStatuses.length + selectedBranches.length + selectedGenders.length}
                    </span>
                  </span>
                )}
              </button>

              {/* Add Employee Button */}
              <Link
                href="/employees/add"
                className="inline-flex items-center justify-center rounded-lg bg-[#0745fe] px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium text-white hover:bg-[#0635d1] focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
              >
                <PlusIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Add Employee</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsFilterModalOpen(false)}></div>

              <div className="relative transform overflow-hidden rounded-xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:ring-offset-2"
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-2">Filter Employees</h3>
                      <p className="text-sm text-gray-500">Select filters to narrow down the employee list</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {/* Department Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <div className="relative">
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value && !selectedDepartments.includes(e.target.value)) {
                                setSelectedDepartments([...selectedDepartments, e.target.value]);
                              }
                            }}
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-[#0745fe] text-sm appearance-none shadow-sm transition-all duration-200"
                          >
                            <option value="">Select Department</option>
                            {getFilterOptions().departments.filter(dept => !selectedDepartments.includes(dept)).map((department) => (
                              <option key={department} value={department}>{department}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Designation Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                        <div className="relative">
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value && !selectedDesignations.includes(e.target.value)) {
                                setSelectedDesignations([...selectedDesignations, e.target.value]);
                              }
                            }}
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-[#0745fe] text-sm appearance-none shadow-sm transition-all duration-200"
                          >
                            <option value="">Select Designation</option>
                            {getFilterOptions().designations.filter(des => !selectedDesignations.includes(des)).map((designation) => (
                              <option key={designation} value={designation}>{designation}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="relative">
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value && !selectedStatuses.includes(e.target.value)) {
                                setSelectedStatuses([...selectedStatuses, e.target.value]);
                              }
                            }}
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-[#0745fe] text-sm appearance-none shadow-sm transition-all duration-200"
                          >
                            <option value="">Select Status</option>
                            {getFilterOptions().statuses.filter(status => !selectedStatuses.includes(status)).map((status) => (
                              <option key={status} value={status}>{status.replace('_', ' ')}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Branch Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                        <div className="relative">
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value && !selectedBranches.includes(e.target.value)) {
                                setSelectedBranches([...selectedBranches, e.target.value]);
                              }
                            }}
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-[#0745fe] text-sm appearance-none shadow-sm transition-all duration-200"
                          >
                            <option value="">Select Branch</option>
                            {getFilterOptions().branches.filter(branch => !selectedBranches.includes(branch)).map((branch) => (
                              <option key={branch} value={branch}>{branch}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Gender Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <div className="relative">
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value && !selectedGenders.includes(e.target.value)) {
                                setSelectedGenders([...selectedGenders, e.target.value]);
                              }
                            }}
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:border-[#0745fe] text-sm appearance-none shadow-sm transition-all duration-200"
                          >
                            <option value="">Select Gender</option>
                            {getFilterOptions().genders.filter(gender => !selectedGenders.includes(gender)).map((gender) => (
                              <option key={gender} value={gender}>{gender}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                      {/* Clear All Button */}
                      {(selectedDepartments.length > 0 || selectedDesignations.length > 0 || selectedStatuses.length > 0 || selectedBranches.length > 0 || selectedGenders.length > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDepartments([]);
                            setSelectedDesignations([]);
                            setSelectedStatuses([]);
                            setSelectedBranches([]);
                            setSelectedGenders([]);
                          }}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <XMarkIcon className="mr-2 h-4 w-4" />
                          Clear All Filters
                        </button>
                      )}

                      <div className="flex-1"></div>

                      {/* Apply Filters Button */}
                      <button
                        type="button"
                        onClick={() => setIsFilterModalOpen(false)}
                        className="inline-flex items-center justify-center rounded-lg bg-[#0745fe] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0635d1] focus:outline-none focus:ring-2 focus:ring-[#0745fe] focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {(selectedDepartments.length > 0 || selectedDesignations.length > 0 || selectedStatuses.length > 0 || selectedBranches.length > 0 || selectedGenders.length > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Active Filters:</span>

              {/* Department Tags */}
              {selectedDepartments.map((department) => (
                <span
                  key={`dept-${department}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                >
                  <span className="w-2 h-2 bg-[#0745fe] rounded-full"></span>
                  {department}
                  <button
                    type="button"
                    onClick={() => setSelectedDepartments(selectedDepartments.filter(d => d !== department))}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {/* Designation Tags */}
              {selectedDesignations.map((designation) => (
                <span
                  key={`des-${designation}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                >
                  <span className="w-2 h-2 bg-[#0745fe] rounded-full"></span>
                  {designation}
                  <button
                    type="button"
                    onClick={() => setSelectedDesignations(selectedDesignations.filter(d => d !== designation))}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {/* Status Tags */}
              {selectedStatuses.map((status) => (
                <span
                  key={`status-${status}`}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : status === 'ON_LEAVE'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      : status === 'SUSPENDED'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    status === 'ACTIVE'
                      ? 'bg-green-500'
                      : status === 'ON_LEAVE'
                      ? 'bg-yellow-500'
                      : status === 'SUSPENDED'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                  }`}></span>
                  {status.replace('_', ' ')}
                  <button
                    type="button"
                    onClick={() => setSelectedStatuses(selectedStatuses.filter(s => s !== status))}
                    className={`ml-1 rounded-full p-0.5 transition-colors ${
                      status === 'ACTIVE'
                        ? 'hover:bg-green-200'
                        : status === 'ON_LEAVE'
                        ? 'hover:bg-yellow-200'
                        : status === 'SUSPENDED'
                        ? 'hover:bg-red-200'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {/* Branch Tags */}
              {selectedBranches.map((branch) => (
                <span
                  key={`branch-${branch}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                >
                  <span className="w-2 h-2 bg-[#0745fe] rounded-full"></span>
                  {branch}
                  <button
                    type="button"
                    onClick={() => setSelectedBranches(selectedBranches.filter(b => b !== branch))}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {/* Gender Tags */}
              {selectedGenders.map((gender) => (
                <span
                  key={`gender-${gender}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                >
                  <span className="w-2 h-2 bg-[#0745fe] rounded-full"></span>
                  {gender}
                  <button
                    type="button"
                    onClick={() => setSelectedGenders(selectedGenders.filter(g => g !== gender))}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="mt-4 rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="text-sm font-medium text-green-800">{successMessage}</div>
            </div>
          </div>
        )}

        {/* Employees list */}
        <div className="mt-4 sm:mt-6">
          {/* Mobile & Tablet Card View */}
          <div className="block xl:hidden">
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 animate-pulse shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-50 p-4 sm:p-6 border border-red-200 shadow-sm">
                <div className="text-sm font-medium text-red-800">{error}</div>
              </div>
            ) : filteredAndSortedEmployees.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No employees found</p>
                <p className="text-sm sm:text-base text-gray-500">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredAndSortedEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    onClick={() => handleRowClick(employee.id)}
                    className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] sm:active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {employee.profileImage ? (
                            <img className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-gray-200 shadow-sm" src={employee.profileImage} alt="" />
                          ) : (
                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-[#0745fe] to-[#0635d1] flex items-center justify-center shadow-sm">
                              <span className="text-sm sm:text-base font-bold text-white">
                                {employee.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{employee.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">{employee.email}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                            <span className="text-xs sm:text-sm text-gray-600 font-medium">{employee.department}</span>
                            <span className="text-xs sm:text-sm text-gray-600">{employee.designation}</span>
                            {employee.branch && (
                              <span className="text-xs sm:text-sm text-gray-500">{employee.branch}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 sm:space-y-3 ml-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${
                          employee.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 ring-1 ring-green-600/20'
                            : employee.status === 'INACTIVE'
                            ? 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20'
                            : employee.status === 'SUSPENDED'
                            ? 'bg-red-100 text-red-800 ring-1 ring-red-600/20'
                            : employee.status === 'ON_LEAVE'
                            ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20'
                            : 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20'
                        }`}>
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
                        <button
                          onClick={(e) => handleEditClick(e, employee.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#0745fe] bg-blue-50 hover:bg-blue-100 rounded-lg hover:text-[#0635d1] transition-all duration-200 shadow-sm min-h-[44px] sm:min-h-[36px]"
                        >
                          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-hidden">
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Employee</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Department</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Branch</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-50 p-6 border border-red-200 shadow-sm">
                <div className="text-sm font-medium text-red-800">{error}</div>
              </div>
            ) : filteredAndSortedEmployees.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="mx-auto h-16 w-16 text-gray-400 mb-6">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-gray-900 mb-2">No employees found</p>
                <p className="text-base text-gray-500">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[250px]">
                        <button
                          onClick={() => handleSort('name')}
                          className="group inline-flex items-center hover:text-gray-900 transition-colors font-bold"
                        >
                          Employee
                          <span className="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-600">
                            {sortField === 'name' ? (
                              sortDirection === 'asc' ? (
                                <ChevronUpIcon className="h-4 w-4" />
                              ) : (
                                <ChevronDownIcon className="h-4 w-4" />
                              )
                            ) : (
                              <ChevronUpDownIcon className="h-4 w-4" />
                            )}
                          </span>
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[120px]">
                        <button
                          onClick={() => handleSort('department')}
                          className="group inline-flex items-center hover:text-gray-900 transition-colors font-bold"
                        >
                          Department
                          <span className="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-600">
                            {sortField === 'department' ? (
                              sortDirection === 'asc' ? (
                                <ChevronUpIcon className="h-4 w-4" />
                              ) : (
                                <ChevronDownIcon className="h-4 w-4" />
                              )
                            ) : (
                              <ChevronUpDownIcon className="h-4 w-4" />
                            )}
                          </span>
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[140px]">
                        <button
                          onClick={() => handleSort('designation')}
                          className="group inline-flex items-center hover:text-gray-900 transition-colors font-bold"
                        >
                          Role
                          <span className="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-600">
                            {sortField === 'designation' ? (
                              sortDirection === 'asc' ? (
                                <ChevronUpIcon className="h-4 w-4" />
                              ) : (
                                <ChevronDownIcon className="h-4 w-4" />
                              )
                            ) : (
                              <ChevronUpDownIcon className="h-4 w-4" />
                            )}
                          </span>
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[120px]">
                        Branch
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[100px]">
                        <button
                          onClick={() => handleSort('status')}
                          className="group inline-flex items-center hover:text-gray-900 transition-colors font-bold"
                        >
                          Status
                          <span className="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-600">
                            {sortField === 'status' ? (
                              sortDirection === 'asc' ? (
                                <ChevronUpIcon className="h-4 w-4" />
                              ) : (
                                <ChevronDownIcon className="h-4 w-4" />
                              )
                            ) : (
                              <ChevronUpDownIcon className="h-4 w-4" />
                            )}
                          </span>
                        </button>
                      </th>
                      <th scope="col" className="relative px-6 py-4 min-w-[80px]">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredAndSortedEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        onClick={() => handleRowClick(employee.id)}
                        className="hover:bg-blue-50/30 transition-all duration-200 group cursor-pointer"
                      >
                        <td className="whitespace-nowrap py-4 pl-6 pr-3">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0">
                              {employee.profileImage ? (
                                <img className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-gray-200 group-hover:ring-[#0745fe]/30 transition-all duration-200" src={employee.profileImage} alt="" />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0745fe] to-[#0635d1] flex items-center justify-center shadow-md ring-2 ring-gray-200 group-hover:ring-[#0745fe]/30 transition-all duration-200">
                                  <span className="text-base font-bold text-white">
                                    {employee.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900 tracking-tight">{employee.name}</div>
                              <div className="text-xs text-gray-500 font-medium mt-0.5">{employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{employee.department}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{employee.designation}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-700">{employee.branch || 'N/A'}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                            employee.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800 ring-1 ring-green-600/20'
                              : employee.status === 'INACTIVE'
                              ? 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20'
                              : employee.status === 'SUSPENDED'
                              ? 'bg-red-100 text-red-800 ring-1 ring-red-600/20'
                              : employee.status === 'ON_LEAVE'
                              ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20'
                              : 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20'
                          }`}>
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
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right">
                          <button
                            onClick={(e) => handleEditClick(e, employee.id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#0745fe] bg-blue-50 hover:bg-blue-100 rounded-lg hover:text-[#0635d1] transition-all duration-200 group-hover:bg-blue-100"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                            <span className="sr-only">, {employee.name}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
