import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Zap, Database, Shield } from 'lucide-react';

// Import error boundaries
import {
  ComponentErrorBoundary,
  APIErrorBoundary,
  AuthErrorBoundary,
  SectionErrorBoundary,
  useErrorBoundary,
  useAsyncError
} from '@/components/error-boundaries';

// ================================
// DEMO COMPONENTS THAT THROW ERRORS
// ================================

// Component that throws a render error
const CrashingComponent: React.FC<{ shouldCrash: boolean }> = ({ shouldCrash }) => {
  if (shouldCrash) {
    throw new Error('Demo component crash - render error!');
  }
  return <div className="p-4 bg-green-100 rounded">✅ Component rendered successfully</div>;
};

// Component that simulates API failure
const APIComponent: React.FC<{ shouldFail: boolean }> = ({ shouldFail }) => {
  const { execute, data, error, loading, retry } = useAsyncError();

  React.useEffect(() => {
    execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      if (shouldFail) {
        throw new Error('API endpoint failed - network error!');
      }
      return { message: 'API data loaded successfully' };
    });
  }, [shouldFail, execute]);

  if (loading) return <div className="p-4 bg-blue-100 rounded">🔄 Loading API data...</div>;
  if (error) return <div className="p-4 bg-red-100 rounded">❌ API Error: {error.message}</div>;
  if (data) return <div className="p-4 bg-green-100 rounded">✅ {data.message}</div>;
  
  return <div className="p-4 bg-gray-100 rounded">⏳ Waiting...</div>;
};

// Component that simulates auth failure
const AuthComponent: React.FC<{ shouldFail: boolean }> = ({ shouldFail }) => {
  if (shouldFail) {
    throw new Error('Authentication failed - invalid token!');
  }
  return <div className="p-4 bg-green-100 rounded">✅ User authenticated successfully</div>;
};

// Hook-based error handling demo
const HookErrorDemo: React.FC = () => {
  const { captureError, hasError, error, resetError } = useErrorBoundary();
  const [shouldError, setShouldError] = useState(false);

  const triggerError = () => {
    setShouldError(true);
    captureError(new Error('Hook-based error handling demo'), 'Manual Error Trigger');
  };

  const resetDemo = () => {
    setShouldError(false);
    resetError();
  };

  if (hasError && error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h4 className="font-semibold text-red-800">Hook Error Caught!</h4>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
        <Button onClick={resetDemo} variant="outline" size="sm" className="mt-2">
          Reset Hook Demo
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <h4 className="font-semibold text-blue-800">Hook Error Boundary Demo</h4>
      <p className="text-blue-600 text-sm mt-1">This component uses useErrorBoundary hook</p>
      <Button onClick={triggerError} variant="outline" size="sm" className="mt-2">
        Trigger Hook Error
      </Button>
    </div>
  );
};

// ================================
// MAIN DEMO COMPONENT
// ================================

export const ErrorBoundaryDemo: React.FC = () => {
  const [componentCrash, setComponentCrash] = useState(false);
  const [apiFailure, setApiFailure] = useState(false);
  const [authFailure, setAuthFailure] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Error Boundary System Demo
          </CardTitle>
          <CardDescription>
            Demonstrates how different error boundaries handle various types of failures gracefully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Component Error Boundary Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Component Error Boundary
            </h3>
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={() => setComponentCrash(!componentCrash)}
                variant={componentCrash ? "destructive" : "outline"}
                size="sm"
              >
                {componentCrash ? "Fix Component" : "Crash Component"}
              </Button>
            </div>
            
            <ComponentErrorBoundary componentName="Demo Component">
              <CrashingComponent shouldCrash={componentCrash} />
            </ComponentErrorBoundary>
          </div>

          {/* API Error Boundary Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              API Error Boundary
            </h3>
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={() => setApiFailure(!apiFailure)}
                variant={apiFailure ? "destructive" : "outline"}
                size="sm"
              >
                {apiFailure ? "Fix API" : "Break API"}
              </Button>
            </div>
            
            <APIErrorBoundary endpoint="/api/demo" fallbackToOffline>
              <APIComponent shouldFail={apiFailure} />
            </APIErrorBoundary>
          </div>

          {/* Auth Error Boundary Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Authentication Error Boundary
            </h3>
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={() => setAuthFailure(!authFailure)}
                variant={authFailure ? "destructive" : "outline"}
                size="sm"
              >
                {authFailure ? "Fix Auth" : "Break Auth"}
              </Button>
            </div>
            
            <AuthErrorBoundary onAuthError={() => console.log('Auth error - would redirect to login')}>
              <AuthComponent shouldFail={authFailure} />
            </AuthErrorBoundary>
          </div>

          {/* Section Error Boundary Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-purple-500" />
              Section Error Boundary
            </h3>
            
            <SectionErrorBoundary sectionName="Demo Section">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComponentErrorBoundary componentName="Card 1">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-green-600">✅ Safe component 1</div>
                    </CardContent>
                  </Card>
                </ComponentErrorBoundary>
                
                <ComponentErrorBoundary componentName="Card 2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-green-600">✅ Safe component 2</div>
                    </CardContent>
                  </Card>
                </ComponentErrorBoundary>
              </div>
            </SectionErrorBoundary>
          </div>

          {/* Hook Error Boundary Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hook-Based Error Handling</h3>
            <HookErrorDemo />
          </div>

          {/* Reset All Demo */}
          <div className="pt-4 border-t">
            <Button 
              onClick={() => {
                setComponentCrash(false);
                setApiFailure(false);
                setAuthFailure(false);
              }}
              className="w-full"
            >
              Reset All Demos
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Error Boundary Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Error Boundary Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ With Error Boundaries</h4>
              <ul className="space-y-1 text-green-600">
                <li>• Errors are isolated to components</li>
                <li>• App continues functioning</li>
                <li>• Users see helpful error messages</li>
                <li>• Automatic retry options available</li>
                <li>• Errors are logged with context</li>
                <li>• Graceful fallback UI displayed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 mb-2">❌ Without Error Boundaries</h4>
              <ul className="space-y-1 text-red-600">
                <li>• Entire app crashes on any error</li>
                <li>• Users see white screen of death</li>
                <li>• No context for debugging</li>
                <li>• Manual page refresh required</li>
                <li>• Poor user experience</li>
                <li>• Higher support ticket volume</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorBoundaryDemo; 