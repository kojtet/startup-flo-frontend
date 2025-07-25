import React, { ReactNode } from 'react';
import { BaseErrorBoundary, ErrorBoundaryProps } from './BaseErrorBoundary';
import { AlertTriangle, Shield, Database, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ================================
// SPECIALIZED ERROR BOUNDARIES
// ================================

// Auth Error Boundary - For authentication related errors
interface AuthErrorBoundaryProps {
  children: ReactNode;
  onAuthError?: () => void;
}

export const AuthErrorBoundary: React.FC<AuthErrorBoundaryProps> = ({ 
  children, 
  onAuthError 
}) => {
  const handleAuthError = () => {
    if (onAuthError) {
      onAuthError();
    } else {
      // Default: redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  const AuthErrorFallback = ({ error, retry, canRetry }) => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-amber-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 rounded-full bg-amber-100">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl text-amber-700">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem with your authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {error.message || 'Authentication failed. Please sign in again.'}
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Your session may have expired or there was an authentication issue.</p>
            <p>You'll be redirected to the login page to sign in again.</p>
          </div>
          
          <div className="flex gap-2">
            {canRetry && (
              <Button onClick={retry} variant="outline" className="flex-1">
                Retry
              </Button>
            )}
            <Button onClick={handleAuthError} className="flex-1">
              Sign In Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <BaseErrorBoundary
      level="context"
      context="Authentication"
      fallback={AuthErrorFallback}
      onError={(errorDetails) => {
        // Log auth-specific error details
        console.error('Auth Error:', errorDetails);
      }}
    >
      {children}
    </BaseErrorBoundary>
  );
};

// API Error Boundary - For API related errors
interface APIErrorBoundaryProps {
  children: ReactNode;
  endpoint?: string;
  fallbackToOffline?: boolean;
}

export const APIErrorBoundary: React.FC<APIErrorBoundaryProps> = ({ 
  children, 
  endpoint,
  fallbackToOffline = false
}) => {
  const APIErrorFallback = ({ error, retry, canRetry }) => (
    <Card className="w-full max-w-md mx-auto border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Database className="h-5 w-5" />
          Connection Error
        </CardTitle>
        <CardDescription>
          {endpoint ? `Failed to connect to ${endpoint}` : 'Unable to fetch data'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            {error.message || 'Network error occurred'}
          </AlertDescription>
        </Alert>
        
        {fallbackToOffline && (
          <div className="text-sm text-muted-foreground p-3 bg-gray-50 rounded">
            <p>You can continue using cached data while offline.</p>
          </div>
        )}
        
        {canRetry && (
          <Button onClick={retry} variant="outline" size="sm" className="w-full">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <BaseErrorBoundary
      level="component"
      context={`API${endpoint ? ` (${endpoint})` : ''}`}
      fallback={APIErrorFallback}
      enableRetry={true}
      maxRetries={3}
    >
      {children}
    </BaseErrorBoundary>
  );
};

// Context Provider Error Boundary - For context provider errors
interface ContextErrorBoundaryProps {
  children: ReactNode;
  contextName: string;
  fallbackComponent?: React.ComponentType;
}

export const ContextErrorBoundary: React.FC<ContextErrorBoundaryProps> = ({ 
  children, 
  contextName,
  fallbackComponent: FallbackComponent
}) => {
  const ContextErrorFallback = ({ error, retry, canRetry, resetToHome }) => {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg border-red-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 rounded-full bg-red-100">
              <Settings className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-700">System Error</CardTitle>
            <CardDescription>
              The {contextName} system encountered a critical error
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Critical Error:</strong> {error.message || 'System component failed'}
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-muted-foreground space-y-2 p-3 bg-gray-50 rounded">
              <p><strong>What happened?</strong></p>
              <p>A critical system component ({contextName}) failed to load properly.</p>
              <p><strong>This affects:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All features that depend on {contextName}</li>
                <li>Data synchronization for this module</li>
                <li>Real-time updates for related features</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              {canRetry && (
                <Button onClick={retry} variant="outline" className="flex-1">
                  Restart System
                </Button>
              )}
              <Button onClick={resetToHome} variant="destructive" className="flex-1">
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <BaseErrorBoundary
      level="context"
      context={contextName}
      fallback={ContextErrorFallback}
      enableRetry={true}
      maxRetries={1}
      onError={(errorDetails) => {
        // Log context-specific error details
        console.error(`Context Error in ${contextName}:`, errorDetails);
      }}
    >
      {children}
    </BaseErrorBoundary>
  );
};

// Page Error Boundary - For page-level errors
interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({ 
  children, 
  pageName 
}) => {
  return (
    <BaseErrorBoundary
      level="page"
      context={pageName ? `${pageName} page` : 'page'}
      enableRetry={true}
      maxRetries={2}
    >
      {children}
    </BaseErrorBoundary>
  );
};

// Section Error Boundary - For section-level errors
interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionName?: string;
  isolate?: boolean;
}

export const SectionErrorBoundary: React.FC<SectionErrorBoundaryProps> = ({ 
  children, 
  sectionName,
  isolate = true
}) => {
  return (
    <BaseErrorBoundary
      level="section"
      context={sectionName ? `${sectionName} section` : 'section'}
      isolate={isolate}
      enableRetry={true}
      maxRetries={3}
    >
      {children}
    </BaseErrorBoundary>
  );
};

// Component Error Boundary - For component-level errors
interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  resetKeys?: Array<string | number>;
}

export const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({ 
  children, 
  componentName,
  resetKeys
}) => {
  return (
    <BaseErrorBoundary
      level="component"
      context={componentName ? `${componentName} component` : 'component'}
      enableRetry={true}
      maxRetries={3}
      resetOnPropsChange={true}
      resetKeys={resetKeys}
    >
      {children}
    </BaseErrorBoundary>
  );
};

// Route Error Boundary - For routing errors
interface RouteErrorBoundaryProps {
  children: ReactNode;
  routePath?: string;
}

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ 
  children, 
  routePath 
}) => {
  const RouteErrorFallback = ({ error, resetToHome }) => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 rounded-full bg-purple-100">
            <AlertTriangle className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-xl">Page Not Found</CardTitle>
          <CardDescription>
            {routePath ? `The route "${routePath}" encountered an error` : 'This page could not be loaded'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'The requested page is not available'}
            </AlertDescription>
          </Alert>
          
          <Button onClick={resetToHome} className="w-full">
            Go to Homepage
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <BaseErrorBoundary
      level="page"
      context={`route${routePath ? ` (${routePath})` : ''}`}
      fallback={RouteErrorFallback}
      enableRetry={false}
    >
      {children}
    </BaseErrorBoundary>
  );
};

// ================================
// CONVENIENCE EXPORTS
// ================================

export {
  BaseErrorBoundary
} from './BaseErrorBoundary';

// Export all specialized boundaries
export const ErrorBoundaries = {
  Base: BaseErrorBoundary,
  Auth: AuthErrorBoundary,
  API: APIErrorBoundary,
  Context: ContextErrorBoundary,
  Page: PageErrorBoundary,
  Section: SectionErrorBoundary,
  Component: ComponentErrorBoundary,
  Route: RouteErrorBoundary,
};

export default ErrorBoundaries; 