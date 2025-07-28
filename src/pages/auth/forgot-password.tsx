import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { Mail, ArrowLeft, CheckCircle, Home } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-8">
            <Logo size="xl" />
          </div>
          
          <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Check your email
              </h2>
              
              <p className="text-gray-600 mb-6">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              
              <p className="text-sm text-gray-500 mb-8">
                Didn&apos;t receive the email? Check your spam folder or try again with a different email address.
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full h-11"
                >
                  Try different email
                </Button>
                
                <Link href="/auth/login" legacyBehavior>
                  <a className="block">
                    <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to sign in
                    </Button>
                  </a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Secure • Reliable • Built for Startups
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="xl" />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Forgot your password?
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          No worries! Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Reset your password
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Enter the email address associated with your account
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending reset link...
                  </div>
                ) : (
                  "Send reset link"
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
                  Remember your password?
                </span>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-600">
              <Link href="/auth/login" legacyBehavior>
                <a className="font-medium text-blue-600 hover:text-blue-500 hover:underline flex items-center justify-center">
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back to sign in
                </a>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Secure • Reliable • Built for Startups
        </p>
      </div>
    </div>
  );
}