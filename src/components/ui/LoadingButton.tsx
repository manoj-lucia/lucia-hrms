import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loadingText?: string;
}

export default function LoadingButton({
  children,
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  loadingText
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] disabled:transform-none';

  const variantClasses = {
    primary: 'bg-[#0745fe] text-white hover:bg-[#0635d1] focus:ring-[#0745fe]/20',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20'
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 sm:h-12 px-4 text-sm sm:text-base',
    lg: 'h-12 px-6 text-base'
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {isLoading ? (
        <>
          <LoadingSpinner 
            size="sm" 
            color="white" 
            className="mr-2" 
          />
          {loadingText || 'Loading...'}
        </>
      ) : (
        children
      )}
    </button>
  );
}
