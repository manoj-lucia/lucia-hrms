'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LoadingButton from '@/components/ui/LoadingButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the real authentication API
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response:', await response.text());
        throw new Error('Server error: Expected JSON response but got HTML. Database might not be set up correctly.');
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503 && data.error && data.error.includes('Database connection')) {
          throw new Error('Database connection error. Please make sure PostgreSQL is running and properly set up. See DATABASE_SETUP.md for instructions.');
        }
        throw new Error(data.error || 'Login failed');
      }

      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Database connection')) {
          setError('Database connection error. Please make sure PostgreSQL is running and properly set up. See DATABASE_SETUP.md for instructions.');
        } else if (err.message.includes('Expected JSON response')) {
          setError('Server error. Please make sure the application is properly configured.');
        } else {
          setError(err.message);
        }
        console.error('Login error:', err);
      } else {
        setError('An unexpected error occurred. Please try again later.');
        console.error('Unknown login error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] relative">
      {/* Apple-Style Navbar */}
      <nav className="bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 z-50" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center min-h-[44px] py-2">
                <img
                  src="/images/logo.webp"
                  alt="Lucia Financial Services"
                  className="h-7 sm:h-8 object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation - Absolutely Centered */}
            <div className="hidden lg:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-1">
                <Link
                  href="/coming-soon"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Services
                </Link>
                <Link
                  href="/coming-soon"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  About
                </Link>
                <Link
                  href="/coming-soon"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Careers
                </Link>
                <Link
                  href="/coming-soon"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Support
                </Link>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 ml-auto">
              {/* Search Icon */}
              <button
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-md">
              <div className="px-4 py-6 space-y-1">
                <Link
                  href="/coming-soon"
                  className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="/coming-soon"
                  className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/coming-soon"
                  className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Careers
                </Link>
                <Link
                  href="/coming-soon"
                  className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex min-h-screen">
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="bg-white rounded-xl p-6 sm:p-8" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)' }}>
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Sign in
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Welcome To Lucia Financial Services
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm text-red-700 font-medium">{error}</div>
                    {error.includes('Database connection') && (
                      <div className="mt-3 text-sm text-red-600">
                        <p className="mb-2">To fix this issue, you have two options:</p>

                        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="font-medium text-yellow-800">Option 1: Quick Setup with SQLite (Recommended)</p>
                          <p className="mt-1 text-yellow-700">Run this command to set up a local SQLite database:</p>
                          <pre className="mt-1 bg-yellow-100 p-2 rounded text-xs overflow-x-auto text-yellow-900">npm run setup</pre>
                        </div>

                        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="font-medium text-blue-800">Option 2: Set up PostgreSQL</p>
                          <ol className="list-decimal pl-5 mt-1 space-y-0.5 text-blue-700">
                            <li>Make sure PostgreSQL is installed and running</li>
                            <li>Create a database named 'lucia_hrms'</li>
                            <li>Update the .env file with correct database credentials</li>
                            <li>Run 'npm run db:push' to set up the database schema</li>
                            <li>Run 'npm run db:seed' to add initial data</li>
                          </ol>
                        </div>

                        <p className="text-red-600 text-xs">
                          After completing either option, restart the application with <code className="bg-red-100 px-1 py-0.5 rounded">npm run dev</code>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-900">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full h-12 px-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0745fe]/20 focus:border-[#0745fe] transition-all duration-200 text-base"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="w-full h-12 px-4 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0745fe]/20 focus:border-[#0745fe] transition-all duration-200 text-base"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200 focus:outline-none rounded-lg"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <div></div>
                  <button
                    type="button"
                    className="text-sm text-[#0745fe] hover:text-[#0635d1] font-medium transition-colors duration-200 focus:outline-none focus:underline min-h-[44px] py-2"
                    onClick={() => {
                      // Handle forgot password
                      console.log('Forgot password clicked');
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <div className="pt-1">
                  <LoadingButton
                    type="submit"
                    isLoading={isLoading}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loadingText="Signing in..."
                  >
                    Sign in
                  </LoadingButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 pb-6 text-center">
        <p className="text-xs text-gray-500 px-4">
          © 2025 Lucia Financial Services. All rights reserved.
        </p>
      </div>
    </div>
  );
}
