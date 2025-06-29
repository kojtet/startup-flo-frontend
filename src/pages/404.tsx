import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Card, CardContent } from "@/components/ui/card"
import { Home, /* AlertTriangle, */ ArrowLeft, Mail } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Startup Flo</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to your dashboard or explore our features." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="xl" />
          </div>
          
          {/* Error Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-6">
              {/* 404 Number */}
              <div className="space-y-2">
                <h1 className="text-8xl font-bold text-blue-600 tracking-tight">
                  404
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto rounded-full"></div>
              </div>
              
              {/* Error Message */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Oops! Page Not Found
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                  The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
                
                <Button variant="outline" onClick={handleGoBack} size="lg" className="w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
              </div>
              
              {/* Helpful Links */}
              <div className="pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-4">
                  Looking for something specific?
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <Link 
                    href="/hr" 
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
                    HR Management
                  </Link>
                  <Link 
                    href="/projects" 
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
                    Projects
                  </Link>
                  <Link 
                    href="/finance" 
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
                    Finance
                  </Link>
                  <Link 
                    href="/settings" 
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Support Contact */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Still need help?
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="mailto:support@startupflo.com" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-slate-100 opacity-50 blur-3xl"></div>
        </div>
      </main>
    </>
  )
}
