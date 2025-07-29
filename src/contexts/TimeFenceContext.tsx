import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '@/apis/core/client';

// TimeFence status interface
interface TimeFenceStatus {
  connected: boolean;
  is_active: boolean;
  status: string;
  message: string;
  integration_id: string;
  company_id: string;
  last_sync_at: string | null;
  latest_log_sync: string | null;
  stats?: {
    total_logs: number;
    clock_ins: number;
    clock_outs: number;
    unique_employees: number;
  };
  created_at: string;
  updated_at: string;
  timestamp: string;
}

// Attendance log interface
interface AttendanceLog {
  id: string;
  timefence_log_id: string;
  company_id: string;
  employee_id: string | null;
  user_id: string;
  staff_id: string;
  clock_type: 'clock_in' | 'clock_out';
  timestamp: string;
  latitude: number;
  longitude: number;
  device_id: string;
  photo_url: string;
  result: string;
  work_location_id: string;
  work_location_name: string;
  work_location_lat: number;
  work_location_lng: number;
  work_location_radius_m: number;
  distance_m: number;
  within_radius: boolean;
  email: string;
  full_name: string;
  created_at: string;
  synced_at: string;
}

interface AttendanceResponse {
  logs: AttendanceLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TimeFenceContextType {
  timeFenceStatus: TimeFenceStatus | null;
  isCheckingStatus: boolean;
  statusError: string;
  isTimeFenceConnected: boolean;
  attendanceLogs: AttendanceLog[];
  isFetchingAttendance: boolean;
  attendanceError: string;
  isLoading: boolean; // Add loading state
  checkTimeFenceStatus: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  fetchAttendanceLogs: (startDate?: string, endDate?: string, employeeId?: string) => Promise<void>;
  setTimeFenceConnected: (connected: boolean) => void;
  // Helper methods for filtering
  getFilteredLogs: (startDate?: string, endDate?: string, staffId?: string) => AttendanceLog[];
  getAvailableStaffIds: () => string[];
  getEmployeeName: (staffId: string) => string | undefined;
}

const TimeFenceContext = createContext<TimeFenceContextType | undefined>(undefined);

interface TimeFenceProviderProps {
  children: ReactNode;
}

export const TimeFenceProvider: React.FC<TimeFenceProviderProps> = ({ children }) => {
  const [timeFenceStatus, setTimeFenceStatus] = useState<TimeFenceStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [isTimeFenceConnected, setIsTimeFenceConnected] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Attendance data states
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  
  const { isAuthenticated, isHydrated } = useAuth();

  // Check TimeFence status
  const checkTimeFenceStatus = async () => {
    if (!isAuthenticated) {
      setStatusError('Please log in to check TimeFence status');
      return;
    }

    setIsCheckingStatus(true);
    setStatusError('');
    
    try {
      console.log('Making TimeFence status request using API client');

      const response = await apiClient.get<TimeFenceStatus>('/hr/timefence/status');
      const status: TimeFenceStatus = response.data;
      
      console.log('TimeFence status response:', status);
      
      setTimeFenceStatus(status);
      setIsTimeFenceConnected(status.connected && status.is_active);
    } catch (error: any) {
      console.error('TimeFence status check error:', error);
      
      // User-friendly error messages
      let errorMessage = 'Unable to check TimeFence status';
      
      // Handle API client error instances
      if (error.constructor?.name === 'NotFoundError' || error.statusCode === 404) {
        errorMessage = 'TimeFence integration not found. Please contact your administrator.';
      } else if (error.constructor?.name === 'UnauthorizedError' || error.statusCode === 401) {
        errorMessage = 'Please log in again to check TimeFence status';
      } else if (error.constructor?.name === 'ForbiddenError' || error.statusCode === 403) {
        errorMessage = 'You do not have permission to access TimeFence settings';
      } else if (error.constructor?.name === 'ServerError' || (error.statusCode && error.statusCode >= 500)) {
        errorMessage = 'Server error. Please try again later';
      } else if (error.constructor?.name === 'NetworkError' || error.message?.includes('Network Error')) {
        errorMessage = 'Network connection issue. Please check your internet connection';
      } else if (error.response?.status === 404) {
        errorMessage = 'TimeFence integration not found. Please contact your administrator.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again to check TimeFence status';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to access TimeFence settings';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network connection issue. Please check your internet connection';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setStatusError(errorMessage);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Fetch attendance logs
  const fetchAttendanceLogs = async (startDate?: string, endDate?: string, employeeId?: string) => {
    if (!isAuthenticated) {
      setAttendanceError('Please log in to view attendance data');
      return;
    }

    setIsFetchingAttendance(true);
    setAttendanceError('');
    
    try {
      // Default to current year if no dates provided
      const start = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];
      
      console.log('Fetching TimeFence logs from', start, 'to', end, 'for employee:', employeeId);

      const response = await apiClient.get<AttendanceResponse>('/hr/timefence/logs', {
        params: {
          startDate: start,
          endDate: end,
          ...(employeeId && { employeeId })
        }
      });
      
      console.log('TimeFence logs response:', response.data);
      setAttendanceLogs(response.data.logs || []);
    } catch (error: any) {
      console.error('TimeFence logs fetch error:', error);
      
      // User-friendly error messages
      let errorMessage = 'Unable to load attendance data';
      
      // Handle API client error instances
      if (error.constructor?.name === 'NotFoundError' || error.statusCode === 404) {
        errorMessage = 'Attendance data not available. Please check your TimeFence connection.';
      } else if (error.constructor?.name === 'UnauthorizedError' || error.statusCode === 401) {
        errorMessage = 'Please log in again to view attendance data';
      } else if (error.constructor?.name === 'ForbiddenError' || error.statusCode === 403) {
        errorMessage = 'You do not have permission to view attendance data';
      } else if (error.constructor?.name === 'ServerError' || (error.statusCode && error.statusCode >= 500)) {
        // For server errors, show a more helpful message and set empty data
        errorMessage = 'No attendance data available yet. Please sync your TimeFence data first.';
        setAttendanceLogs([]); // Set empty array to prevent crashes
      } else if (error.constructor?.name === 'NetworkError' || error.message?.includes('Network Error')) {
        errorMessage = 'Network connection issue. Please check your internet connection';
      } else if (error.response?.status === 404) {
        errorMessage = 'Attendance data not available. Please check your TimeFence connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again to view attendance data';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to view attendance data';
      } else if (error.response?.status >= 500) {
        // For server errors, show a more helpful message and set empty data
        errorMessage = 'No attendance data available yet. Please sync your TimeFence data first.';
        setAttendanceLogs([]); // Set empty array to prevent crashes
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network connection issue. Please check your internet connection';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAttendanceError(errorMessage);
      
      // Set empty logs to prevent crashes
      if (error.constructor?.name === 'ServerError' || error.statusCode >= 500 || error.response?.status >= 500) {
        setAttendanceLogs([]);
      }
    } finally {
      setIsFetchingAttendance(false);
    }
  };

  // Refresh status (public method for manual refresh)
  const refreshStatus = async () => {
    await checkTimeFenceStatus();
  };

  // Set connection status (for when connection is established/disconnected)
  const setTimeFenceConnected = (connected: boolean) => {
    setIsTimeFenceConnected(connected);
  };

  // Initialize on mount (only once) and when authentication state changes
  useEffect(() => {
    if (isHydrated && isAuthenticated && !hasInitialized) {
      setIsLoading(true);
      checkTimeFenceStatus().finally(() => {
        setHasInitialized(true);
        setIsLoading(false);
      });
    } else if (isHydrated && !isAuthenticated) {
      // User is not authenticated, stop loading
      setIsLoading(false);
    }
  }, [isHydrated, isAuthenticated, hasInitialized]);

  // Reset initialization when user logs out
  useEffect(() => {
    if (!isAuthenticated && hasInitialized) {
      setHasInitialized(false);
      setIsLoading(true);
      setTimeFenceStatus(null);
      setIsTimeFenceConnected(false);
      setStatusError('');
      setAttendanceLogs([]);
      setAttendanceError('');
    }
  }, [isAuthenticated, hasInitialized]);

  // Auto-fetch attendance logs when connection is established and every 5 minutes
  useEffect(() => {
    if (!isTimeFenceConnected || !hasInitialized || !isAuthenticated) return;

    // Initial fetch when connection is established
    fetchAttendanceLogs();

    // Set up interval for every 5 minutes
    const interval = setInterval(() => {
      fetchAttendanceLogs();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isTimeFenceConnected, hasInitialized, isAuthenticated]);

  // Helper methods for filtering
  const getFilteredLogs = (startDate?: string, endDate?: string, staffId?: string) => {
    return attendanceLogs.filter(log => {
      const logDate = log.timestamp.split('T')[0];
      const dateInRange = !startDate || !endDate || (logDate >= startDate && logDate <= endDate);
      const employeeMatch = !staffId || log.staff_id === staffId;
      return dateInRange && employeeMatch;
    });
  };

  const getAvailableStaffIds = () => {
    return [...new Set(attendanceLogs.map(log => log.staff_id))];
  };

  const getEmployeeName = (staffId: string) => {
    const log = attendanceLogs.find(log => log.staff_id === staffId);
    return log?.full_name;
  };

  const value: TimeFenceContextType = {
    timeFenceStatus,
    isCheckingStatus,
    statusError,
    isTimeFenceConnected,
    attendanceLogs,
    isFetchingAttendance,
    attendanceError,
    isLoading,
    checkTimeFenceStatus,
    refreshStatus,
    fetchAttendanceLogs,
    setTimeFenceConnected,
    getFilteredLogs,
    getAvailableStaffIds,
    getEmployeeName
  };

  return (
    <TimeFenceContext.Provider value={value}>
      {children}
    </TimeFenceContext.Provider>
  );
};

// Custom hook to use TimeFence context
export const useTimeFence = (): TimeFenceContextType => {
  const context = useContext(TimeFenceContext);
  if (context === undefined) {
    throw new Error('useTimeFence must be used within a TimeFenceProvider');
  }
  return context;
}; 