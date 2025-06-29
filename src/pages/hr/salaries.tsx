import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeDollarSign, TrendingUp, Users2, BarChart3 } from "lucide-react";

export default function SalaryStructures() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  const salaryBands = [
    { id: 1, level: "Junior", department: "Engineering", minSalary: 60000, maxSalary: 80000, employees: 15, avgSalary: 70000 },
    { id: 2, level: "Senior", department: "Engineering", minSalary: 80000, maxSalary: 120000, employees: 12, avgSalary: 95000 },
    { id: 3, level: "Manager", department: "Engineering", minSalary: 110000, maxSalary: 150000, employees: 3, avgSalary: 130000 },
    { id: 4, level: "Associate", department: "Marketing", minSalary: 50000, maxSalary: 70000, employees: 8, avgSalary: 60000 }
  ];

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Salary Structures</h1>
            <p className="text-gray-600 mt-2">Manage salary bands and compensation structures</p>
          </div>
          <Button>
            <BadgeDollarSign className="mr-2 h-4 w-4" />
            Add Salary Band
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salary Bands</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salaryBands.length}</div>
              <p className="text-xs text-muted-foreground">Active bands</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
              <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$85,000</div>
              <p className="text-xs text-muted-foreground">Company average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {salaryBands.reduce((acc, band) => acc + band.employees, 0)}
              </div>
              <p className="text-xs text-muted-foreground">In salary bands</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Impact</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+8.5%</div>
              <p className="text-xs text-muted-foreground">YoY increase</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Salary Band Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salaryBands.map((band) => (
                <div key={band.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{band.level} - {band.department}</h3>
                      <p className="text-sm text-gray-500">{band.employees} employees</p>
                    </div>
                    <Badge variant="outline">
                      ${band.minSalary.toLocaleString()} - ${band.maxSalary.toLocaleString()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500">Min Salary</p>
                      <p className="text-lg font-bold text-red-600">${band.minSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500">Average</p>
                      <p className="text-lg font-bold text-blue-600">${band.avgSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500">Max Salary</p>
                      <p className="text-lg font-bold text-green-600">${band.maxSalary.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${((band.avgSalary - band.minSalary) / (band.maxSalary - band.minSalary)) * 100}%`,
                        marginLeft: '0%'
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      View Employees
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit Band
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ExtensibleLayout>
  );
} 