import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function Timesheets() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  const timesheets = [
    { id: 1, employee: "Sarah Johnson", week: "Jan 15-21, 2024", totalHours: 40, regularHours: 40, overtimeHours: 0, status: "Submitted" },
    { id: 2, employee: "Mike Chen", week: "Jan 15-21, 2024", totalHours: 45, regularHours: 40, overtimeHours: 5, status: "Approved" },
    { id: 3, employee: "Emily Davis", week: "Jan 15-21, 2024", totalHours: 38, regularHours: 38, overtimeHours: 0, status: "Draft" },
    { id: 4, employee: "David Wilson", week: "Jan 15-21, 2024", totalHours: 42, regularHours: 40, overtimeHours: 2, status: "Submitted" }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-gray-600 mt-2">Review and approve employee timesheets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,840</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">180</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">On-time submission</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Timesheets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timesheets.map((timesheet) => (
                <div key={timesheet.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{timesheet.employee}</h3>
                      <p className="text-sm text-gray-500">{timesheet.week}</p>
                    </div>
                    <Badge className={getStatusColor(timesheet.status)}>
                      {timesheet.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-sm font-medium">Total Hours</p>
                      <p className="text-lg font-bold text-blue-600">{timesheet.totalHours}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Regular</p>
                      <p className="text-lg font-bold text-green-600">{timesheet.regularHours}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Overtime</p>
                      <p className="text-lg font-bold text-orange-600">{timesheet.overtimeHours}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-1 h-3 w-3" />
                      View Details
                    </Button>
                    {timesheet.status === 'Submitted' && (
                      <Button size="sm">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Approve
                      </Button>
                    )}
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