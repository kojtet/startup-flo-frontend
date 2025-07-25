import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !loading && !isAuthenticated) {
      // Store the current path to redirect back after login
      const currentPath = router.asPath;
      if (currentPath !== '/auth/login' && currentPath !== '/auth/signup') {
        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [isAuthenticated, loading, isHydrated, router]);

  // Show loading state while checking authentication or during hydration
  if (loading || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 