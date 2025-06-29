import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  )
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedRoute - Auth state:', { isLoading, isAuthenticated, hasUser: !!user });
    
    if (!isLoading && !isAuthenticated) {
      console.log('Redirecting to login...');
      // Redirect to login with return URL
      const returnUrl = router.asPath;
      router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
    }
  }, [isAuthenticated, isLoading, router, user]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute - Showing loading (isLoading = true)');
    return <>{fallback}</>;
  }

  // Show loading spinner while redirecting
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Showing loading (not authenticated)');
    return <>{fallback}</>;
  }

  // User is authenticated, render children
  console.log('ProtectedRoute - Rendering children (authenticated)');
  return <>{children}</>;
}; 