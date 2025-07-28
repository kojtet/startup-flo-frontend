import { useState } from "react";
import { SignupFlow } from "@/components/auth/SignupFlow";
import { AuthForm } from "@/components/auth/AuthForm";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

export default function SignupPage() {
  const [signupMode, setSignupMode] = useState<"quick" | "comprehensive">("quick");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Home link in top left corner */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/" 
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-200"
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Link>
      </div>
      
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="flex justify-center mb-8">
            <Logo size="xl" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Join StartupFlo
          </h2>
          <p className="text-center text-sm text-gray-600 mb-8">
            Set up your account and start managing your business
          </p>
          
          {/* Signup Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <Button
                variant={signupMode === "quick" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSignupMode("quick")}
                className="text-xs"
              >
                Quick Signup
              </Button>
              <Button
                variant={signupMode === "comprehensive" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSignupMode("comprehensive")}
                className="text-xs"
              >
                Complete Setup
              </Button>
            </div>
          </div>
        </div>
        
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          {signupMode === "quick" ? (
            <AuthForm mode="signup" />
          ) : (
            <SignupFlow />
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
