import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Calendar,
  Users,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTimeFence } from "@/contexts/TimeFenceContext";
import { apiClient } from "@/apis/core/client";

export default function FullAttendanceView() {
  const { 
    timeFenceStatus, 
    isCheckingStatus, 
    statusError, 
    isTimeFenceConnected, 
    attendanceLogs,
    isFetchingAttendance,
    attendanceError,
    isLoading,
    refreshStatus, 
    fetchAttendanceLogs,
    setTimeFenceConnected 
  } = useTimeFence();

  // Date range and filtering states
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [availableEmployees, setAvailableEmployees] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Extract unique employees from logs
  useEffect(() => {
    const employees = [...new Set(attendanceLogs.map(log => log.staff_id))];
    setAvailableEmployees(employees);
  }, [attendanceLogs]);

  // Auto-fetch attendance logs when page loads and TimeFence is connected
  useEffect(() => {
    if (isTimeFenceConnected && !isLoading && attendanceLogs.length === 0) {
      fetchAttendanceLogs();
    }
  }, [isTimeFenceConnected, isLoading, attendanceLogs.length, fetchAttendanceLogs]);

  // Process attendance logs to create daily summaries
  const processAttendanceData = () => {
    // Filter logs by selected date range and employee
    const filteredLogs = attendanceLogs.filter(log => {
      const logDate = log.timestamp.split('T')[0];
      const dateInRange = logDate >= startDate && logDate <= endDate;
      const employeeMatch = selectedEmployee === 'all' || log.staff_id === selectedEmployee;
      return dateInRange && employeeMatch;
    });

    if (filteredLogs.length === 0) {
      return [];
    }

    // Group by employee and date
    const employeeDateGroups = filteredLogs.reduce((acc, log) => {
      const logDate = log.timestamp.split('T')[0];
      const key = `${log.full_name}_${logDate}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(log);
      return acc;
    }, {} as Record<string, typeof attendanceLogs>);

    // Create daily attendance summaries
    const attendanceSummaries = Object.entries(employeeDateGroups).map(([key, logs]) => {
      const sortedLogs = logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const firstLog = sortedLogs[0];
      const lastLog = sortedLogs[sortedLogs.length - 1];
      
      const checkIn = firstLog?.clock_type === 'clock_in' ? firstLog : null;
      const checkOut = lastLog?.clock_type === 'clock_out' ? lastLog : null;
      
      let status = 'Present';
      let hours = 0;
      
      if (checkIn && checkOut) {
        const checkInTime = new Date(checkIn.timestamp);
        const checkOutTime = new Date(checkOut.timestamp);
        hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        
        // Check if late (after 9:00 AM)
        const checkInHour = checkInTime.getHours();
        const checkInMinute = checkInTime.getMinutes();
        if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0)) {
          status = 'Late';
        }
      } else if (checkIn && !checkOut) {
        status = 'Present';
        hours = 0; // Still working
      } else {
        status = 'Absent';
        hours = 0;
      }

      return {
        id: key,
        name: firstLog.full_name,
        department: firstLog.staff_id || 'General',
        checkIn: checkIn ? new Date(checkIn.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }) : '-',
        checkOut: checkOut ? new Date(checkOut.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }) : '-',
        status,
        hours: Math.round(hours * 100) / 100,
        source: 'TimeFence',
        location: checkIn?.work_location_name || 'Unknown',
        withinRadius: checkIn?.within_radius || false,
        date: new Date(firstLog.timestamp).toLocaleDateString()
      };
    });

    return attendanceSummaries;
  };

  const processedAttendanceData = processAttendanceData();
  
  // Pagination logic
  const totalItems = processedAttendanceData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = processedAttendanceData.slice(startIndex, endIndex);

  // Calculate summary statistics
  const totalEmployees = processedAttendanceData.length;
  const presentEmployees = processedAttendanceData.filter(emp => emp.status === 'Present').length;
  const lateEmployees = processedAttendanceData.filter(emp => emp.status === 'Late').length;
  const absentEmployees = totalEmployees - presentEmployees - lateEmployees;
  const avgHours = processedAttendanceData.length > 0 
    ? Math.round((processedAttendanceData.reduce((sum, emp) => sum + emp.hours, 0) / processedAttendanceData.length) * 100) / 100
    : 0;

  // Handle filter changes
  const handleDateRangeChange = () => {
    setCurrentPage(1); // Reset to first page
  };

  const handleEmployeeChange = (employee: string) => {
    setSelectedEmployee(employee);
    setCurrentPage(1); // Reset to first page
  };

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

  // Show loading state while context is initializing
  if (isLoading) {
    return (
      <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600 mt-2">Comprehensive attendance tracking and reporting</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Export functionality */}}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* TimeFence Status */}
        {!isTimeFenceConnected && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-red-800">TimeFence Not Connected</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Please connect TimeFence to view attendance data. 
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => window.location.href = '/hr/attendance'}
                  className="p-0 h-auto text-red-700 underline"
                >
                  Go to connection page
                </Button>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Attendance records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presentEmployees}</div>
              <p className="text-xs text-muted-foreground">On time arrivals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lateEmployees}</div>
              <p className="text-xs text-muted-foreground">Late arrivals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgHours}h</div>
              <p className="text-xs text-muted-foreground">Hours per day</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span>Attendance Data</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'summary' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('summary')}
                    >
                      Summary
                    </Button>
                    <Button
                      variant={viewMode === 'detailed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('detailed')}
                    >
                      Detailed
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchAttendanceLogs(startDate, endDate, selectedEmployee === 'all' ? undefined : selectedEmployee)}
                    disabled={isFetchingAttendance}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isFetchingAttendance ? 'animate-spin' : ''}`} />
                    {isFetchingAttendance ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await apiClient.post('/hr/timefence/sync');
                        // Refresh data after sync
                        setTimeout(() => {
                          fetchAttendanceLogs(startDate, endDate, selectedEmployee === 'all' ? undefined : selectedEmployee);
                        }, 2000);
                      } catch (error) {
                        console.error('Sync failed:', error);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync Data
                  </Button>
                </div>
              </div>
              
              {/* Filters Section */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Date Range:</span>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-36"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-36"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDateRangeChange}
                  >
                    Apply
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Employee:</span>
                  <Select value={selectedEmployee} onValueChange={handleEmployeeChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {availableEmployees.map((staffId) => {
                        // Find the first log with this staff_id to get the name
                        const logWithName = attendanceLogs.find(log => log.staff_id === staffId);
                        return (
                          <SelectItem key={staffId} value={staffId}>
                            {logWithName?.full_name || staffId}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {attendanceError && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  ✗ {attendanceError}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {processedAttendanceData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {isFetchingAttendance ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading attendance data...</span>
                    </div>
                  ) : (
                    <div>
                      <p>No attendance data available for the selected period</p>
                      <p className="text-sm mt-1">
                        {selectedEmployee === 'all' 
                          ? `No logs found from ${startDate} to ${endDate}`
                          : (() => {
                              const logWithName = attendanceLogs.find(log => log.staff_id === selectedEmployee);
                              const employeeName = logWithName?.full_name || selectedEmployee;
                              return `No logs found for ${employeeName} from ${startDate} to ${endDate}`;
                            })()
                        }
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {currentData.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{employee.name}</h3>
                          <p className="text-sm text-gray-500">{employee.department}</p>
                          {employee.location && (
                            <p className="text-xs text-gray-400">
                              📍 {employee.location} 
                              {employee.withinRadius && <span className="text-green-600 ml-1">✓ In range</span>}
                            </p>
                          )}
                          {viewMode === 'detailed' && (
                            <p className="text-xs text-gray-400">Date: {employee.date}</p>
                          )}
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
                          <Badge variant="outline" className={getSourceColor(employee.source)}>
                            {employee.source}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ExtensibleLayout>
  );
} 