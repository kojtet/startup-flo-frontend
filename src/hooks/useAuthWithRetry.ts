import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthWithRetryOptions {
  retryCount?: number;
  retryDelay?: number;
  autoRetry?: boolean;
}

export const useAuthWithRetry = (options: UseAuthWithRetryOptions = {}) => {
  const { retryCount = 3, retryDelay = 1000, autoRetry = true } = options;
  const auth = useAuth();
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retryFetchUser = async () => {
    if (retryAttempts >= retryCount) {
      console.warn('Max retry attempts reached for user data fetch');
      return;
    }

    setIsRetrying(true);
    setRetryAttempts(prev => prev + 1);

    try {
      await auth.refreshTokens();
    } catch (error) {
      console.error('Failed to retry user fetch:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    // If user is authenticated but user data is missing, try to refresh
    if (autoRetry && auth.isAuthenticated && !auth.user && !auth.loading && retryAttempts < retryCount) {
      const timer = setTimeout(() => {
        retryFetchUser();
      }, retryDelay);

      return () => clearTimeout(timer);
    }
  }, [auth.isAuthenticated, auth.user, auth.loading, autoRetry, retryAttempts, retryCount, retryDelay]);

  return {
    ...auth,
    retryAttempts,
    isRetrying,
    retryFetchUser,
    // Enhanced loading state that includes retrying
    loading: auth.loading || isRetrying,
    // Enhanced user availability check
    userAvailable: auth.isAuthenticated && !!auth.user && !auth.loading && !isRetrying,
  };
};

export default useAuthWithRetry; 
