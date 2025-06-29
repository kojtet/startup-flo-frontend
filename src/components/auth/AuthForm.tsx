import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const { login, register, loading, error: authError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (mode === "login") {
      try {
        await login({ email, password });
        setSuccess(true);
        
        // Redirect to the original URL or dashboard after a brief delay
        setTimeout(() => {
          const redirectUrl = router.query.redirect as string || "/";
          router.push(redirectUrl);
        }, 1000);
      } catch (err) {
        // Handle specific error cases
        let errorMessage = "Login failed. Please check your credentials.";
        
        if (err instanceof Error) {
          const message = err.message.toLowerCase();
          if (message.includes('invalid credentials') || message.includes('wrong password') || message.includes('incorrect password')) {
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
          } else if (message.includes('user not found') || message.includes('email not found')) {
            errorMessage = "No account found with this email address. Please check your email or sign up.";
          } else if (message.includes('account locked') || message.includes('account disabled')) {
            errorMessage = "Your account has been locked. Please contact support.";
          } else if (message.includes('too many attempts')) {
            errorMessage = "Too many login attempts. Please try again later.";
          } else if (message.includes('network') || message.includes('connection')) {
            errorMessage = "Network error. Please check your connection and try again.";
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
      }
    } else {
      // For signup mode
      try {
        await register({ email, password, companyName });
        setSuccess(true);
        
        // Redirect to the original URL or dashboard after a brief delay
        setTimeout(() => {
          const redirectUrl = router.query.redirect as string || "/";
          router.push(redirectUrl);
        }, 1000);
      } catch (err) {
        // Handle specific error cases for registration
        let errorMessage = "Registration failed. Please try again.";
        
        if (err instanceof Error) {
          const message = err.message.toLowerCase();
          if (message.includes('email already exists') || message.includes('user already exists')) {
            errorMessage = "An account with this email already exists. Please sign in instead.";
          } else if (message.includes('invalid email')) {
            errorMessage = "Please enter a valid email address.";
          } else if (message.includes('password too weak') || message.includes('password requirements')) {
            errorMessage = "Password must be at least 8 characters long and contain letters and numbers.";
          } else if (message.includes('network') || message.includes('connection')) {
            errorMessage = "Network error. Please check your connection and try again.";
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
      }
    }
  };

  // Show auth context error if it exists
  const displayError = error || (authError?.message || "");

  // If success, show success message
  if (success) {
    return (
      <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {mode === "login" ? "Successfully signed in!" : "Account created successfully!"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Redirecting you to your dashboard...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            {mode === "login" 
              ? "Enter your credentials to access your workspace" 
              : "Get started with your startup management platform"
            }
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {displayError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                Company Name
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="company"
                  placeholder="Enter your company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              {mode === "login" && (
                <Link href="/auth/forgot-password" legacyBehavior>
                  <a className="text-xs text-blue-600 hover:text-blue-500 hover:underline">
                    Forgot password?
                  </a>
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          {mode === "login" && (
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me for 30 days
              </label>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </div>
            ) : (
              mode === "login" ? "Sign In" : "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 pt-6">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              {mode === "login" ? "New to StartupFlo?" : "Already have an account?"}
            </span>
          </div>
        </div>
        
        <p className="text-center text-sm text-gray-600">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" legacyBehavior>
                <a className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                  Sign up for free
                </a>
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/auth/login" legacyBehavior>
                <a className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                  Sign in instead
                </a>
              </Link>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  );
}
