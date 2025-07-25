/**
 * @fileoverview Standardized error display components for consistent error UI.
 * 
 * This module provides reusable error display components that can be used
 * throughout the application to show errors in a consistent and user-friendly way.
 * 
 * @author Fihankra Safety Sentinel Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Info, 
  AlertCircle, 
  XCircle,
  CheckCircle
} from 'lucide-react';
import { AppError, ErrorSeverity } from '@/lib/types';
import { ERROR_CATEGORIES, ERROR_SEVERITY } from '@/lib/errorHandling';

// ================================
// ERROR DISPLAY COMPONENTS
// ================================

/**
 * Props for error display components
 */
export interface ErrorDisplayProps {
  /** The error to display */
  error: AppError;
  /** Whether to show the error title */
  showTitle?: boolean;
  /** Whether to show the error code */
  showCode?: boolean;
  /** Whether to show the error timestamp */
  showTimestamp?: boolean;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Retry function to call */
  onRetry?: () => void;
  /** Whether to show dismiss button */
  showDismiss?: boolean;
  /** Dismiss function to call */
  onDismiss?: () => void;
  /** Custom className for styling */
  className?: string;
  /** Whether the error is loading (for retry operations) */
  isLoading?: boolean;
}

/**
 * Simple error alert component
 * 
 * @example
 * ```typescript
 * <ErrorAlert 
 *   error={appError}
 *   onRetry={() => refetchData()}
 *   showRetry={true}
 * />
 * ```
 */
export const ErrorAlert: React.FC<ErrorDisplayProps> = ({
  error,
  showTitle = true,
  showCode = false,
  showTimestamp = false,
  showRetry = false,
  onRetry,
  showDismiss = false,
  onDismiss,
  className,
  isLoading = false
}) => {
  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <XCircle className="h-4 w-4" />;
      case 'MEDIUM':
        return <AlertTriangle className="h-4 w-4" />;
      case 'LOW':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: ErrorSeverity): 'destructive' | 'default' => {
    return severity === 'CRITICAL' || severity === 'HIGH' ? 'destructive' : 'default';
  };

  return (
    <Alert variant={getSeverityVariant(error.severity)} className={className}>
      {getSeverityIcon(error.severity)}
      <AlertTitle>
        {showTitle && (
          <div className="flex items-center justify-between">
            <span>
              {ERROR_CATEGORIES[error.context?.category || 'UNKNOWN']}
            </span>
            {showCode && (
              <Badge variant="outline" className="text-xs">
                {error.code}
              </Badge>
            )}
          </div>
        )}
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>{error.userFriendlyMessage}</p>
          
          {showTimestamp && (
            <p className="text-xs text-muted-foreground">
              {new Date(error.timestamp).toLocaleString()}
            </p>
          )}
          
          {(showRetry || showDismiss) && (
            <div className="flex gap-2 mt-3">
              {showRetry && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Retry
                </Button>
              )}
              
              {showDismiss && onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                >
                  <X className="h-3 w-3 mr-1" />
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

/**
 * Detailed error card component
 * 
 * @example
 * ```typescript
 * <ErrorCard 
 *   error={appError}
 *   onRetry={() => refetchData()}
 *   showRetry={true}
 * />
 * ```
 */
export const ErrorCard: React.FC<ErrorDisplayProps> = ({
  error,
  showTitle = true,
  showCode = true,
  showTimestamp = true,
  showRetry = true,
  onRetry,
  showDismiss = true,
  onDismiss,
  className,
  isLoading = false
}) => {
  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`border-l-4 border-l-red-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">
              {ERROR_CATEGORIES[error.context?.category || 'UNKNOWN']}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getSeverityColor(error.severity)}>
              {ERROR_SEVERITY[error.severity]}
            </Badge>
            
            {showCode && (
              <Badge variant="secondary" className="text-xs font-mono">
                {error.code}
              </Badge>
            )}
          </div>
        </div>
        
        {showTimestamp && (
          <CardDescription>
            {new Date(error.timestamp).toLocaleString()}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Error Message</h4>
          <p className="text-sm text-muted-foreground">
            {error.userFriendlyMessage}
          </p>
        </div>
        
        {error.context && (
          <div>
            <h4 className="font-medium mb-2">Context</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {error.context.operation && (
                <p><strong>Operation:</strong> {error.context.operation}</p>
              )}
              {error.context.component && (
                <p><strong>Component:</strong> {error.context.component}</p>
              )}
              {error.context.userId && (
                <p><strong>User ID:</strong> {error.context.userId}</p>
              )}
            </div>
          </div>
        )}
        
        {(showRetry || showDismiss) && (
          <div className="flex gap-2 pt-2">
            {showRetry && onRetry && (
              <Button
                onClick={onRetry}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry Operation
              </Button>
            )}
            
            {showDismiss && onDismiss && (
              <Button
                variant="outline"
                onClick={onDismiss}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Inline error component for form fields
 * 
 * @example
 * ```typescript
 * <InlineError error={fieldError} />
 * ```
 */
export const InlineError: React.FC<{ error: AppError; className?: string }> = ({
  error,
  className
}) => {
  return (
    <div className={`flex items-center gap-1 text-sm text-red-600 ${className}`}>
      <AlertCircle className="h-3 w-3" />
      <span>{error.userFriendlyMessage}</span>
    </div>
  );
};

/**
 * Success message component
 * 
 * @example
 * ```typescript
 * <SuccessMessage message="Operation completed successfully!" />
 * ```
 */
export const SuccessMessage: React.FC<{ 
  message: string; 
  onDismiss?: () => void;
  className?: string;
}> = ({ message, onDismiss, className }) => {
  return (
    <Alert className={`border-green-200 bg-green-50 ${className}`}>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Success</AlertTitle>
      <AlertDescription className="text-green-700">
        <div className="flex items-center justify-between">
          <span>{message}</span>
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

/**
 * Warning message component
 * 
 * @example
 * ```typescript
 * <WarningMessage message="Please check your input before proceeding." />
 * ```
 */
export const WarningMessage: React.FC<{ 
  message: string; 
  onDismiss?: () => void;
  className?: string;
}> = ({ message, onDismiss, className }) => {
  return (
    <Alert className={`border-yellow-200 bg-yellow-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Warning</AlertTitle>
      <AlertDescription className="text-yellow-700">
        <div className="flex items-center justify-between">
          <span>{message}</span>
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

/**
 * Error boundary fallback component
 * 
 * @example
 * ```typescript
 * <ErrorBoundaryFallback 
 *   error={error}
 *   errorInfo={errorInfo}
 *   resetError={() => setError(null)}
 * />
 * ```
 */
export const ErrorBoundaryFallback: React.FC<{
  error: AppError;
  errorInfo?: { componentStack: string };
  resetError: () => void;
}> = ({ error, errorInfo, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-500" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            An unexpected error occurred. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <ErrorCard
            error={error}
            showRetry={false}
            showDismiss={false}
          />
          
          {errorInfo && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ================================
// EXPORTS
// ================================

export {
  ErrorAlert,
  ErrorCard,
  InlineError,
  SuccessMessage,
  WarningMessage,
  ErrorBoundaryFallback
}; 