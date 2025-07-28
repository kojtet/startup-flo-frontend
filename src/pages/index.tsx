import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserDataLoader } from "@/components/auth/UserDataLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, DollarSign, TrendingUp, FileText } from "lucide-react";
import { ClientOnly } from "@/components/ui/ClientOnly";
import LandingPage from './landing';

export default function HomePage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  // If not hydrated yet, show loading
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, show landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // If authenticated, show dashboard
  return (
    <ProtectedRoute>
      <UserDataLoader>
        <ExtensibleLayout>
          <ClientOnly>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome to Startup Flo - Your all-in-one business management platform</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">142</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23</div>
                    <p className="text-xs text-muted-foreground">+3 new this week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+12.5%</div>
                    <p className="text-xs text-muted-foreground">+2.1% from last quarter</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                        <Users className="h-6 w-6 text-blue-600 mb-2" />
                        <p className="font-medium">Manage HR</p>
                        <p className="text-xs text-gray-500">Employee management</p>
                      </button>
                      <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                        <Briefcase className="h-6 w-6 text-green-600 mb-2" />
                        <p className="font-medium">View Projects</p>
                        <p className="text-xs text-gray-500">Project tracking</p>
                      </button>
                      <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                        <DollarSign className="h-6 w-6 text-purple-600 mb-2" />
                        <p className="font-medium">Finance</p>
                        <p className="text-xs text-gray-500">Financial overview</p>
                      </button>
                      <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                        <FileText className="h-6 w-6 text-orange-600 mb-2" />
                        <p className="font-medium">Reports</p>
                        <p className="text-xs text-gray-500">Business analytics</p>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New project created</p>
                          <p className="text-xs text-gray-500">Website redesign project started</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Employee onboarded</p>
                          <p className="text-xs text-gray-500">Sarah Johnson joined the team</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Invoice generated</p>
                          <p className="text-xs text-gray-500">Monthly billing completed</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ClientOnly>
        </ExtensibleLayout>
      </UserDataLoader>
    </ProtectedRoute>
  );
}
