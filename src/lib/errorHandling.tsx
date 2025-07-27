/**
 * @fileoverview Comprehensive error handling utilities for the Fihankra Safety Sentinel application.
 * 
 * This module provides standardized error handling, categorization, user-friendly messages,
 * retry strategies, logging, and reporting capabilities for consistent error management
 * across all contexts and components.
 * 
 * @author Fihankra Safety Sentinel Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useCallback } from "react";
import {
  AppError,
  ValidationError,
  ValidationResult,
  ErrorBoundaryState,
  ErrorHandlerConfig,
  isAppError
} from './types';
import { 
  ErrorSeverity, 
  ApiError, 
  handleApiError 
} from '@/apis/core/errors';

// Error categories for different types of operations
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NETWORK = "network",
  VALIDATION = "validation",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  SERVER = "server",
  UNKNOWN = "unknown",
}

// Error context for better error reporting
export interface ErrorContext {
  operation: string;
  module: string;
  userId?: string;
  timestamp: number;
  additionalData?: Record<string, any>;
}

// Error handling result
export interface ErrorHandlingResult {
  userMessage: string;
  shouldRetry: boolean;
  retryDelay?: number;
  shouldLog: boolean;
  severity: ErrorSeverity;
  category: ErrorCategory;
}

// Retry strategy interface
export interface RetryStrategy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

// Error report interface
export interface ErrorReport {
  error: {
    code: string;
    message: string;
    userFriendlyMessage?: string;
    category?: string;
    severity: ErrorSeverity;
    retryable?: boolean;
    timestamp: string;
    stack?: string;
  };
  context?: ErrorContext;
}

// User-friendly error messages
const USER_MESSAGES = {
  [ErrorCategory.AUTHENTICATION]: {
    default: "Please log in again to continue.",
    expired: "Your session has expired. Please log in again.",
    invalid: "Invalid credentials. Please check your login details.",
  },
  [ErrorCategory.AUTHORIZATION]: {
    default: "You don't have permission to perform this action.",
    insufficient: "You need additional permissions for this operation.",
    role_required: "This action requires a specific role.",
  },
  [ErrorCategory.NETWORK]: {
    default: "Connection failed. Please check your internet connection.",
    timeout: "Request timed out. Please try again.",
    offline: "You appear to be offline. Please check your connection.",
  },
  [ErrorCategory.VALIDATION]: {
    default: "Please check your input and try again.",
    required: "This field is required.",
    format: "Please use the correct format.",
    length: "The input is too long or too short.",
  },
  [ErrorCategory.NOT_FOUND]: {
    default: "The requested item was not found.",
    resource: "The resource you're looking for doesn't exist.",
    page: "The page you're looking for doesn't exist.",
  },
  [ErrorCategory.CONFLICT]: {
    default: "This action conflicts with the current state.",
    duplicate: "This item already exists.",
    locked: "This item is currently in use.",
  },
  [ErrorCategory.SERVER]: {
    default: "Something went wrong on our end. Please try again later.",
    maintenance: "We're currently performing maintenance. Please try again later.",
    overloaded: "Our servers are busy. Please try again in a moment.",
  },
  [ErrorCategory.UNKNOWN]: {
    default: "An unexpected error occurred. Please try again.",
  },
} as const;

// Retry strategies for different error types
const RETRY_STRATEGIES = {
  [ErrorCategory.NETWORK]: {
    shouldRetry: true,
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },
  [ErrorCategory.SERVER]: {
    shouldRetry: true,
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 15000,
  },
  [ErrorCategory.AUTHENTICATION]: {
    shouldRetry: false,
    maxRetries: 0,
  },
  [ErrorCategory.AUTHORIZATION]: {
    shouldRetry: false,
    maxRetries: 0,
  },
  [ErrorCategory.VALIDATION]: {
    shouldRetry: false,
    maxRetries: 0,
  },
  [ErrorCategory.NOT_FOUND]: {
    shouldRetry: false,
    maxRetries: 0,
  },
  [ErrorCategory.CONFLICT]: {
    shouldRetry: false,
    maxRetries: 0,
  },
  [ErrorCategory.UNKNOWN]: {
    shouldRetry: true,
    maxRetries: 1,
    baseDelay: 1000,
    maxDelay: 5000,
  },
} as const;

// Error logging levels
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  CRITICAL = "critical",
}

// Error logger interface
export interface ErrorLogger {
  log(level: LogLevel, message: string, error?: Error, context?: ErrorContext): void;
  report(error: Error, context?: ErrorContext): void;
}

// Console-based error logger (can be replaced with external services)
export class ConsoleErrorLogger implements ErrorLogger {
  log(level: LogLevel, message: string, error?: Error, context?: ErrorContext): void {
    const logEntry = {
      level,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      context,
      timestamp: new Date().toISOString(),
    };

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logEntry);
        break;
      case LogLevel.INFO:
        console.info(logEntry);
        break;
      case LogLevel.WARN:
        console.warn(logEntry);
        break;
      case LogLevel.ERROR:
        console.error(logEntry);
        break;
      case LogLevel.CRITICAL:
        console.error("🚨 CRITICAL ERROR:", logEntry);
        break;
    }
  }

  report(error: Error, context?: ErrorContext): void {
    // In a real application, this would send to an error reporting service
    // like Sentry, LogRocket, or a custom error tracking system
    this.log(LogLevel.ERROR, "Error reported", error, context);
  }
}

// Global error logger instance
export const errorLogger = new ConsoleErrorLogger();

// Main error handling function
export function handleError(
  error: unknown,
  context: ErrorContext,
  customMessages?: Record<string, string>
): ErrorHandlingResult {
  const apiError = handleApiError(error);
  const category = getErrorCategory(apiError);
  const strategy = RETRY_STRATEGIES[category];
  
  // Get user-friendly message
  const userMessage = getUserMessage(apiError, category, customMessages);
  
  // Determine retry strategy
  const shouldRetry = strategy.shouldRetry;
  const retryDelay = shouldRetry && 'baseDelay' in strategy && 'maxDelay' in strategy 
    ? calculateRetryDelay(strategy, 0) 
    : undefined;
  
  // Determine logging level
  const shouldLog = shouldLogError(apiError, category);
  const logLevel = getLogLevel(apiError.severity);
  
  // Log the error
  if (shouldLog) {
    errorLogger.log(logLevel, userMessage, apiError, context);
  }
  
  // Report critical errors
  if (apiError.severity === ErrorSeverity.CRITICAL) {
    errorLogger.report(apiError, context);
  }
  
  return {
    userMessage,
    shouldRetry,
    retryDelay,
    shouldLog,
    severity: apiError.severity,
    category,
  };
}

// Get error category from API error
function getErrorCategory(error: ApiError): ErrorCategory {
  switch (error.statusCode) {
    case 401:
      return ErrorCategory.AUTHENTICATION;
    case 403:
      return ErrorCategory.AUTHORIZATION;
    case 404:
      return ErrorCategory.NOT_FOUND;
    case 409:
      return ErrorCategory.CONFLICT;
    case 422:
      return ErrorCategory.VALIDATION;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorCategory.SERVER;
    case 0:
      return ErrorCategory.NETWORK;
    default:
      return ErrorCategory.UNKNOWN;
  }
}

// Get user-friendly message
function getUserMessage(
  error: ApiError,
  category: ErrorCategory,
  customMessages?: Record<string, string>
): string {
  // Check for custom message first
  if (customMessages && customMessages[error.errorCode || '']) {
    return customMessages[error.errorCode!];
  }
  
  // Check for specific error codes
  const specificMessage = getSpecificMessage(error, category);
  if (specificMessage) {
    return specificMessage;
  }
  
  // Return default message for category
  return USER_MESSAGES[category].default;
}

// Get specific message based on error code
function getSpecificMessage(error: ApiError, category: ErrorCategory): string | null {
  const messages = USER_MESSAGES[category] as any;
  
  switch (error.errorCode) {
    case 'SESSION_EXPIRED':
    case 'TOKEN_EXPIRED':
      return messages.expired || messages.default;
    case 'INVALID_CREDENTIALS':
      return messages.invalid || messages.default;
    case 'INSUFFICIENT_PERMISSIONS':
      return messages.insufficient || messages.default;
    case 'ROLE_REQUIRED':
      return messages.role_required || messages.default;
    case 'REQUEST_TIMEOUT':
      return messages.timeout || messages.default;
    case 'OFFLINE':
      return messages.offline || messages.default;
    case 'REQUIRED_FIELD':
      return messages.required || messages.default;
    case 'INVALID_FORMAT':
      return messages.format || messages.default;
    case 'INVALID_LENGTH':
      return messages.length || messages.default;
    case 'RESOURCE_NOT_FOUND':
      return messages.resource || messages.default;
    case 'PAGE_NOT_FOUND':
      return messages.page || messages.default;
    case 'DUPLICATE_ENTRY':
      return messages.duplicate || messages.default;
    case 'RESOURCE_LOCKED':
      return messages.locked || messages.default;
    case 'MAINTENANCE_MODE':
      return messages.maintenance || messages.default;
    case 'SERVER_OVERLOADED':
      return messages.overloaded || messages.default;
    default:
      return null;
  }
}

// Calculate retry delay with exponential backoff
function calculateRetryDelay(
  strategy: { baseDelay: number; maxDelay: number }, 
  attempt: number
): number {
  const delay = Math.min(
    strategy.baseDelay * Math.pow(2, attempt),
    strategy.maxDelay
  );
  
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

// Determine if error should be logged
function shouldLogError(error: ApiError, category: ErrorCategory): boolean {
  // Always log critical errors
  if (error.severity === ErrorSeverity.CRITICAL) {
    return true;
  }
  
  // Log server and network errors
  if (category === ErrorCategory.SERVER || category === ErrorCategory.NETWORK) {
    return true;
  }
  
  // Log authentication errors for security monitoring
  if (category === ErrorCategory.AUTHENTICATION) {
    return true;
  }
  
  // Don't log validation errors (too noisy)
  if (category === ErrorCategory.VALIDATION) {
    return false;
  }
  
  // Log other errors based on severity
  return error.severity === ErrorSeverity.ERROR;
}

// Get log level from error severity
function getLogLevel(severity: ErrorSeverity): LogLevel {
  switch (severity) {
    case ErrorSeverity.INFO:
      return LogLevel.INFO;
    case ErrorSeverity.WARNING:
      return LogLevel.WARN;
    case ErrorSeverity.ERROR:
      return LogLevel.ERROR;
    case ErrorSeverity.CRITICAL:
      return LogLevel.CRITICAL;
    default:
      return LogLevel.ERROR;
  }
}

// Retry wrapper for async operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      const handlingResult = handleError(error, {
        ...context,
        additionalData: { attempt: attempt + 1, maxRetries },
      });
      
      if (!handlingResult.shouldRetry) {
        throw error;
      }
      
      // Wait before retrying
      const delay = calculateRetryDelay(
        { baseDelay, maxDelay: baseDelay * 10 },
        attempt
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Error boundary helper
export function createErrorBoundary(
  fallback: React.ComponentType<{ error: Error; retry: () => void }>,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      const context: ErrorContext = {
        operation: "react_component",
        module: "error_boundary",
        timestamp: Date.now(),
        additionalData: {
          componentStack: errorInfo.componentStack,
        },
      };
      
      handleError(error, context);
      onError?.(error, errorInfo);
    }

    retry = () => {
      this.setState({ hasError: false, error: null });
    };

    render() {
      if (this.state.hasError && this.state.error) {
        const FallbackComponent = fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return this.props.children;
    }
  };
}



// Utility for creating error contexts
export function createErrorContext(
  operation: string,
  module: string,
  additionalData?: Record<string, any>
): ErrorContext {
  return {
    operation,
    module,
    timestamp: Date.now(),
    additionalData,
  };
}

// ================================
// ERROR CATEGORIES AND SEVERITY
// ================================

/**
 * Error categories for different types of errors
 */
export const ERROR_CATEGORIES: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: 'Network Error',
  [ErrorCategory.VALIDATION]: 'Validation Error',
  [ErrorCategory.AUTHENTICATION]: 'Authentication Error',
  [ErrorCategory.AUTHORIZATION]: 'Authorization Error',
  [ErrorCategory.NOT_FOUND]: 'Not Found Error',
  [ErrorCategory.SERVER]: 'Server Error',
  [ErrorCategory.CONFLICT]: 'Conflict Error',
  [ErrorCategory.UNKNOWN]: 'Unknown Error'
};

/**
 * Error severity levels with descriptions
 */
export const ERROR_SEVERITY: Record<ErrorSeverity, string> = {
  [ErrorSeverity.INFO]: 'Info',
  [ErrorSeverity.WARNING]: 'Warning',
  [ErrorSeverity.ERROR]: 'Error',
  [ErrorSeverity.CRITICAL]: 'Critical'
};

/**
 * Default error messages for common scenarios
 */
export const DEFAULT_ERROR_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: 'Unable to connect to the server. Please check your internet connection and try again.',
  [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
  [ErrorCategory.AUTHENTICATION]: 'Your session has expired. Please log in again.',
  [ErrorCategory.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ErrorCategory.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCategory.SERVER]: 'An unexpected error occurred on the server. Please try again later.',
  [ErrorCategory.CONFLICT]: 'This action conflicts with the current state.',
  [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

// ================================
// ERROR CREATION AND CATEGORIZATION
// ================================

/**
 * Creates a standardized AppError from any error object
 * 
 * @param error - The original error object
 * @param context - Additional context information
 * @param category - Error category (auto-detected if not provided)
 * @param severity - Error severity (defaults to ERROR)
 * @returns Standardized AppError object
 * 
 * @example
 * ```typescript
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const appError = createStandardizedError(error, {
 *     operation: 'fetchUsers',
 *     userId: '123'
 *   });
 *   console.log(appError.userFriendlyMessage);
 * }
 * ```
 */
export function createStandardizedError(
  error: any,
  context?: ErrorContext,
  category?: ErrorCategory,
  severity: ErrorSeverity = ErrorSeverity.ERROR
): AppError {
  // If it's already an AppError, return it
  if (isAppError(error)) {
    return error;
  }

  // Auto-detect category if not provided
  if (!category) {
    category = detectErrorCategory(error);
  }

  // Create user-friendly message
  const userFriendlyMessage = createUserFriendlyMessage(error, category);

  // Create standardized error
  return {
    name: error.name || 'AppError',
    message: error.message || 'An error occurred',
    code: generateErrorCode(category, context),
    statusCode: extractStatusCode(error),
    context: {
      ...context,
      originalError: error.message || error.toString(),
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    },
    timestamp: new Date().toISOString(),
    userFriendlyMessage,
    retryable: isRetryableError(category, error),
    severity
  };
}

/**
 * Detects the error category based on the error object
 * 
 * @param error - The error object to analyze
 * @returns Detected error category
 */
export function detectErrorCategory(error: any): ErrorCategory {
  if (!error) return ErrorCategory.UNKNOWN;

  const message = error.message?.toLowerCase() || '';
  const name = error.name?.toLowerCase() || '';
  const status = error.status || error.statusCode;

  // Network errors
  if (message.includes('network') || message.includes('fetch') || 
      message.includes('connection') || name.includes('network')) {
    return ErrorCategory.NETWORK;
  }

  // HTTP status-based categorization
  if (status) {
    if (status === 401) return ErrorCategory.AUTHENTICATION;
    if (status === 403) return ErrorCategory.AUTHORIZATION;
    if (status === 404) return ErrorCategory.NOT_FOUND;
    if (status === 422) return ErrorCategory.VALIDATION;
    if (status === 409) return ErrorCategory.CONFLICT;
    if (status >= 500) return ErrorCategory.SERVER;
    if (status >= 400) return ErrorCategory.VALIDATION;
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') ||
      name.includes('validation')) {
    return ErrorCategory.VALIDATION;
  }

  // Timeout errors
  if (message.includes('timeout') || name.includes('timeout')) {
    return ErrorCategory.NETWORK;
  }

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('authentication') ||
      name.includes('auth')) {
    return ErrorCategory.AUTHENTICATION;
  }

  // Authorization errors
  if (message.includes('forbidden') || message.includes('permission') ||
      name.includes('authorization')) {
    return ErrorCategory.AUTHORIZATION;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Creates user-friendly error messages
 * 
 * @param error - The original error
 * @param category - The error category
 * @returns User-friendly error message
 */
export function createUserFriendlyMessage(error: any, category: ErrorCategory): string {
  // Check if error has a user-friendly message
  if (error.userFriendlyMessage) {
    return error.userFriendlyMessage;
  }

  // Use default messages for common categories
  const defaultMessage = DEFAULT_ERROR_MESSAGES[category];
  
  // Add specific details for certain error types
  switch (category) {
    case ErrorCategory.VALIDATION:
      if (error.errors && Array.isArray(error.errors)) {
        const firstError = error.errors[0];
        return `${defaultMessage} ${firstError.message || ''}`;
      }
      break;
    case ErrorCategory.NOT_FOUND:
      if (error.resource) {
        return `The ${error.resource} was not found.`;
      }
      break;
  }

  return defaultMessage;
}

/**
 * Generates a standardized error code
 * 
 * @param category - Error category
 * @param context - Error context
 * @returns Generated error code
 */
export function generateErrorCode(category: ErrorCategory, context?: ErrorContext): string {
  const prefix = category.toUpperCase();
  const operation = context?.operation?.toUpperCase() || 'UNKNOWN';
  const timestamp = Date.now().toString(36);
  
  return `${prefix}_${operation}_${timestamp}`;
}

/**
 * Extracts HTTP status code from error object
 * 
 * @param error - Error object
 * @returns HTTP status code or undefined
 */
export function extractStatusCode(error: any): number | undefined {
  return error.status || error.statusCode || error.response?.status;
}

/**
 * Determines if an error is retryable
 * 
 * @param category - Error category
 * @param error - Error object
 * @returns Whether the error is retryable
 */
export function isRetryableError(category: ErrorCategory, error: any): boolean {
  // Network errors are usually retryable
  if (category === ErrorCategory.NETWORK) return true;
  
  // Server errors (5xx) are retryable
  if (category === ErrorCategory.SERVER) return true;
  
  // Check if error explicitly indicates retryability
  if (error.retryable !== undefined) return error.retryable;
  
  return false;
}

// ================================
// RETRY STRATEGIES
// ================================

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryStrategy = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['NETWORK', 'SERVER']
};

/**
 * Executes a function with retry logic
 * 
 * @param fn - Function to execute
 * @param config - Retry configuration
 * @returns Promise that resolves with the function result
 * 
 * @example
 * ```typescript
 * const result = await withRetryOperation(
 *   () => api.fetchData(),
 *   { maxAttempts: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function withRetryOperation<T>(
  fn: () => Promise<T>,
  config: Partial<RetryStrategy> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt === retryConfig.maxAttempts) {
        break;
      }

      const category = detectErrorCategory(error);
      if (!retryConfig.retryableErrors.includes(category)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
        retryConfig.maxDelay
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ================================
// ERROR LOGGING AND REPORTING
// ================================

/**
 * Logs an error with appropriate level and context
 * 
 * @param error - Error to log
 * @param context - Additional context
 * @param level - Log level
 */
export function logError(
  error: AppError,
  context?: ErrorContext,
  level: 'error' | 'warn' | 'info' = 'error'
): void {
  const logData = {
    error: {
      code: error.code,
      message: error.message,
      userFriendlyMessage: error.userFriendlyMessage,
      category: error.context?.category,
      severity: error.severity,
      retryable: error.retryable,
      timestamp: error.timestamp
    },
    context: {
      ...context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString()
    }
  };

  switch (level) {
    case 'error':
      console.error('Application Error:', logData);
      break;
    case 'warn':
      console.warn('Application Warning:', logData);
      break;
    case 'info':
      console.info('Application Info:', logData);
      break;
  }

  // Send to external logging service if configured
  if (typeof window !== 'undefined' && (window as any).logError) {
    (window as any).logError(logData);
  }
}

/**
 * Reports an error to external services
 * 
 * @param error - Error to report
 * @param context - Additional context
 * @returns Promise that resolves when reporting is complete
 */
export async function reportError(error: AppError, context?: ErrorContext): Promise<void> {
  const errorReport: ErrorReport = {
    error: {
      code: error.code,
      message: error.message,
      userFriendlyMessage: error.userFriendlyMessage,
      category: error.context?.category,
      severity: error.severity,
      retryable: error.retryable,
      timestamp: error.timestamp,
      stack: error.stack
    },
    context: {
      ...context,
      timestamp: Date.now(),
      additionalData: {
        ...context?.additionalData,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        userId: typeof window !== 'undefined' ? (window as any).userId : undefined,
        sessionId: typeof window !== 'undefined' ? (window as any).sessionId : undefined
      }
    }
  };

  try {
    // Send to error reporting service
    await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorReport)
    });
  } catch (reportingError) {
    // Fallback to console if reporting fails
    console.error('Failed to report error:', reportingError);
    console.error('Original error:', errorReport);
  }
}

// ================================
// ERROR HANDLER HOOK
// ================================

/**
 * Hook for standardized error handling in React components
 * 
 * @param config - Error handler configuration
 * @returns Error handler functions
 * 
 * @example
 * ```typescript
 * const { handleError, clearError, retryOperation } = useErrorHandler({
 *   onError: (error) => toast.error(error.userFriendlyMessage),
 *   onRetry: () => refetchData()
 * });
 * ```
 */
export function useErrorHandler(config: ErrorHandlerConfig = {}) {
  const [errors, setErrors] = useState<AppError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleError = useCallback((error: any, context?: ErrorContext) => {
    const appError = createStandardizedError(error, context);
    
    setErrors(prev => [...prev, appError]);
    
    // Log the error
    logError(appError, context);
    
    // Report critical errors
    if (appError.severity === ErrorSeverity.CRITICAL || appError.severity === ErrorSeverity.ERROR) {
      reportError(appError, context);
    }
    
    // Call custom error handler
    if (config.onError) {
      config.onError(appError);
    }
    
    return appError;
  }, [config.onError]);

  const clearError = useCallback((errorCode?: string) => {
    if (errorCode) {
      setErrors(prev => prev.filter(error => error.code !== errorCode));
    } else {
      setErrors([]);
    }
  }, []);

  const retryOperation = useCallback(async (
    operation: () => Promise<any>,
    context?: ErrorContext
  ) => {
    setIsProcessing(true);
    try {
      const result = await withRetryOperation(operation);
      clearError();
      if (config.onRetry) {
        config.onRetry();
      }
      return result;
    } catch (error) {
      handleError(error, context);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [handleError, clearError, config]);

  const wrapAsyncOperation = useCallback((
    operation: (...args: any[]) => Promise<any>,
    context?: ErrorContext
  ) => {
    return async (...args: any[]) => {
      try {
        return await operation(...args);
      } catch (error) {
        handleError(error, context);
        throw error;
      }
    };
  }, [handleError]);

  return {
    errors,
    isProcessing,
    handleError,
    clearError,
    retryOperation,
    wrapAsyncOperation,
    hasErrors: errors.length > 0,
    getLatestError: () => errors[errors.length - 1]
  };
}

// ================================
// ERROR BOUNDARY UTILITIES
// ================================

/**
 * Creates error boundary state from error
 * 
 * @param error - Error object
 * @returns Error boundary state
 */
export function createErrorBoundaryState(error: any): ErrorBoundaryState {
  const appError = createStandardizedError(error, {
    operation: 'ErrorBoundary',
    module: 'ErrorBoundary',
    timestamp: Date.now()
  });

  return {
    hasError: true,
    error: appError,
    errorInfo: {
      componentStack: error.componentStack || '',
    }
  };
}

/**
 * Resets error boundary state
 * 
 * @returns Reset error boundary state
 */
export function resetErrorBoundaryState(): ErrorBoundaryState {
  return {
    hasError: false,
    error: null,
    errorInfo: null
  };
}

// ================================
// VALIDATION ERROR UTILITIES
// ================================

/**
 * Converts validation errors to AppError format
 * 
 * @param validationResult - Validation result
 * @param context - Error context
 * @returns AppError object
 */
export function validationResultToError(
  validationResult: ValidationResult,
  context?: ErrorContext
): AppError {
  return createStandardizedError(
    new Error('Validation failed'),
    {
      ...context,
      additionalData: { validationErrors: validationResult.errors }
    },
    ErrorCategory.VALIDATION,
    ErrorSeverity.WARNING
  );
}

/**
 * Formats validation errors for display
 * 
 * @param errors - Validation errors
 * @returns Formatted error messages
 */
export function formatValidationErrors(errors: ValidationError[]): string[] {
  return errors.map(error => {
    if (error.field) {
      return `${error.field}: ${error.message}`;
    }
    return error.message;
  });
}

 