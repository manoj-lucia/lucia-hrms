'use client';

import { useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LoadingButton from '@/components/ui/LoadingButton';
import PageLoader from '@/components/ui/PageLoader';
import SkeletonLoader, { CardSkeleton, TableRowSkeleton } from '@/components/ui/SkeletonLoader';

export default function LoadingDemoPage() {
  const [showPageLoader, setShowPageLoader] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleButtonClick = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 3000);
  };

  const handlePageLoaderClick = () => {
    setShowPageLoader(true);
    setTimeout(() => setShowPageLoader(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-8">
      {showPageLoader && <PageLoader message="Loading page content..." />}
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Loading Components Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Loading Spinners */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Loading Spinners</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="sm" />
                <span>Small</span>
              </div>
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="md" />
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="lg" />
                <span>Large</span>
              </div>
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="xl" />
                <span>Extra Large</span>
              </div>
            </div>
          </div>

          {/* Loading Buttons */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Loading Buttons</h2>
            <div className="space-y-4">
              <LoadingButton
                variant="primary"
                isLoading={buttonLoading}
                onClick={handleButtonClick}
                loadingText="Processing..."
              >
                Primary Button
              </LoadingButton>
              
              <LoadingButton
                variant="secondary"
                isLoading={buttonLoading}
                onClick={handleButtonClick}
                loadingText="Loading..."
              >
                Secondary Button
              </LoadingButton>
              
              <LoadingButton
                variant="danger"
                isLoading={buttonLoading}
                onClick={handleButtonClick}
                loadingText="Deleting..."
              >
                Danger Button
              </LoadingButton>
            </div>
          </div>

          {/* Page Loader Demo */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Page Loader</h2>
            <p className="text-gray-600 mb-4">
              Click the button below to see the full-page loading overlay.
            </p>
            <LoadingButton
              variant="primary"
              onClick={handlePageLoaderClick}
            >
              Show Page Loader
            </LoadingButton>
          </div>

          {/* Skeleton Loaders */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Skeleton Loaders</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Text Lines</h3>
                <SkeletonLoader variant="text" lines={3} />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Circular</h3>
                <SkeletonLoader variant="circular" width={60} height={60} />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Rectangular</h3>
                <SkeletonLoader variant="rectangular" height={100} />
              </div>
            </div>
          </div>

          {/* Card Skeleton */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Card Skeleton</h2>
            <CardSkeleton />
          </div>

          {/* Table Skeleton */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Table Skeleton</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
