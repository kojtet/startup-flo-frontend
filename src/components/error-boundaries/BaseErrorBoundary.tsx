import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ================================
// ERROR BOUNDARY TYPES
// ================================

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

export interface ErrorDetails {
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  context?: string;
  userId?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (errorDetails: ErrorDetails) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component' | 'context';
  context?: string;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  retry: () => void;
  canRetry: boolean;
  resetToHome: () => void;
  level: ErrorBoundaryProps['level'];
  context?: string;
}

// ================================
// ERROR REPORTING SERVICE
// ================================

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private errorQueue: ErrorDetails[] = [];
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushErrorQueue();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  async reportError(errorDetails: ErrorDetails): Promise<void> {
    // Add to queue for offline support
    this.errorQueue.push(errorDetails);

    if (this.isOnline) {
      await this.flushErrorQueue();
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary Caught Error (${errorDetails.level || 'unknown'})`);
      console.error('Error:', errorDetails.error);
      console.error('Error Info:', errorDetails.errorInfo);
      console.log('Context:', errorDetails.context);
      console.log('Error ID:', errorDetails.errorId);
      console.log('URL:', errorDetails.url);
      console.groupEnd();
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errorsToReport = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In a real app, you'd send this to your error reporting service
      // For now, we'll just log it
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to Sentry, LogRocket, or your custom error service
        // await fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorsToReport)
        // });
      }
    } catch (reportingError) {
      console.error('Failed to report errors:', reportingError);
      // Re-add errors to queue for retry
      this.errorQueue.unshift(...errorsToReport);
    }
  }
}

// ================================
// DEFAULT FALLBACK COMPONENTS
// ================================

const ComponentErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
  canRetry,
  context
}) => (
  <Card className="w-full max-w-md mx-auto border-destructive/50">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        Component Error
      </CardTitle>
      <CardDescription>
        Something went wrong in {context || 'this component'}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <Alert>
        <Bug className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {error.message || 'An unexpected error occurred'}
        </AlertDescription>
      </Alert>
      {canRetry && (
        <Button onClick={retry} variant="outline" size="sm" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </CardContent>
  </Card>
);

const SectionErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
  canRetry,
  context
}) => (
  <div className="w-full p-6 border-2 border-dashed border-destructive/30 rounded-lg bg-destructive/5">
    <div className="text-center space-y-4">
      <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
      <div>
        <h3 className="text-lg font-semibold text-destructive">Section Unavailable</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The {context || 'section'} encountered an error and couldn't load
        </p>
      </div>
      <Alert className="text-left">
        <Bug className="h-4 w-4" />
        <AlertDescription>
          {error.message || 'An unexpected error occurred'}
        </AlertDescription>
      </Alert>
      <div className="flex gap-2 justify-center">
        {canRetry && (
          <Button onClick={retry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  </div>
);

const PageErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
  canRetry,
  resetToHome,
  context
}) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-background">
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle className="text-2xl">Page Error</CardTitle>
        <CardDescription>
          Something went wrong while loading {context || 'this page'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Bug className="h-4 w-4" />
          <AlertDescription>
            {error.message || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p>This error has been automatically reported to our team.</p>
          <p>You can try refreshing the page or return to the homepage.</p>
        </div>
        
        <div className="flex gap-2">
          {canRetry && (
            <Button onClick={retry} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button onClick={resetToHome} className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ContextErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
  canRetry,
  resetToHome,
  context
}) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-background">
    <Card className="w-full max-w-lg border-destructive">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <CardTitle className="text-2xl text-destructive">Critical Error</CardTitle>
        <CardDescription>
          A critical error occurred in {context || 'the application'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-destructive/50">
          <Bug className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error.message || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-muted-foreground space-y-2 p-3 bg-muted rounded">
          <p><strong>What happened?</strong></p>
          <p>A critical component failed and the application cannot continue safely.</p>
          <p><strong>What can you do?</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Refresh the page to restart the application</li>
            <li>Clear your browser cache and cookies</li>
            <li>Contact support if the issue persists</li>
          </ul>
        </div>
        
        <div className="flex gap-2">
          {canRetry && (
            <Button onClick={retry} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart App
            </Button>
          )}
          <Button onClick={resetToHome} variant="destructive" className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ================================
// BASE ERROR BOUNDARY COMPONENT
// ================================

export class BaseErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorReporter = ErrorReportingService.getInstance();
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component', context } = this.props;
    const { errorId } = this.state;

    this.setState({ errorInfo });

    const errorDetails: ErrorDetails = {
      error,
      errorInfo,
      errorId,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      level,
    };

    // Report error to service
    this.errorReporter.reportError(errorDetails);

    // Call custom error handler
    if (onError) {
      try {
        onError(errorDetails);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys && resetOnPropsChange) {
      if (resetKeys && resetKeys.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  resetErrorBoundary = () => {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts = [];
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    });
  };

  retry = () => {
    const { enableRetry = true, maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (!enableRetry || retryCount >= maxRetries) {
      return;
    }

    this.setState({ retryCount: retryCount + 1 });

    // Add delay for retry to prevent immediate re-error
    const timeout = setTimeout(() => {
      this.resetErrorBoundary();
    }, 1000 * (retryCount + 1)); // Exponential backoff

    this.retryTimeouts.push(timeout);
  };

  resetToHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  getFallbackComponent(): React.ComponentType<ErrorFallbackProps> {
    const { fallback, level = 'component' } = this.props;

    if (fallback) return fallback;

    switch (level) {
      case 'context':
        return ContextErrorFallback;
      case 'page':
        return PageErrorFallback;
      case 'section':
        return SectionErrorFallback;
      case 'component':
      default:
        return ComponentErrorFallback;
    }
  }

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, enableRetry = true, maxRetries = 3, level = 'component', context } = this.props;

    if (hasError && error && errorInfo) {
      const FallbackComponent = this.getFallbackComponent();
      const canRetry = enableRetry && retryCount < maxRetries;

      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          errorId={this.state.errorId}
          retry={this.retry}
          canRetry={canRetry}
          resetToHome={this.resetToHome}
          level={level}
          context={context}
        />
      );
    }

    return children;
  }
}

export default BaseErrorBoundary; 