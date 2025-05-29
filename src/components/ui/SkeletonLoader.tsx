import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function SkeletonLoader({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '2rem')
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${index < lines - 1 ? 'mb-2' : ''}`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center space-x-4 mb-4">
        <SkeletonLoader variant="circular" width={40} height={40} />
        <div className="flex-1">
          <SkeletonLoader variant="text" height="1rem" className="mb-2" />
          <SkeletonLoader variant="text" height="0.875rem" width="60%" />
        </div>
      </div>
      <SkeletonLoader variant="text" lines={3} className="mb-4" />
      <SkeletonLoader variant="rectangular" height="2.5rem" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-6 py-4">
        <SkeletonLoader variant="text" height="1rem" />
      </td>
      <td className="px-6 py-4">
        <SkeletonLoader variant="text" height="1rem" />
      </td>
      <td className="px-6 py-4">
        <SkeletonLoader variant="text" height="1rem" />
      </td>
      <td className="px-6 py-4">
        <SkeletonLoader variant="rectangular" height="2rem" width="5rem" />
      </td>
    </tr>
  );
}
