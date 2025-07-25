import { useState, useCallback, useRef } from 'react';
import { 
  handleError as importedHandleError, 
  createErrorContext, 
  ErrorContext, 
  ErrorHandlingResult,
  ErrorCategory,
  errorLogger,
  LogLevel
} from '@/lib/errorHandling';
import { ErrorSeverity } from '@/apis/core/errors';

// Error state for contexts
export interface ContextErrorState {
  message: string | null;
  category: ErrorCategory | null;
  severity: ErrorSeverity | null;
  timestamp: number | null;
  shouldRetry: boolean;
  retryDelay?: number;
}

// Error handling options
export interface ContextErrorOptions {
  module: string;
  customMessages?: Record<string, string>;
  autoClear?: boolean;
  clearDelay?: number;
  onError?: (result: ErrorHandlingResult, context: ErrorContext) => void;
  onRetry?: () => void;
}

// Context error handler hook
export function useContextErrorHandler(options: ContextErrorOptions) {
  const [errorState, setErrorState] = useState<ContextErrorState>({
    message: null,
    category: null,
    severity: null,
    timestamp: null,
    shouldRetry: false,
  });
  
  const [isRetrying, setIsRetrying] = useState(false);
  const clearTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      message: null,
      category: null,
      severity: null,
      timestamp: null,
      shouldRetry: false,
    });
    
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }
  }, []);
  
  // Handle error with context
  const handleContextError = useCallback((
    error: unknown,
    operation: string,
    additionalData?: Record<string, any>
  ): ErrorHandlingResult => {
    const context = createErrorContext(operation, options.module, additionalData);
    const result = importedHandleError(error, context, options.customMessages);
    
    // Update error state
    setErrorState({
      message: result.userMessage,
      category: result.category,
      severity: result.severity,
      timestamp: Date.now(),
      shouldRetry: result.shouldRetry,
      retryDelay: result.retryDelay,
    });
    
    // Auto-clear error if enabled
    if (options.autoClear && result.severity !== ErrorSeverity.CRITICAL) {
      const delay = options.clearDelay || 5000;
      clearTimeoutRef.current = setTimeout(clearError, delay);
    }
    
    // Call custom error handler
    options.onError?.(result, context);
    
    return result;
  }, [options, clearError]);
  
  // Retry operation
  const retry = useCallback(async (operation: () => Promise<any>) => {
    if (!errorState.shouldRetry || isRetrying) {
      return;
    }
    
    setIsRetrying(true);
    clearError();
    
    try {
      // Wait for retry delay if specified
      if (errorState.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, errorState.retryDelay));
      }
      
      await operation();
      options.onRetry?.();
    } catch (error) {
      // Handle retry error
      handleContextError(error, 'retry_operation', { 
        originalError: errorState.message,
        retryAttempt: 1 
      });
    } finally {
      setIsRetrying(false);
    }
  }, [errorState, isRetrying, clearError, handleContextError, options]);
  
  // Wrap async operations with error handling
  const withErrorHandling = useCallback(<T extends any[], R>(
    operation: (...args: T) => Promise<R>,
    operationName: string
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await operation(...args);
      } catch (error) {
        const result = handleContextError(error, operationName);
        
        // Re-throw with user-friendly message for components to handle
        const enhancedError = new Error(result.userMessage);
        enhancedError.cause = error;
        throw enhancedError;
      }
    };
  }, [handleContextError]);
  
  // Handle specific error types
  const handleNetworkError = useCallback((error: unknown, operation: string) => {
    return handleContextError(error, operation, { errorType: 'network' });
  }, [handleContextError]);
  
  const handleValidationError = useCallback((error: unknown, operation: string, field?: string) => {
    return handleContextError(error, operation, { 
      errorType: 'validation',
      field 
    });
  }, [handleContextError]);
  
  const handleAuthError = useCallback((error: unknown, operation: string) => {
    return handleContextError(error, operation, { errorType: 'authentication' });
  }, [handleContextError]);
  
  const handleServerError = useCallback((error: unknown, operation: string) => {
    return handleContextError(error, operation, { errorType: 'server' });
  }, [handleContextError]);
  
  // Check if error is of specific type
  const isNetworkError = errorState.category === ErrorCategory.NETWORK;
  const isValidationError = errorState.category === ErrorCategory.VALIDATION;
  const isAuthError = errorState.category === ErrorCategory.AUTHENTICATION;
  const isServerError = errorState.category === ErrorCategory.SERVER;
  const isCriticalError = errorState.severity === ErrorSeverity.CRITICAL;
  
  // Get error icon based on category
  const getErrorIcon = () => {
    switch (errorState.category) {
      case ErrorCategory.NETWORK:
        return '🌐';
      case ErrorCategory.AUTHENTICATION:
        return '🔐';
      case ErrorCategory.AUTHORIZATION:
        return '🚫';
      case ErrorCategory.VALIDATION:
        return '⚠️';
      case ErrorCategory.SERVER:
        return '🛠️';
      case ErrorCategory.NOT_FOUND:
        return '🔍';
      case ErrorCategory.CONFLICT:
        return '⚡';
      case ErrorCategory.UNKNOWN:
        return '❌';
      default:
        return '❌';
    }
  };
  
  // Get error color based on severity
  const getErrorColor = () => {
    switch (errorState.severity) {
      case ErrorSeverity.INFO:
        return 'text-blue-600';
      case ErrorSeverity.WARNING:
        return 'text-yellow-600';
      case ErrorSeverity.ERROR:
        return 'text-red-600';
      case ErrorSeverity.CRITICAL:
        return 'text-red-800';
      default:
        return 'text-red-600';
    }
  };
  
  return {
    // Error state
    error: errorState,
    isRetrying,
    hasError: !!errorState.message,
    
    // Error type checks
    isNetworkError,
    isValidationError,
    isAuthError,
    isServerError,
    isCriticalError,
    
    // Error handling methods
    handleError: handleContextError,
    handleNetworkError,
    handleValidationError,
    handleAuthError,
    handleServerError,
    withErrorHandling,
    
    // Error management
    clearError,
    retry,
    
    // UI helpers
    getErrorIcon,
    getErrorColor,
  };
}

// Hook for handling multiple error states in a context
export function useMultiErrorHandler(options: ContextErrorOptions) {
  const [errors, setErrors] = useState<Record<string, ContextErrorState>>({});
  
  const handleError = useCallback((
    error: unknown,
    operation: string,
    errorKey: string,
    additionalData?: Record<string, any>
  ) => {
    const context = createErrorContext(operation, options.module, additionalData);
    const result = importedHandleError(error, context, options.customMessages);
    
    const errorState: ContextErrorState = {
      message: result.userMessage,
      category: result.category,
      severity: result.severity,
      timestamp: Date.now(),
      shouldRetry: result.shouldRetry,
      retryDelay: result.retryDelay,
    };
    
    setErrors(prev => ({
      ...prev,
      [errorKey]: errorState,
    }));
    
    options.onError?.(result, context);
    return result;
  }, [options]);
  
  const clearError = useCallback((errorKey: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[errorKey];
      return newErrors;
    });
  }, []);
  
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  const hasErrors = Object.keys(errors).length > 0;
  const hasCriticalErrors = Object.values(errors).some(
    error => error.severity === ErrorSeverity.CRITICAL
  );
  
  return {
    errors,
    hasErrors,
    hasCriticalErrors,
    handleError,
    clearError,
    clearAllErrors,
  };
}

// Hook for handling async operations with loading states
export function useAsyncOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: ContextErrorOptions & {
    operationName: string;
  }
) {
  const [isLoading, setIsLoading] = useState(false);
  const errorHandler = useContextErrorHandler(options);
  
  const execute = useCallback(async (...args: T): Promise<R> => {
    setIsLoading(true);
    errorHandler.clearError();
    
    try {
      const result = await operation(...args);
      return result;
    } catch (error) {
      errorHandler.handleError(error, options.operationName);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [operation, errorHandler, options.operationName]);
  
  return {
    execute,
    isLoading,
    error: errorHandler.error,
    hasError: errorHandler.hasError,
    clearError: errorHandler.clearError,
    retry: () => errorHandler.retry(() => execute(...([] as T))),
  };
} 