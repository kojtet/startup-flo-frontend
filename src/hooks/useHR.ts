import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Employee, CreateEmployeeData, UpdateEmployeeData, Department, Onboarding, CreateOnboardingData, UpdateOnboardingData } from '@/apis';

export function useHR() {
  const { user, apiClient } = useAuth() as any;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  
  // Onboarding state
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [isLoadingOnboardings, setIsLoadingOnboardings] = useState(false);
  const [onboardingsError, setOnboardingsError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    if (!user?.company_id) {
      setEmployeesError('No company ID available');
      return;
    }

    setIsLoadingEmployees(true);
    setEmployeesError(null);
    
    try {
      const response = await apiClient.get('/hr/employees');
      setEmployees(response.data);
    } catch (error: any) {
      console.error('Failed to fetch employees:', error);
      setEmployeesError(error.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [user?.company_id]);

  const createEmployee = useCallback(async (employeeData: CreateEmployeeData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.post('/hr/employees', employeeData);
    return response.data;
  }, [user?.company_id]);

  const updateEmployee = useCallback(async (employeeId: string, employeeData: UpdateEmployeeData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/hr/employees/${employeeId}`, employeeData);
    return response.data;
  }, [user?.company_id]);

  const deleteEmployee = useCallback(async (employeeId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/hr/employees/${employeeId}`);
  }, [user?.company_id]);

  const fetchDepartments = useCallback(async (): Promise<Department[]> => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.get(`/departments/company/${user?.company_id}`);
    return response.data.data; // Access the nested data property
  }, [user?.company_id]);

  // Onboarding methods
  const fetchOnboardings = useCallback(async () => {
    if (!user?.company_id) {
      setOnboardingsError('No company ID available');
      return;
    }

    setIsLoadingOnboardings(true);
    setOnboardingsError(null);
    
    try {
      const response = await apiClient.get('/hr/onboarding');
      setOnboardings(response.data);
    } catch (error: any) {
      console.error('Failed to fetch onboardings:', error);
      setOnboardingsError(error.response?.data?.message || 'Failed to fetch onboardings');
    } finally {
      setIsLoadingOnboardings(false);
    }
  }, [user?.company_id]);

  const createOnboarding = useCallback(async (onboardingData: CreateOnboardingData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.post('/hr/onboarding', onboardingData);
    return response.data;
  }, [user?.company_id]);

  const updateOnboarding = useCallback(async (onboardingId: string, onboardingData: UpdateOnboardingData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/hr/onboarding/${onboardingId}`, onboardingData);
    return response.data;
  }, [user?.company_id]);

  const completeOnboarding = useCallback(async (onboardingId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/hr/onboarding/${onboardingId}`, { status: 'completed' });
    return response.data;
  }, [user?.company_id]);

  const updateOnboardingChecklist = useCallback(async (onboardingId: string, data: { checklist: any[] }) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/hr/onboarding/${onboardingId}`, data);
    return response.data;
  }, [user?.company_id]);

  useEffect(() => {
    if (user?.company_id) {
      fetchEmployees();
      fetchOnboardings();
    }
  }, [user?.company_id, fetchEmployees, fetchOnboardings]);

  return {
    employees,
    isLoadingEmployees,
    employeesError,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    fetchDepartments,
    // Onboarding methods
    onboardings,
    isLoadingOnboardings,
    onboardingsError,
    fetchOnboardings,
    createOnboarding,
    updateOnboarding,
    completeOnboarding,
    updateOnboardingChecklist
  };
} 