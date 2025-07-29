import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Smartphone,
  Plus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  HelpCircle,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTimeFence } from "@/contexts/TimeFenceContext";
import { apiClient } from "@/apis/core/client";

export default function AttendanceLog() {
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

  const [showManualInput, setShowManualInput] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    employee: '',
    action: '',
    time: ''
  });

  // TimeFence connection states
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionError, setConnectionError] = useState('');

  // Date range and filtering states
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [availableEmployees, setAvailableEmployees] = useState<string[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

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
        department: firstLog.staff_id || 'General', // Use staff_id as department
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

  const getTimeFenceStatusColor = (status: string) => {
    switch(status) {
      case 'CONNECTED': return 'bg-green-100 text-green-800';
      case 'DISCONNECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastSync = (lastSyncAt: string | null) => {
    if (!lastSyncAt) return 'Never';
    
    const date = new Date(lastSyncAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
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

  const handleConnectClick = () => {
    if (isTimeFenceConnected) {
      // Disconnect logic
      setTimeFenceConnected(false);
    } else {
      // Show connection modal
      setShowConnectionModal(true);
    }
  };

  const handleConnectionSubmit = () => {
    if (!apiKey.trim()) {
      setConnectionError('Please enter your TimeFence API key');
      return;
    }
    setConnectionError('');
    setShowConnectionModal(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmConnection = async () => {
    setIsConnecting(true);
    setConnectionProgress(0);
    setConnectionError('');
    setShowConfirmationModal(false);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setConnectionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      console.log('Making TimeFence connection request using API client');

      const response = await apiClient.post('/hr/timefence/connect', {
        api_key: apiKey
      });

      clearInterval(progressInterval);
      setConnectionProgress(100);

      console.log('TimeFence connection successful:', response.data);
      setTimeFenceConnected(true);
      setApiKey('');
      // Refresh status and fetch attendance data after successful connection
      setTimeout(() => {
        refreshStatus();
        fetchAttendanceLogs();
      }, 1000);
    } catch (error: any) {
      clearInterval(progressInterval);
      
      // User-friendly error messages
      let errorMessage = 'Connection failed';
      
      // Handle API client error instances
      if (error.constructor?.name === 'NotFoundError' || error.statusCode === 404) {
        errorMessage = 'TimeFence connection endpoint not found. Please contact support.';
      } else if (error.constructor?.name === 'UnauthorizedError' || error.statusCode === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.constructor?.name === 'ForbiddenError' || error.statusCode === 403) {
        errorMessage = 'You do not have permission to connect TimeFence';
      } else if (error.constructor?.name === 'BadRequestError' || error.statusCode === 400) {
        errorMessage = 'Invalid API key. Please check your TimeFence API key.';
      } else if (error.constructor?.name === 'ServerError' || (error.statusCode && error.statusCode >= 500)) {
        errorMessage = 'Server error. Please try again later';
      } else if (error.constructor?.name === 'NetworkError' || error.message?.includes('Network Error')) {
        errorMessage = 'Network connection issue. Please check your internet connection';
      } else if (error.response?.status === 404) {
        errorMessage = 'TimeFence connection endpoint not found. Please contact support.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to connect TimeFence';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid API key. Please check your TimeFence API key.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network connection issue. Please check your internet connection';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setConnectionError(errorMessage);
      console.error('TimeFence connection error:', error);
    } finally {
      setIsConnecting(false);
      setTimeout(() => {
        setConnectionProgress(0);
      }, 2000);
    }
  };

  const handleCancelConnection = () => {
    setShowConnectionModal(false);
    setShowConfirmationModal(false);
    setApiKey('');
    setConnectionError('');
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Log</h1>
          <p className="text-gray-600 mt-2">Track employee attendance and working hours</p>
        </div>

        {/* TimeFence Integration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Smartphone className="h-4 w-4 text-blue-600" />
                TimeFence Integration
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshStatus}
                  disabled={isCheckingStatus}
                  className="ml-auto h-5 w-5 p-0"
                >
                  <RefreshCw className={`h-3 w-3 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://timefence.net/docs/integration', '_blank')}
                  className="h-5 w-5 p-0"
                  title="View TimeFence Integration Documentation"
                >
                  <HelpCircle className="h-3 w-3 text-blue-600" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <p className="text-xs text-gray-600">
                  Connect your TimeFence mobile app for automated attendance tracking.
                </p>
                
                {isCheckingStatus ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs text-gray-600">Checking status...</span>
                  </div>
                ) : timeFenceStatus ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isTimeFenceConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs font-medium">
                          {isTimeFenceConnected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      <Badge className={`text-xs ${getTimeFenceStatusColor(timeFenceStatus.status)}`}>
                        {timeFenceStatus.status}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      <p>{timeFenceStatus.message}</p>
                    </div>
                  </div>
                ) : statusError ? (
                  <div className="p-2 bg-red-50 rounded border border-red-200">
                    <p className="text-xs text-red-700">
                      ✗ {statusError}
                    </p>
                  </div>
                ) : null}
                
                <Button 
                  onClick={handleConnectClick}
                  variant={isTimeFenceConnected ? "outline" : "default"}
                  size="sm"
                  disabled={isConnecting || isCheckingStatus}
                  className="w-full text-xs"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    isTimeFenceConnected ? 'Disconnect' : 'Connect TimeFence'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4 text-orange-600" />
                Manual Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <p className="text-xs text-gray-600">
                  Manually record attendance for special circumstances.
                </p>
                <Button 
                  onClick={() => setShowManualInput(!showManualInput)}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                >
                  {showManualInput ? 'Cancel' : 'Add Manual Entry'}
                </Button>
                
                {showManualInput && (
                  <div className="mt-2 space-y-2 p-2 bg-white rounded border text-xs">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Employee</label>
                      <Select value={manualEntry.employee} onValueChange={(value) => setManualEntry({...manualEntry, employee: value})}>
                        <SelectTrigger className="h-7">
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Action</label>
                      <Select value={manualEntry.action} onValueChange={(value) => setManualEntry({...manualEntry, action: value})}>
                        <SelectTrigger className="h-7">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="check-in">Check In</SelectItem>
                          <SelectItem value="check-out">Check Out</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Time</label>
                      <Input
                        type="time"
                        value={manualEntry.time}
                        onChange={(e) => setManualEntry({...manualEntry, time: e.target.value})}
                        className="h-7"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleManualSubmit}
                      className="w-full h-7 text-xs"
                      disabled={!manualEntry.employee || !manualEntry.action || !manualEntry.time}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-green-600" />
                View All Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <p className="text-xs text-gray-600">
                  Access comprehensive attendance data with advanced filtering and reporting.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => window.location.href = '/hr/attendance-full'}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    Daily Summary
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/hr/clock-registers'}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    All Clock Logs
                  </Button>
                </div>
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
              <div className="text-2xl font-bold">{presentEmployees}</div>
              <p className="text-xs text-muted-foreground">Out of {totalEmployees} employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lateEmployees}</div>
              <p className="text-xs text-muted-foreground">Arrived after 9:00 AM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{absentEmployees}</div>
              <p className="text-xs text-muted-foreground">Not checked in</p>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span>Today's Attendance</span>
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
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
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
                      <p className="text-sm mt-1">Make sure TimeFence is connected and employees have clocked in</p>
                      {attendanceError && attendanceError.includes('sync') && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700">
                            💡 <strong>Tip:</strong> Click "Sync Data" to fetch the latest attendance data from TimeFence.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                currentData.map((employee) => (
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
                ))
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

      {/* TimeFence Connection Modal */}
      <Dialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect TimeFence</DialogTitle>
            <DialogDescription>
              Enter your TimeFence API key to establish a connection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="api-key" className="text-sm font-medium">
                API Key
              </label>
              <Input
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
                placeholder="Enter your TimeFence API key"
              />
            </div>
            {connectionError && (
              <p className="text-sm text-red-500">{connectionError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelConnection}>
              Cancel
            </Button>
            <Button onClick={handleConnectionSubmit} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect TimeFence"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TimeFence Confirmation Modal */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Connection</DialogTitle>
            <DialogDescription>
              Are you sure you want to connect to TimeFence with the provided API key?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelConnection}>
              Cancel
            </Button>
            <Button onClick={handleConfirmConnection} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Confirm Connection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ExtensibleLayout>
  );
} 
