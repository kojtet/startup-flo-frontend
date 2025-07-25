import { useState, useCallback, useEffect } from 'react';

// ================================
// ERROR BOUNDARY HOOKS
// ================================

export interface ErrorInfo {
  error: Error;
  errorId: string;
  timestamp: string;
  context?: string;
}

export interface UseErrorBoundaryOptions {
  onError?: (errorInfo: ErrorInfo) => void;
  resetOnDependencyChange?: boolean;
  resetKeys?: Array<string | number>;
}

export interface UseErrorBoundaryReturn {
  error: Error | null;
  hasError: boolean;
  errorId: string | null;
  resetError: () => void;
  captureError: (error: Error, context?: string) => void;
}

// Main error boundary hook for functional components
export function useErrorBoundary(options: UseErrorBoundaryOptions = {}): UseErrorBoundaryReturn {
  const { onError, resetOnDependencyChange = false, resetKeys } = options;
  
  const [error, setError] = useState<Error | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  // Reset error when dependencies change
  useEffect(() => {
    if (resetOnDependencyChange && hasError) {
      resetError();
    }
  }, resetKeys);

  const resetError = useCallback(() => {
    setError(null);
    setErrorId(null);
    setHasError(false);
  }, []);

  const captureError = useCallback((error: Error, context?: string) => {
    const newErrorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const errorInfo: ErrorInfo = {
      error,
      errorId: newErrorId,
      timestamp: new Date().toISOString(),
      context,
    };

    setError(error);
    setErrorId(newErrorId);
    setHasError(true);

    // Call error handler
    if (onError) {
      try {
        onError(errorInfo);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Captured via Hook`);
      console.error('Error:', error);
      console.log('Context:', context);
      console.log('Error ID:', newErrorId);
      console.groupEnd();
    }
  }, [onError]);

  return {
    error,
    hasError,
    errorId,
    resetError,
    captureError,
  };
}

// ================================
// ASYNC ERROR HANDLING HOOKS
// ================================

export interface UseAsyncErrorOptions {
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

export interface UseAsyncErrorReturn<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  retry: () => void;
  execute: (asyncFn: () => Promise<T>) => Promise<void>;
  reset: () => void;
}

// Hook for handling async operations with error boundaries
export function useAsyncError<T = any>(options: UseAsyncErrorOptions = {}): UseAsyncErrorReturn<T> {
  const { onError, retryCount = 3, retryDelay = 1000 } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentRetry, setCurrentRetry] = useState(0);
  const [lastAsyncFn, setLastAsyncFn] = useState<(() => Promise<T>) | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setCurrentRetry(0);
    setLastAsyncFn(null);
  }, []);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setLastAsyncFn(() => asyncFn);
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      setCurrentRetry(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const retry = useCallback(async () => {
    if (!lastAsyncFn || currentRetry >= retryCount) {
      return;
    }

    setCurrentRetry(prev => prev + 1);
    
    // Add delay before retry
    await new Promise(resolve => setTimeout(resolve, retryDelay * currentRetry));
    
    await execute(lastAsyncFn);
  }, [lastAsyncFn, currentRetry, retryCount, retryDelay, execute]);

  return {
    data,
    error,
    loading,
    retry,
    execute,
    reset,
  };
}

// ================================
// SAFE ASYNC EXECUTION HOOKS
// ================================

export interface UseSafeAsyncOptions {
  fallbackValue?: any;
  onError?: (error: Error) => void;
  shouldRetry?: (error: Error, retryCount: number) => boolean;
  maxRetries?: number;
}

// Hook for safely executing async operations with automatic error handling
export function useSafeAsync<T>(options: UseSafeAsyncOptions = {}) {
  const { fallbackValue = null, onError, shouldRetry, maxRetries = 3 } = options;
  const { captureError } = useErrorBoundary({ onError });

  const safeExecute = useCallback(async (
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T> => {
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        return await asyncFn();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry
        if (retryCount < maxRetries && (!shouldRetry || shouldRetry(err, retryCount))) {
          retryCount++;
          continue;
        }
        
        // Capture error and return fallback
        captureError(err, context);
        return fallbackValue;
      }
    }
    
    return fallbackValue;
  }, [captureError, fallbackValue, shouldRetry, maxRetries]);

  return { safeExecute };
}

// ================================
// ERROR REPORTING HOOKS
// ================================

export interface UseErrorReportingOptions {
  enableReporting?: boolean;
  endpoint?: string;
  metadata?: Record<string, any>;
}

// Hook for error reporting functionality
export function useErrorReporting(options: UseErrorReportingOptions = {}) {
  const { enableReporting = true, endpoint = '/api/errors', metadata = {} } = options;

  const reportError = useCallback(async (error: Error, context?: string) => {
    if (!enableReporting) return;

    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      metadata,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    try {
      if (process.env.NODE_ENV === 'production') {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorReport),
        });
      } else {
        console.log('Error report (dev mode):', errorReport);
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }, [enableReporting, endpoint, metadata]);

  return { reportError };
}

// ================================
// COMPONENT SAFETY HOOKS
// ================================

// Hook for safely rendering components with error fallbacks
export function useSafeComponent<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error }> | React.ReactNode
) {
  const { error, hasError, captureError, resetError } = useErrorBoundary();

  const SafeComponent = useCallback((props: P) => {
    if (hasError && error) {
      if (fallback) {
        if (React.isValidElement(fallback)) {
          return fallback;
        }
        const FallbackComponent = fallback as React.ComponentType<{ error: Error }>;
        return <FallbackComponent error={error} />;
      }
      return <div>Component error: {error.message}</div>;
    }

    try {
      return <Component {...props} />;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      captureError(error, Component.displayName || Component.name);
      return null;
    }
  }, [Component, fallback, hasError, error, captureError]);

  return { SafeComponent, error, hasError, resetError };
}

// ================================
// UTILITY FUNCTIONS
// ================================

// Wrapper function for safe async execution
export function withErrorBoundary<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    fallback?: R;
    onError?: (error: Error) => void;
    context?: string;
  } = {}
) {
  const { fallback, onError, context } = options;

  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (onError) {
        onError(err);
      }

      if (process.env.NODE_ENV === 'development') {
        console.error(`Error in ${context || 'async function'}:`, err);
      }

      if (fallback !== undefined) {
        return fallback;
      }

      throw err;
    }
  };
}

// Error boundary wrapper for components
export function withSafeExecution<T>(
  fn: () => T,
  fallback: T,
  context?: string
): T {
  try {
    return fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${context || 'function'}:`, err);
    }

    return fallback;
  }
} 