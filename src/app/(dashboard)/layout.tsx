'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  CogIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import NotificationBell from '@/components/dashboard/NotificationBell';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Employees', href: '/employees', icon: UserGroupIcon },
  { name: 'Attendance', href: '/attendance', icon: CalendarIcon },
  { name: 'Leave', href: '/leave', icon: DocumentTextIcon },
  { name: 'Announcements', href: '/admin/notifications', icon: BellIcon, adminOnly: true },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Professional Navbar */}
      <nav className={`bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm fixed top-0 right-0 z-20 transition-all duration-300 ${sidebarCollapsed ? 'md:left-14' : 'md:left-56'} left-0`}>
        <div className={`px-4 py-1.5 ${sidebarCollapsed ? 'md:border-l md:border-l-gray-200' : 'md:border-l md:border-l-gray-200'}`}>
          <div className="flex items-center justify-end">
            {/* Mobile sidebar toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center p-1.5 text-gray-600 rounded-lg md:hidden hover:bg-gray-50 hover:text-[#0745fe] focus:outline-none focus:ring-2 focus:ring-[#0745fe]/20 transition-all duration-200 mr-auto"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="w-4 h-4" />
            </button>

            {/* Right side - Action Icons */}
            <div className="flex items-center space-x-2">
              {/* Real-time Notifications */}
              <NotificationBell />

              {/* Profile */}
              <div className="relative">
                <button
                  className="flex items-center p-1 text-gray-500 hover:text-[#0745fe] hover:bg-blue-50/50 rounded-lg transition-all duration-200 group"
                  title="Profile Menu"
                >
                  <div className="w-7 h-7 bg-gradient-to-r from-[#0745fe] to-[#0635d1] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <span className="text-white font-semibold text-sm">A</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile sidebar */}
        <div className={`relative flex w-full max-w-sm flex-1 flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full bg-white rounded-r-2xl shadow-xl border border-gray-100 flex flex-col m-2 ml-0">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Mobile Header */}
            <div className="p-4 border-b border-gray-100">
              <span className="font-bold text-gray-900 text-lg">Navigation</span>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 p-4 overflow-y-auto">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center p-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-[#0745fe] text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 mr-3 ${
                        pathname === item.href ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Mobile User Profile */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">admin@lucia.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Clean Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-14' : 'w-56'
        } hidden md:block`}
      >
        <div className="h-full bg-white flex flex-col shadow-sm">
          {/* Compact Header */}
          <div className={`${sidebarCollapsed ? 'p-3' : 'p-4'}`}>
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center group ml-1">
                  <img
                    src="/images/logo.webp"
                    alt="Lucia Logo"
                    className="h-8 object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Collapse sidebar"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="flex flex-col items-center space-y-2">
                <Link href="/dashboard" className="group">
                  <img
                    src="/images/logo1.webp"
                    alt="Lucia Logo"
                    className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Expand sidebar"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Navigation */}
          <div className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center w-full ${sidebarCollapsed ? 'p-3 justify-center' : 'px-4 py-3'} text-sm font-medium rounded-xl transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-[#0745fe] text-white hover:bg-[#0635d1] shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <item.icon
                    className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-4'} ${
                      pathname === item.href ? 'text-white' : 'text-gray-500'
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>



          {/* Compact User Profile */}
          <div className={`border-t border-gray-200 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'}`}>
              <div className="w-8 h-8 bg-[#0745fe] rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-xs">A</span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">admin@lucia.com</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-14' : 'md:ml-56'}`}>
        <main className="p-6 pt-20">
          {children}
        </main>
      </div>
    </div>
  );
}
