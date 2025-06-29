import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, Users2, Calendar } from "lucide-react";

export default function ShiftPlanning() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  const shifts = [
    { id: 1, name: "Morning Shift", time: "9:00 AM - 5:00 PM", employees: 45, coverage: "100%", department: "All" },
    { id: 2, name: "Evening Shift", time: "2:00 PM - 10:00 PM", employees: 25, coverage: "95%", department: "Support" },
    { id: 3, name: "Night Shift", time: "10:00 PM - 6:00 AM", employees: 12, coverage: "80%", department: "Security" },
    { id: 4, name: "Weekend Shift", time: "9:00 AM - 5:00 PM", employees: 18, coverage: "90%", department: "Operations" }
  ];

  const getCoverageColor = (coverage: string) => {
    const percent = parseInt(coverage);
    if (percent >= 95) return 'text-green-600';
    if (percent >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Planning</h1>
          <p className="text-gray-600 mt-2">Manage employee shifts and schedules</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Scheduled shifts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100</div>
              <p className="text-xs text-muted-foreground">Across all shifts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91%</div>
              <p className="text-xs text-muted-foreground">Average coverage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Slots</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Need coverage</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Current Shifts</CardTitle>
              <Button>
                <Target className="mr-2 h-4 w-4" />
                Create Shift
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {shifts.map((shift) => (
                <div key={shift.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{shift.name}</h3>
                      <p className="text-sm text-gray-500">{shift.time}</p>
                    </div>
                    <Badge variant="outline">{shift.department}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Employees</span>
                      <span className="text-sm text-gray-600">{shift.employees}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Coverage</span>
                      <span className={`text-sm font-medium ${getCoverageColor(shift.coverage)}`}>
                        {shift.coverage}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          parseInt(shift.coverage) >= 95 ? 'bg-green-500' :
                          parseInt(shift.coverage) >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: shift.coverage }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm">
                      View Schedule
                    </Button>
                    <Button variant="outline" size="sm">
                      Manage Staff
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