import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/apis";
import { useAuth } from "./AuthContext";
import type {
  Employee,
  LeaveRequest,
  Onboarding,
  CreateEmployeeData,
  UpdateEmployeeData,
  CreateLeaveRequestData,
  UpdateLeaveRequestData,
  CreateOnboardingData,
  UpdateOnboardingData,
  UpdateOnboardingChecklistData,
  OnboardingTask,
  PaginationParams,
} from "@/apis/types";
import { ApiError } from "@/apis/core/errors";

interface HRCache {
  employees: {
    data: Employee[];
    timestamp: number;
  } | null;
  leaveRequests: {
    data: LeaveRequest[];
    timestamp: number;
  } | null;
  onboardings: {
    data: Onboarding[];
    timestamp: number;
  } | null;
}

interface HRContextType {
  // Cache state
  cache: HRCache;
  
  // Data state
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  onboardings: Onboarding[];
  
  // Loading states
  isLoadingEmployees: boolean;
  isLoadingLeaveRequests: boolean;
  isLoadingOnboardings: boolean;
  
  // Error states
  employeesError: string | null;
  leaveRequestsError: string | null;
  onboardingsError: string | null;
  
  // Optimized data access methods (replaces inefficient service methods)
  getEmployeesOptimized: (useCache?: boolean) => Promise<Employee[]>;
  getEmployeeCount: () => { active: number; inactive: number; terminated: number; total: number };
  getEmployeesByStatus: (status: Employee['status']) => Employee[];
  getActiveEmployees: () => Employee[];
  getInactiveEmployees: () => Employee[];
  getTerminatedEmployees: () => Employee[];
  getEmployeesByName: (namePattern: string) => Employee[];
  getEmployeesByDepartment: (departmentId: string) => Employee[];
  
  getLeaveRequestsOptimized: (useCache?: boolean) => Promise<LeaveRequest[]>;
  getLeaveRequestsByStatus: (status: LeaveRequest['status']) => LeaveRequest[];
  getPendingLeaveRequests: () => LeaveRequest[];
  getApprovedLeaveRequests: () => LeaveRequest[];
  getRejectedLeaveRequests: () => LeaveRequest[];
  getCancelledLeaveRequests: () => LeaveRequest[];
  getLeaveRequestsByEmployee: (employeeId: string) => LeaveRequest[];
  getLeaveRequestsByType: (leaveType: string) => LeaveRequest[];
  getLeaveRequestsByDateRange: (startDate: string, endDate: string) => LeaveRequest[];
  
  getOnboardingsOptimized: (useCache?: boolean) => Promise<Onboarding[]>;
  getOnboardingsByStatus: (status: Onboarding['status']) => Onboarding[];
  getInProgressOnboardings: () => Onboarding[];
  getCompletedOnboardings: () => Onboarding[];
  getPausedOnboardings: () => Onboarding[];
  getOnboardingByEmployee: (employeeId: string) => Onboarding[];
  getRemainingTasks: (onboarding: Onboarding) => OnboardingTask[];
  getCompletedTasks: (onboarding: Onboarding) => OnboardingTask[];
  getOnboardingCompletionPercentage: (onboarding: Onboarding) => number;
  
  // Standard CRUD operations (maintain compatibility)
  fetchEmployees: (params?: any) => Promise<void>;
  fetchLeaveRequests: (params?: any) => Promise<void>;
  fetchOnboardings: (params?: any) => Promise<void>;
  
  createEmployee: (data: CreateEmployeeData) => Promise<Employee>;
  updateEmployee: (id: string, data: UpdateEmployeeData) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<void>;
  
  createLeaveRequest: (data: CreateLeaveRequestData) => Promise<LeaveRequest>;
  updateLeaveRequest: (id: string, data: UpdateLeaveRequestData) => Promise<LeaveRequest>;
  approveLeaveRequest: (id: string) => Promise<LeaveRequest>;
  rejectLeaveRequest: (id: string) => Promise<LeaveRequest>;
  cancelLeaveRequest: (id: string) => Promise<LeaveRequest>;
  
  createOnboarding: (data: CreateOnboardingData) => Promise<Onboarding>;
  updateOnboarding: (id: string, data: UpdateOnboardingData) => Promise<Onboarding>;
  updateOnboardingChecklist: (id: string, data: UpdateOnboardingChecklistData) => Promise<Onboarding>;
  completeOnboarding: (id: string) => Promise<Onboarding>;
  
  // Cache management
  clearCache: () => void;
  invalidateCache: (type?: keyof HRCache) => void;
  refreshData: () => Promise<void>;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

// Cache duration: 10 minutes for employee data, 5 minutes for dynamic data
const CACHE_DURATION = {
  EMPLOYEES: 10 * 60 * 1000, // 10 minutes - relatively static
  DYNAMIC: 5 * 60 * 1000,    // 5 minutes - leave requests, onboardings
};

export const HRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Cache state
  const [cache, setCache] = useState<HRCache>({
    employees: null,
    leaveRequests: null,
    onboardings: null,
  });
  
  // Data state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  
  // Loading states
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingLeaveRequests, setIsLoadingLeaveRequests] = useState(false);
  const [isLoadingOnboardings, setIsLoadingOnboardings] = useState(false);
  
  // Error states
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [leaveRequestsError, setLeaveRequestsError] = useState<string | null>(null);
  const [onboardingsError, setOnboardingsError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  
  // Helper function to check if cache is valid
  const isCacheValid = (cacheItem: { timestamp: number } | null, duration: number): boolean => {
    if (!cacheItem) return false;
    return Date.now() - cacheItem.timestamp < duration;
  };
  
  // ================================
  // OPTIMIZED DATA ACCESS METHODS
  // ================================
  
  // Optimized employees fetching with intelligent caching
  const getEmployeesOptimized = useCallback(async (useCache: boolean = true): Promise<Employee[]> => {
    if (useCache && isCacheValid(cache.employees, CACHE_DURATION.EMPLOYEES)) {
      return cache.employees!.data;
    }
    
    setIsLoadingEmployees(true);
    setEmployeesError(null);
    try {
      // @ts-ignore
      const data = await api.hr.getEmployees();
      setEmployees(data);
      setCache(prev => ({
        ...prev,
        employees: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load employees";
      setEmployeesError(errorMessage);
      console.error("Failed to fetch employees:", err);
      throw err;
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [cache.employees]);
  
  // Optimized employee filtering methods using cached data
  const getEmployeeCount = useCallback((): { active: number; inactive: number; terminated: number; total: number } => {
    const activeCount = employees.filter(emp => emp.status === 'active').length;
    const inactiveCount = employees.filter(emp => emp.status === 'inactive').length;
    const terminatedCount = employees.filter(emp => emp.status === 'terminated').length;
    
    return {
      active: activeCount,
      inactive: inactiveCount,
      terminated: terminatedCount,
      total: employees.length
    };
  }, [employees]);
  
  const getEmployeesByStatus = useCallback((status: Employee['status']): Employee[] => {
    return employees.filter(emp => emp.status === status);
  }, [employees]);
  
  const getActiveEmployees = useCallback((): Employee[] => {
    return getEmployeesByStatus('active');
  }, [getEmployeesByStatus]);
  
  const getInactiveEmployees = useCallback((): Employee[] => {
    return getEmployeesByStatus('inactive');
  }, [getEmployeesByStatus]);
  
  const getTerminatedEmployees = useCallback((): Employee[] => {
    return getEmployeesByStatus('terminated');
  }, [getEmployeesByStatus]);
  
  const getEmployeesByName = useCallback((namePattern: string): Employee[] => {
    const pattern = namePattern.toLowerCase();
    return employees.filter(employee => 
      employee.first_name.toLowerCase().includes(pattern) ||
      employee.last_name.toLowerCase().includes(pattern) ||
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(pattern)
    );
  }, [employees]);
  
  const getEmployeesByDepartment = useCallback((departmentId: string): Employee[] => {
    return employees.filter(emp => emp.department_id === departmentId);
  }, [employees]);
  
  // Optimized leave requests methods
  const getLeaveRequestsOptimized = useCallback(async (useCache: boolean = true): Promise<LeaveRequest[]> => {
    if (useCache && isCacheValid(cache.leaveRequests, CACHE_DURATION.DYNAMIC)) {
      return cache.leaveRequests!.data;
    }
    
    setIsLoadingLeaveRequests(true);
    setLeaveRequestsError(null);
    try {
      // @ts-ignore
      const data = await api.hr.getLeaveRequests();
      setLeaveRequests(data);
      setCache(prev => ({
        ...prev,
        leaveRequests: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load leave requests";
      setLeaveRequestsError(errorMessage);
      throw err;
    } finally {
      setIsLoadingLeaveRequests(false);
    }
  }, [cache.leaveRequests]);
  
  const getLeaveRequestsByStatus = useCallback((status: LeaveRequest['status']): LeaveRequest[] => {
    return leaveRequests.filter(req => req.status === status);
  }, [leaveRequests]);
  
  const getPendingLeaveRequests = useCallback((): LeaveRequest[] => {
    return getLeaveRequestsByStatus('pending');
  }, [getLeaveRequestsByStatus]);
  
  const getApprovedLeaveRequests = useCallback((): LeaveRequest[] => {
    return getLeaveRequestsByStatus('approved');
  }, [getLeaveRequestsByStatus]);
  
  const getRejectedLeaveRequests = useCallback((): LeaveRequest[] => {
    return getLeaveRequestsByStatus('rejected');
  }, [getLeaveRequestsByStatus]);
  
  const getCancelledLeaveRequests = useCallback((): LeaveRequest[] => {
    return getLeaveRequestsByStatus('cancelled');
  }, [getLeaveRequestsByStatus]);
  
  const getLeaveRequestsByEmployee = useCallback((employeeId: string): LeaveRequest[] => {
    return leaveRequests.filter(req => req.employee_id === employeeId);
  }, [leaveRequests]);
  
  const getLeaveRequestsByType = useCallback((leaveType: string): LeaveRequest[] => {
    return leaveRequests.filter(req => req.leave_type === leaveType);
  }, [leaveRequests]);
  
  const getLeaveRequestsByDateRange = useCallback((startDate: string, endDate: string): LeaveRequest[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return leaveRequests.filter(req => {
      const reqStart = new Date(req.start_date);
      const reqEnd = new Date(req.end_date);
      return (reqStart >= start && reqStart <= end) || (reqEnd >= start && reqEnd <= end);
    });
  }, [leaveRequests]);
  
  // Optimized onboarding methods
  const getOnboardingsOptimized = useCallback(async (useCache: boolean = true): Promise<Onboarding[]> => {
    if (useCache && isCacheValid(cache.onboardings, CACHE_DURATION.DYNAMIC)) {
      return cache.onboardings!.data;
    }
    
    setIsLoadingOnboardings(true);
    setOnboardingsError(null);
    try {
      // @ts-ignore
      const data = await api.hr.getOnboardings();
      setOnboardings(data);
      setCache(prev => ({
        ...prev,
        onboardings: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load onboardings";
      setOnboardingsError(errorMessage);
      throw err;
    } finally {
      setIsLoadingOnboardings(false);
    }
  }, [cache.onboardings]);
  
  const getOnboardingsByStatus = useCallback((status: Onboarding['status']): Onboarding[] => {
    return onboardings.filter(onb => onb.status === status);
  }, [onboardings]);
  
  const getInProgressOnboardings = useCallback((): Onboarding[] => {
    return getOnboardingsByStatus('in_progress');
  }, [getOnboardingsByStatus]);
  
  const getCompletedOnboardings = useCallback((): Onboarding[] => {
    return getOnboardingsByStatus('completed');
  }, [getOnboardingsByStatus]);
  
  const getPausedOnboardings = useCallback((): Onboarding[] => {
    return getOnboardingsByStatus('paused');
  }, [getOnboardingsByStatus]);
  
  const getOnboardingByEmployee = useCallback((employeeId: string): Onboarding[] => {
    return onboardings.filter(onb => onb.employee_id === employeeId);
  }, [onboardings]);
  
  const getRemainingTasks = useCallback((onboarding: Onboarding): OnboardingTask[] => {
    return onboarding.checklist.filter(task => !task.completed);
  }, []);
  
  const getCompletedTasks = useCallback((onboarding: Onboarding): OnboardingTask[] => {
    return onboarding.checklist.filter(task => task.completed);
  }, []);
  
  const getOnboardingCompletionPercentage = useCallback((onboarding: Onboarding): number => {
    if (onboarding.checklist.length === 0) return 100;
    const completedTasks = onboarding.checklist.filter(task => task.completed).length;
    return Math.round((completedTasks / onboarding.checklist.length) * 100);
  }, []);
  
  // ================================
  // STANDARD CRUD OPERATIONS
  // ================================
  
  const fetchEmployees = useCallback(async (params?: any) => {
    await getEmployeesOptimized(false); // Force fresh fetch
  }, [getEmployeesOptimized]);
  
  const fetchLeaveRequests = useCallback(async (params?: any) => {
    await getLeaveRequestsOptimized(false); // Force fresh fetch
  }, [getLeaveRequestsOptimized]);
  
  const fetchOnboardings = useCallback(async (params?: any) => {
    await getOnboardingsOptimized(false); // Force fresh fetch
  }, [getOnboardingsOptimized]);
  
  // Employee CRUD operations
  const createEmployee = useCallback(async (data: CreateEmployeeData): Promise<Employee> => {
    try {
      // @ts-ignore
      const newEmployee = await api.hr.createEmployee(data);
      // Invalidate cache and refresh
      setCache(prev => ({ ...prev, employees: null }));
      await getEmployeesOptimized(false);
      return newEmployee;
    } catch (err) {
      throw err;
    }
  }, [getEmployeesOptimized]);
  
  const updateEmployee = useCallback(async (employeeId: string, data: UpdateEmployeeData): Promise<Employee> => {
    try {
      // @ts-ignore
      const updatedEmployee = await api.hr.updateEmployee(employeeId, data);
      // Update local state and cache
      setEmployees(prev => prev.map(emp => emp.id === employeeId ? updatedEmployee : emp));
      setCache(prev => prev.employees ? {
        ...prev,
        employees: {
          ...prev.employees,
          data: prev.employees.data.map(emp => emp.id === employeeId ? updatedEmployee : emp)
        }
      } : prev);
      return updatedEmployee;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const deleteEmployee = useCallback(async (employeeId: string): Promise<void> => {
    try {
      // @ts-ignore
      await api.hr.deleteEmployee(employeeId);
      // Remove from local state and cache
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setCache(prev => prev.employees ? {
        ...prev,
        employees: {
          ...prev.employees,
          data: prev.employees.data.filter(emp => emp.id !== employeeId)
        }
      } : prev);
    } catch (err) {
      throw err;
    }
  }, []);
  
  // Leave request CRUD operations
  const createLeaveRequest = useCallback(async (data: CreateLeaveRequestData): Promise<LeaveRequest> => {
    try {
      // @ts-ignore
      const newRequest = await api.hr.createLeaveRequest(data);
      // Invalidate cache and refresh
      setCache(prev => ({ ...prev, leaveRequests: null }));
      await getLeaveRequestsOptimized(false);
      return newRequest;
    } catch (err) {
      throw err;
    }
  }, [getLeaveRequestsOptimized]);
  
  const updateLeaveRequest = useCallback(async (requestId: string, data: UpdateLeaveRequestData): Promise<LeaveRequest> => {
    try {
      // @ts-ignore
      const updatedRequest = await api.hr.updateLeaveRequest(requestId, data);
      // Update local state and cache
      setLeaveRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
      setCache(prev => prev.leaveRequests ? {
        ...prev,
        leaveRequests: {
          ...prev.leaveRequests,
          data: prev.leaveRequests.data.map(req => req.id === requestId ? updatedRequest : req)
        }
      } : prev);
      return updatedRequest;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const approveLeaveRequest = useCallback(async (requestId: string): Promise<LeaveRequest> => {
    try {
      // @ts-ignore
      const approvedRequest = await api.hr.approveLeaveRequest(requestId);
      // Update local state
      setLeaveRequests(prev => prev.map(req => req.id === requestId ? approvedRequest : req));
      setCache(prev => prev.leaveRequests ? {
        ...prev,
        leaveRequests: {
          ...prev.leaveRequests,
          data: prev.leaveRequests.data.map(req => req.id === requestId ? approvedRequest : req)
        }
      } : prev);
      return approvedRequest;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const rejectLeaveRequest = useCallback(async (requestId: string): Promise<LeaveRequest> => {
    try {
      // @ts-ignore
      const rejectedRequest = await api.hr.rejectLeaveRequest(requestId);
      // Update local state
      setLeaveRequests(prev => prev.map(req => req.id === requestId ? rejectedRequest : req));
      setCache(prev => prev.leaveRequests ? {
        ...prev,
        leaveRequests: {
          ...prev.leaveRequests,
          data: prev.leaveRequests.data.map(req => req.id === requestId ? rejectedRequest : req)
        }
      } : prev);
      return rejectedRequest;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const cancelLeaveRequest = useCallback(async (requestId: string): Promise<LeaveRequest> => {
    try {
      // @ts-ignore
      const cancelledRequest = await api.hr.cancelLeaveRequest(requestId);
      // Update local state
      setLeaveRequests(prev => prev.map(req => req.id === requestId ? cancelledRequest : req));
      setCache(prev => prev.leaveRequests ? {
        ...prev,
        leaveRequests: {
          ...prev.leaveRequests,
          data: prev.leaveRequests.data.map(req => req.id === requestId ? cancelledRequest : req)
        }
      } : prev);
      return cancelledRequest;
    } catch (err) {
      throw err;
    }
  }, []);
  
  // Onboarding CRUD operations
  const createOnboarding = useCallback(async (data: CreateOnboardingData): Promise<Onboarding> => {
    try {
      // @ts-ignore
      const newOnboarding = await api.hr.createOnboarding(data);
      // Invalidate cache and refresh
      setCache(prev => ({ ...prev, onboardings: null }));
      await getOnboardingsOptimized(false);
      return newOnboarding;
    } catch (err) {
      throw err;
    }
  }, [getOnboardingsOptimized]);
  
  const updateOnboarding = useCallback(async (onboardingId: string, data: UpdateOnboardingData): Promise<Onboarding> => {
    try {
      // @ts-ignore
      const updatedOnboarding = await api.hr.updateOnboarding(onboardingId, data);
      // Update local state
      setOnboardings(prev => prev.map(onb => onb.id === onboardingId ? updatedOnboarding : onb));
      setCache(prev => prev.onboardings ? {
        ...prev,
        onboardings: {
          ...prev.onboardings,
          data: prev.onboardings.data.map(onb => onb.id === onboardingId ? updatedOnboarding : onb)
        }
      } : prev);
      return updatedOnboarding;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const updateOnboardingChecklist = useCallback(async (onboardingId: string, data: UpdateOnboardingChecklistData): Promise<Onboarding> => {
    try {
      // @ts-ignore
      const updatedOnboardingChecklist = await api.hr.updateOnboardingChecklist(onboardingId, data);
      // Update local state
      setOnboardings(prev => prev.map(onb => onb.id === onboardingId ? updatedOnboardingChecklist : onb));
      setCache(prev => prev.onboardings ? {
        ...prev,
        onboardings: {
          ...prev.onboardings,
          data: prev.onboardings.data.map(onb => onb.id === onboardingId ? updatedOnboardingChecklist : onb)
        }
      } : prev);
      return updatedOnboardingChecklist;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const completeOnboarding = useCallback(async (onboardingId: string): Promise<Onboarding> => {
    try {
      // @ts-ignore
      const completedOnboarding = await api.hr.completeOnboarding(onboardingId);
      // Update local state
      setOnboardings(prev => prev.map(onb => onb.id === onboardingId ? completedOnboarding : onb));
      setCache(prev => prev.onboardings ? {
        ...prev,
        onboardings: {
          ...prev.onboardings,
          data: prev.onboardings.data.map(onb => onb.id === onboardingId ? completedOnboarding : onb)
        }
      } : prev);
      return completedOnboarding;
    } catch (err) {
      throw err;
    }
  }, []);
  
  // ================================
  // CACHE MANAGEMENT
  // ================================
  
  const clearCache = useCallback(() => {
    setCache({
      employees: null,
      leaveRequests: null,
      onboardings: null,
    });
    console.log("HR cache cleared");
  }, []);
  
  const invalidateCache = useCallback((type?: keyof HRCache) => {
    if (type) {
      setCache(prev => ({ ...prev, [type]: null }));
    } else {
      clearCache();
    }
  }, [clearCache]);
  
  const refreshData = useCallback(async () => {
    clearCache();
    await Promise.all([
      getEmployeesOptimized(false),
      getLeaveRequestsOptimized(false),
      getOnboardingsOptimized(false),
    ]);
  }, [clearCache, getEmployeesOptimized, getLeaveRequestsOptimized, getOnboardingsOptimized]);
  
  // Auto-initialize data on auth
  useEffect(() => {
    if (isAuthenticated) {
      // Load employee data immediately (relatively static)
      getEmployeesOptimized().catch(err => {
        console.error("Auto-initialization failed for employees:", err);
      });
    } else {
      clearCache();
    }
  }, [isAuthenticated, getEmployeesOptimized, clearCache]);
  
  const value: HRContextType = {
    // Cache state
    cache,
    
    // Data state
    employees,
    leaveRequests,
    onboardings,
    
    // Loading states
    isLoadingEmployees,
    isLoadingLeaveRequests,
    isLoadingOnboardings,
    
    // Error states
    employeesError,
    leaveRequestsError,
    onboardingsError,
    
    // Optimized data access methods
    getEmployeesOptimized,
    getEmployeeCount,
    getEmployeesByStatus,
    getActiveEmployees,
    getInactiveEmployees,
    getTerminatedEmployees,
    getEmployeesByName,
    getEmployeesByDepartment,
    
    getLeaveRequestsOptimized,
    getLeaveRequestsByStatus,
    getPendingLeaveRequests,
    getApprovedLeaveRequests,
    getRejectedLeaveRequests,
    getCancelledLeaveRequests,
    getLeaveRequestsByEmployee,
    getLeaveRequestsByType,
    getLeaveRequestsByDateRange,
    
    getOnboardingsOptimized,
    getOnboardingsByStatus,
    getInProgressOnboardings,
    getCompletedOnboardings,
    getPausedOnboardings,
    getOnboardingByEmployee,
    getRemainingTasks,
    getCompletedTasks,
    getOnboardingCompletionPercentage,
    
    // Standard CRUD operations
    fetchEmployees,
    fetchLeaveRequests,
    fetchOnboardings,
    
    createEmployee,
    updateEmployee,
    deleteEmployee,
    
    createLeaveRequest,
    updateLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    cancelLeaveRequest,
    
    createOnboarding,
    updateOnboarding,
    updateOnboardingChecklist,
    completeOnboarding,
    
    // Cache management
    clearCache,
    invalidateCache,
    refreshData,
  };
  
  return (
    <HRContext.Provider value={value}>
      {children}
    </HRContext.Provider>
  );
};

export const useHR = (): HRContextType => {
  const context = useContext(HRContext);
  if (context === undefined) {
    throw new Error("useHR must be used within an HRProvider");
  }
  return context;
};

export default HRContext; 