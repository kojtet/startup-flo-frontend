import React, { ReactNode } from 'react';
import { useAuthWithRetry } from '@/hooks/useAuthWithRetry';

interface UserDataLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  showRetryButton?: boolean;
}

export const UserDataLoader: React.FC<UserDataLoaderProps> = ({ 
  children, 
  fallback,
  showRetryButton = true 
}) => {
  const { userAvailable, loading, isRetrying, retryFetchUser, retryAttempts, isHydrated } = useAuthWithRetry({
    retryCount: 3,
    retryDelay: 2000,
    autoRetry: true
  });

  const defaultFallback = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-lg mb-4">
        {isRetrying ? 'Refreshing user data...' : 'Loading user data...'}
      </p>
      {showRetryButton && !loading && !userAvailable && retryAttempts > 0 && (
        <button
          onClick={retryFetchUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry Loading User Data
        </button>
      )}
    </div>
  );

  // Show loading state while user data is not available or during hydration
  if (!userAvailable || !isHydrated) {
    return <>{fallback || defaultFallback}</>;
  }

  // User data is available, render children
  return <>{children}</>;
}; 