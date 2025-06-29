import { AuthForm } from "@/components/auth/AuthForm";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
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
