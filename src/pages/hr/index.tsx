import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users2, DollarSign, CalendarDays, TrendingUp } from "lucide-react";

export default function HRDashboard() {
  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your workforce and HR operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$284,500</div>
              <p className="text-xs text-muted-foreground">+5.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leave</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Requests awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">+1.2% from last quarter</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New employee onboarded</p>
                    <p className="text-xs text-gray-500">Sarah Johnson joined Marketing team</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payroll processed</p>
                    <p className="text-xs text-gray-500">December payroll completed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Leave request pending</p>
                    <p className="text-xs text-gray-500">Mike Chen requested vacation days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                  <Users2 className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="font-medium">Add Employee</p>
                  <p className="text-xs text-gray-500">Onboard new team member</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                  <DollarSign className="h-6 w-6 text-green-600 mb-2" />
                  <p className="font-medium">Run Payroll</p>
                  <p className="text-xs text-gray-500">Process monthly payroll</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                  <CalendarDays className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="font-medium">Review Leave</p>
                  <p className="text-xs text-gray-500">Approve pending requests</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                  <TrendingUp className="h-6 w-6 text-orange-600 mb-2" />
                  <p className="font-medium">View Reports</p>
                  <p className="text-xs text-gray-500">HR analytics & insights</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExtensibleLayout>
  );
}
