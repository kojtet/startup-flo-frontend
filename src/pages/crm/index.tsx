import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { crmSidebarSections } from "@/components/sidebars/CRMSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users2, Briefcase, DollarSign, TrendingUp } from "lucide-react";

export default function CRMDashboard() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  return (
    <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your customer relationships and sales pipeline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">+12 new this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">$125K in pipeline</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$32,450</div>
              <p className="text-xs text-muted-foreground">+8.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.5%</div>
              <p className="text-xs text-muted-foreground">+3.1% from last month</p>
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
                    <p className="text-sm font-medium">New lead added</p>
                    <p className="text-xs text-gray-500">TechCorp Inc. - Enterprise inquiry</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Deal closed</p>
                    <p className="text-xs text-gray-500">$15K contract with StartupXYZ</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Follow-up scheduled</p>
                    <p className="text-xs text-gray-500">Meeting with ABC Corp tomorrow</p>
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
                  <p className="font-medium">Add Lead</p>
                  <p className="text-xs text-gray-500">Create new lead entry</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                  <Briefcase className="h-6 w-6 text-green-600 mb-2" />
                  <p className="font-medium">View Pipeline</p>
                  <p className="text-xs text-gray-500">Check deal progress</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                  <DollarSign className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="font-medium">Generate Quote</p>
                  <p className="text-xs text-gray-500">Create proposal</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                  <TrendingUp className="h-6 w-6 text-orange-600 mb-2" />
                  <p className="font-medium">View Reports</p>
                  <p className="text-xs text-gray-500">Sales analytics</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExtensibleLayout>
  );
}
