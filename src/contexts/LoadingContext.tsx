'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import PageLoader from '@/components/ui/PageLoader';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean, message?: string) => void;
  loadingMessage: string;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const setLoading = (loading: boolean, message: string = 'Loading...') => {
    setIsLoading(loading);
    setLoadingMessage(message);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingMessage }}>
      {children}
      {isLoading && <PageLoader message={loadingMessage} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Hook for async operations with loading states
export function useAsyncOperation() {
  const { setLoading } = useLoading();

  const executeWithLoading = async <T,>(
    operation: () => Promise<T>,
    loadingMessage: string = 'Processing...'
  ): Promise<T> => {
    try {
      setLoading(true, loadingMessage);
      const result = await operation();
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { executeWithLoading };
}
