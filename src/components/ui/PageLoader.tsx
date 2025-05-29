'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  message?: string;
  showLogo?: boolean;
}

export default function PageLoader({ 
  message = 'Loading...', 
  showLogo = true 
}: PageLoaderProps) {
  return (
    <div className="fixed inset-0 bg-[#f9fafb] flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo */}
        {showLogo && (
          <div className="mb-8">
            <img
              src="/images/logo.webp"
              alt="Lucia Financial Services"
              className="h-12 mx-auto object-contain"
            />
          </div>
        )}

        {/* Loading Spinner */}
        <div className="mb-6">
          <LoadingSpinner size="xl" color="primary" />
        </div>

        {/* Loading Message */}
        <p className="text-gray-600 text-base font-medium">
          {message}
        </p>

        {/* Loading Dots Animation */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-[#0745fe] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#0745fe] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#0745fe] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
