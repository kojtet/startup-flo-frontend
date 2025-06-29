import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { financeSidebarSections } from "@/components/sidebars/FinanceSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, PieChart } from "lucide-react";

export default function FinanceDashboard() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  return (
    <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your financial health and manage accounting</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$145,230</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$89,450</div>
              <p className="text-xs text-muted-foreground">+5.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$55,780</div>
              <p className="text-xs text-muted-foreground">+18.3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">73%</div>
              <p className="text-xs text-muted-foreground">Of monthly budget</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Client Payment</p>
                      <p className="text-xs text-gray-500">ABC Corp - Invoice #1234</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium">+$15,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Office Rent</p>
                      <p className="text-xs text-gray-500">Monthly payment</p>
                    </div>
                  </div>
                  <span className="text-red-600 font-medium">-$3,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Software License</p>
                      <p className="text-xs text-gray-500">Annual subscription</p>
                    </div>
                  </div>
                  <span className="text-red-600 font-medium">-$1,200</span>
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
                  <DollarSign className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="font-medium">Add Transaction</p>
                  <p className="text-xs text-gray-500">Record income/expense</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                  <CreditCard className="h-6 w-6 text-green-600 mb-2" />
                  <p className="font-medium">Create Invoice</p>
                  <p className="text-xs text-gray-500">Bill your clients</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                  <PieChart className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="font-medium">View Budget</p>
                  <p className="text-xs text-gray-500">Budget allocation</p>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                  <TrendingUp className="h-6 w-6 text-orange-600 mb-2" />
                  <p className="font-medium">Financial Reports</p>
                  <p className="text-xs text-gray-500">P&L, Balance sheet</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExtensibleLayout>
  );
}
