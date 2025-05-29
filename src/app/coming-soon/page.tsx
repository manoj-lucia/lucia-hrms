'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/images/logo.webp"
            alt="Lucia Financial Services"
            className="h-12 mx-auto object-contain"
          />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-[#0745fe]/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#0745fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            We're Working on It
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            This page is currently under development. We're building something amazing for you. 
            Please check back soon!
          </p>

          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full h-12 bg-[#0745fe] text-white px-6 rounded-xl font-semibold text-base hover:bg-[#0635d1] focus:outline-none focus:ring-2 focus:ring-[#0745fe]/20 focus:ring-offset-2 transition-all duration-200 transform active:scale-[0.98]"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <p className="text-xs text-gray-500">
            © 2025 Lucia Financial Services. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
