import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
// import { // Unused Table components
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { // Unused DropdownMenu components
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"; // Unused
import {
  Clock,
  Smartphone,
  Plus,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { useState } from "react";

export default function AttendanceLog() {
  const [isTimeFenceConnected, setIsTimeFenceConnected] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    employee: '',
    action: '',
    time: ''
  });

  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  const attendanceData = [
    { id: 1, name: "Sarah Johnson", department: "Marketing", checkIn: "09:00 AM", checkOut: "05:30 PM", status: "Present", hours: 8.5, source: "TimeFence" },
    { id: 2, name: "Mike Chen", department: "Engineering", checkIn: "08:45 AM", checkOut: "06:00 PM", status: "Present", hours: 9.25, source: "TimeFence" },
    { id: 3, name: "Emily Davis", department: "Sales", checkIn: "10:15 AM", checkOut: "05:00 PM", status: "Late", hours: 6.75, source: "Manual" },
    { id: 4, name: "David Wilson", department: "HR", checkIn: "-", checkOut: "-", status: "Absent", hours: 0, source: "-" }
  ];

  const employees = [
    "Sarah Johnson",
    "Mike Chen", 
    "Emily Davis",
    "David Wilson",
    "Alex Thompson",
    "Maria Garcia"
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch(source) {
      case 'TimeFence': return 'bg-blue-100 text-blue-800';
      case 'Manual': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleManualSubmit = () => {
    if (manualEntry.employee && manualEntry.action && manualEntry.time) {
      // Here you would typically send the data to your backend
      console.log('Manual entry:', manualEntry);
      setManualEntry({ employee: '', action: '', time: '' });
      setShowManualInput(false);
      // You could also update the attendance data or refresh it
    }
  };

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Log</h1>
          <p className="text-gray-600 mt-2">Track employee attendance and working hours</p>
        </div>

        {/* TimeFence Integration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                TimeFence Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Connect your TimeFence mobile app for automated attendance tracking with GPS verification and real-time updates.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isTimeFenceConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">
                      {isTimeFenceConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <Button 
                    onClick={() => setIsTimeFenceConnected(!isTimeFenceConnected)}
                    variant={isTimeFenceConnected ? "outline" : "default"}
                    size="sm"
                  >
                    {isTimeFenceConnected ? 'Disconnect' : 'Connect TimeFence'}
                  </Button>
                </div>
                {isTimeFenceConnected && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">
                      ✓ TimeFence is syncing attendance data automatically. Last sync: 2 minutes ago
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-orange-600" />
                Manual Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Manually record attendance for employees who cannot use TimeFence or for special circumstances.
                </p>
                <Button 
                  onClick={() => setShowManualInput(!showManualInput)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {showManualInput ? 'Cancel Manual Entry' : 'Add Manual Entry'}
                </Button>
                
                {showManualInput && (
                  <div className="mt-4 space-y-3 p-4 bg-white rounded-lg border">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-sm font-medium">Employee</label>
                        <Select value={manualEntry.employee} onValueChange={(value) => setManualEntry({...manualEntry, employee: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Action</label>
                        <Select value={manualEntry.action} onValueChange={(value) => setManualEntry({...manualEntry, action: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="check-in">Check In</SelectItem>
                            <SelectItem value="check-out">Check Out</SelectItem>
                            <SelectItem value="break-start">Break Start</SelectItem>
                            <SelectItem value="break-end">Break End</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Time</label>
                        <Input
                          type="time"
                          value={manualEntry.time}
                          onChange={(e) => setManualEntry({...manualEntry, time: e.target.value})}
                        />
                      </div>
                      
                      <Button 
                        onClick={handleManualSubmit}
                        className="w-full"
                        disabled={!manualEntry.employee || !manualEntry.action || !manualEntry.time}
                      >
                        Submit Entry
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">138</div>
              <p className="text-xs text-muted-foreground">Out of 142 employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Arrived after 9:00 AM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Not checked in</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.2</div>
              <p className="text-xs text-muted-foreground">Hours per day</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceData.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.department}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">Check In</p>
                      <p className="text-sm text-gray-600">{employee.checkIn}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Check Out</p>
                      <p className="text-sm text-gray-600">{employee.checkOut}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Hours</p>
                      <p className="text-sm text-gray-600">{employee.hours}h</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                      {employee.source !== '-' && (
                        <Badge variant="outline" className={getSourceColor(employee.source)}>
                          {employee.source}
                        </Badge>
                      )}
                    </div>
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
