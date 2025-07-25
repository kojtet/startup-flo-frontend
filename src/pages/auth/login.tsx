import { AuthForm } from "@/components/auth/AuthForm";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const redirectUrl = router.query.redirect as string || "/";
      router.push(redirectUrl);
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (isAuthenticated) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="xl" />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Welcome back
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          Sign in to your account to continue
        </p>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm mode="login" />
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Secure • Reliable • Built for Startups
        </p>
      </div>
    </div>
  );
}
