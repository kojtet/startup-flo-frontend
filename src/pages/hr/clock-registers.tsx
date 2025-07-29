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

export default function ClockRegisters() {
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
  const [selectedAction, setSelectedAction] = useState<string>('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

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

  // Process attendance logs to show all individual entries
  const processClockData = () => {
    // Filter logs by selected date range, employee, and action
    const filteredLogs = attendanceLogs.filter(log => {
      const logDate = log.timestamp.split('T')[0];
      const dateInRange = logDate >= startDate && logDate <= endDate;
      const employeeMatch = selectedEmployee === 'all' || log.staff_id === selectedEmployee;
      const actionMatch = selectedAction === 'all' || log.clock_type === selectedAction;
      return dateInRange && employeeMatch && actionMatch;
    });

    if (filteredLogs.length === 0) {
      return [];
    }

    // Sort all logs by timestamp (newest first for better UX)
    const sortedLogs = filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Create individual clock records
    const clockRecords = sortedLogs.map((log, index) => {
      const logTime = new Date(log.timestamp);
      const logDate = logTime.toLocaleDateString();
      const logTimeString = logTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      // Determine status based on clock type and time
      let status = log.clock_type === 'clock_in' ? 'Checked In' : 'Checked Out';
      let statusColor = log.clock_type === 'clock_in' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
      
      // Check if late for clock-ins (after 9:00 AM)
      if (log.clock_type === 'clock_in') {
        const checkInHour = logTime.getHours();
        const checkInMinute = logTime.getMinutes();
        if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0)) {
          status = 'Late Check-in';
          statusColor = 'bg-yellow-100 text-yellow-800';
        }
      }

      return {
        id: log.id,
        name: log.full_name,
        department: log.staff_id || 'General',
        action: log.clock_type === 'clock_in' ? 'Check In' : 'Check Out',
        time: logTimeString,
        date: logDate,
        status,
        statusColor,
        source: 'TimeFence',
        location: log.work_location_name || 'Unknown',
        withinRadius: log.within_radius || false,
        deviceId: log.device_id,
        email: log.email,
        staffId: log.staff_id,
        timestamp: log.timestamp,
        latitude: log.latitude,
        longitude: log.longitude
      };
    });

    return clockRecords;
  };

  const processedClockData = processClockData();
  
  // Pagination logic
  const totalItems = processedClockData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = processedClockData.slice(startIndex, endIndex);

  // Calculate summary statistics
  const totalLogs = processedClockData.length;
  const checkIns = processedClockData.filter(log => log.action === 'Check In').length;
  const checkOuts = processedClockData.filter(log => log.action === 'Check Out').length;
  const lateCheckIns = processedClockData.filter(log => log.status === 'Late Check-in').length;
  const uniqueEmployees = [...new Set(processedClockData.map(log => log.name))].length;

  // Handle filter changes
  const handleDateRangeChange = () => {
    setCurrentPage(1); // Reset to first page
  };

  const handleEmployeeChange = (employee: string) => {
    setSelectedEmployee(employee);
    setCurrentPage(1); // Reset to first page
  };

  const handleActionChange = (action: string) => {
    setSelectedAction(action);
    setCurrentPage(1); // Reset to first page
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
            <p className="text-gray-600">Loading clock data...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Clock Registers</h1>
            <p className="text-gray-600 mt-2">All individual clock-in and clock-out records</p>
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
                Please connect TimeFence to view clock data. 
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
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLogs}</div>
              <p className="text-xs text-muted-foreground">Clock records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkIns}</div>
              <p className="text-xs text-muted-foreground">Clock-in events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Check-ins</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lateCheckIns}</div>
              <p className="text-xs text-muted-foreground">After 9:00 AM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueEmployees}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span>Clock Records</span>
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

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Action:</span>
                  <Select value={selectedAction} onValueChange={handleActionChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="clock_in">Check In</SelectItem>
                      <SelectItem value="clock_out">Check Out</SelectItem>
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
              {currentData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {isFetchingAttendance ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading clock data...</span>
                    </div>
                  ) : (
                    <div>
                      <p>No clock data available for the selected filters</p>
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
                  {currentData.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {log.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{log.name}</h3>
                          <p className="text-sm text-gray-500">{log.department}</p>
                          {log.location && (
                            <p className="text-xs text-gray-400">
                              📍 {log.location} 
                              {log.withinRadius && <span className="text-green-600 ml-1">✓ In range</span>}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">Device: {log.deviceId}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">Action</p>
                          <p className="text-sm text-gray-600">{log.action}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Time</p>
                          <p className="text-sm text-gray-600">{log.time}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Date</p>
                          <p className="text-sm text-gray-600">{log.date}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={log.statusColor}>
                            {log.status}
                          </Badge>
                          <Badge variant="outline" className={getSourceColor(log.source)}>
                            {log.source}
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