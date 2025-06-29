
import { ApiClient, type ApiConfigOverride } from "../core/client";
import { HR_ENDPOINTS } from "../endpoints";
import { handleApiError } from "../core/errors";
import type { 
  Employee, 
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeesResponse,
  EmployeeResponse,
  LeaveRequest,
  CreateLeaveRequestData,
  UpdateLeaveRequestData,
  LeaveRequestsResponse,
  LeaveRequestResponse,
  Onboarding,
  OnboardingTask,
  CreateOnboardingData,
  UpdateOnboardingData,
  UpdateOnboardingChecklistData,
  OnboardingsResponse,
  OnboardingResponse,
  PaginatedResponse, 
  PaginationParams 
} from "../types";

export class HRService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ================================
  // EMPLOYEE MANAGEMENT
  // ================================

  /**
   * Get all employees
   * 
   * @param params - Query parameters for filtering employees
   * @param config - API configuration override
   * @returns Promise resolving to array of employees
   * 
   * @example
   * ```typescript
   * // Get all employees
   * const employees = await hrService.getEmployees();
   * 
   * // Get employees with pagination
   * const employees = await hrService.getEmployees({
   *   page: 1,
   *   limit: 10
   * });
   * ```
   * 
   * HTTP: GET /hr/employees
   */
  async getEmployees(params?: { 
    page?: number; 
    limit?: number; 
    status?: "active" | "inactive" | "terminated";
    department_id?: string;
    search?: string;
  }, config?: ApiConfigOverride): Promise<Employee[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.department_id) queryParams.append('department_id', params.department_id);
      if (params?.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = queryString ? `${HR_ENDPOINTS.EMPLOYEES_LIST}?${queryString}` : HR_ENDPOINTS.EMPLOYEES_LIST;
      
      const response = await this.apiClient.get<Employee[]>(url, config);
      console.log("👥 Employees API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch employees:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Create a new employee
   * 
   * @param data - Employee creation data
   * @param config - API configuration override
   * @returns Promise resolving to created employee
   * 
   * @example
   * ```typescript
   * const employeeData: CreateEmployeeData = {
   *   staff_id: "EMP002",
   *   first_name: "Johns",
   *   last_name: "Does",
   *   email: "johns.doe@example.com",
   *   phone: "+1224567890",
   *   department_id: "317b5e8a-e3b5-44cb-9da2-e06c6af662b0",
   *   position: "Software Engineer",
   *   date_of_birth: "1990-01-01",
   *   date_hired: "2024-01-01",
   *   status: "active"
   * };
   * 
   * const employee = await hrService.createEmployee(employeeData);
   * ```
   * 
   * HTTP: POST /hr/employees
   */
  async createEmployee(data: CreateEmployeeData, config?: ApiConfigOverride): Promise<Employee> {
    try {
      console.log("📡 Creating employee with data:", data);
      const response = await this.apiClient.post<Employee>(HR_ENDPOINTS.EMPLOYEES_LIST, data, config);
      console.log("✅ Employee created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create employee:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Get employee by ID
   * 
   * @param employeeId - ID of the employee to retrieve
   * @param config - API configuration override
   * @returns Promise resolving to employee details
   * 
   * @example
   * ```typescript
   * const employee = await hrService.getEmployeeById('dc545b92-0005-46e2-89eb-f09e8bf6fe19');
   * console.log('Employee:', employee.first_name, employee.last_name);
   * ```
   * 
   * HTTP: GET /hr/employees/:id
   */
  async getEmployeeById(employeeId: string, config?: ApiConfigOverride): Promise<Employee> {
    try {
      const response = await this.apiClient.get<Employee>(HR_ENDPOINTS.EMPLOYEE_DETAIL(employeeId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update employee by ID
   * 
   * @param employeeId - ID of the employee to update
   * @param data - Employee update data
   * @param config - API configuration override
   * @returns Promise resolving to updated employee
   * 
   * @example
   * ```typescript
   * const updatedEmployee = await hrService.updateEmployee(
   *   'dc545b92-0005-46e2-89eb-f09e8bf6fe19',
   *   {
   *     position: "Senior Software Engineer",
   *     status: "active",
   *     phone: "+1234567890"
   *   }
   * );
   * ```
   * 
   * HTTP: PUT /hr/employees/:id
   */
  async updateEmployee(employeeId: string, data: UpdateEmployeeData, config?: ApiConfigOverride): Promise<Employee> {
    try {
      const response = await this.apiClient.put<Employee>(HR_ENDPOINTS.EMPLOYEE_DETAIL(employeeId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete employee by ID
   * 
   * @param employeeId - ID of the employee to delete
   * @param config - API configuration override
   * @returns Promise resolving when employee is deleted
   * 
   * @example
   * ```typescript
   * await hrService.deleteEmployee('dc545b92-0005-46e2-89eb-f09e8bf6fe19');
   * console.log('Employee deleted successfully');
   * ```
   * 
   * HTTP: DELETE /hr/employees/:id
   */
  async deleteEmployee(employeeId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(HR_ENDPOINTS.EMPLOYEE_DETAIL(employeeId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // EMPLOYEE UTILITY METHODS
  // ================================

  /**
   * Get employees by status
   */
  async getEmployeesByStatus(status: Employee['status'], config?: ApiConfigOverride): Promise<Employee[]> {
    return this.getEmployees({ status }, config);
  }

  /**
   * Get active employees
   */
  async getActiveEmployees(config?: ApiConfigOverride): Promise<Employee[]> {
    return this.getEmployeesByStatus('active', config);
  }

  /**
   * Get inactive employees
   */
  async getInactiveEmployees(config?: ApiConfigOverride): Promise<Employee[]> {
    return this.getEmployeesByStatus('inactive', config);
  }

  /**
   * Get terminated employees
   */
  async getTerminatedEmployees(config?: ApiConfigOverride): Promise<Employee[]> {
    return this.getEmployeesByStatus('terminated', config);
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(departmentId: string, config?: ApiConfigOverride): Promise<Employee[]> {
    return this.getEmployees({ department_id: departmentId }, config);
  }

  /**
   * Search employees by name or email
   */
  async searchEmployees(searchTerm: string, config?: ApiConfigOverride): Promise<Employee[]> {
    return this.getEmployees({ search: searchTerm }, config);
  }

  /**
   * Create employee with convenience method
   */
  async createEmployeeSimple(
    staffId: string,
    firstName: string,
    lastName: string,
    email: string,
    position: string,
    dateOfBirth: string,
    dateHired: string,
    options?: {
      phone?: string;
      departmentId?: string;
      status?: Employee['status'];
    },
    config?: ApiConfigOverride
  ): Promise<Employee> {
    const employeeData: CreateEmployeeData = {
      staff_id: staffId,
      first_name: firstName,
      last_name: lastName,
      email,
      position,
      date_of_birth: dateOfBirth,
      date_hired: dateHired,
      phone: options?.phone,
      department_id: options?.departmentId,
      status: options?.status || 'active'
    };
    return this.createEmployee(employeeData, config);
  }

  /**
   * Update employee status
   */
  async updateEmployeeStatus(employeeId: string, status: Employee['status'], config?: ApiConfigOverride): Promise<Employee> {
    return this.updateEmployee(employeeId, { status }, config);
  }

  /**
   * Activate employee
   */
  async activateEmployee(employeeId: string, config?: ApiConfigOverride): Promise<Employee> {
    return this.updateEmployeeStatus(employeeId, 'active', config);
  }

  /**
   * Deactivate employee
   */
  async deactivateEmployee(employeeId: string, config?: ApiConfigOverride): Promise<Employee> {
    return this.updateEmployeeStatus(employeeId, 'inactive', config);
  }

  /**
   * Terminate employee
   */
  async terminateEmployee(employeeId: string, config?: ApiConfigOverride): Promise<Employee> {
    return this.updateEmployeeStatus(employeeId, 'terminated', config);
  }

  /**
   * Update employee department
   */
  async updateEmployeeDepartment(employeeId: string, departmentId: string, config?: ApiConfigOverride): Promise<Employee> {
    return this.updateEmployee(employeeId, { department_id: departmentId }, config);
  }

  /**
   * Update employee position
   */
  async updateEmployeePosition(employeeId: string, position: string, config?: ApiConfigOverride): Promise<Employee> {
    return this.updateEmployee(employeeId, { position }, config);
  }

  /**
   * Update employee contact info
   */
  async updateEmployeeContact(employeeId: string, email?: string, phone?: string, config?: ApiConfigOverride): Promise<Employee> {
    const updateData: UpdateEmployeeData = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    return this.updateEmployee(employeeId, updateData, config);
  }

  /**
   * Get employee count
   */
  async getEmployeeCount(config?: ApiConfigOverride): Promise<{ active: number; inactive: number; terminated: number; total: number }> {
    const employees = await this.getEmployees({}, config);
    const activeCount = employees.filter(emp => emp.status === 'active').length;
    const inactiveCount = employees.filter(emp => emp.status === 'inactive').length;
    const terminatedCount = employees.filter(emp => emp.status === 'terminated').length;
    
    return {
      active: activeCount,
      inactive: inactiveCount,
      terminated: terminatedCount,
      total: employees.length
    };
  }

  /**
   * Get employees by name pattern
   */
  async getEmployeesByName(namePattern: string, config?: ApiConfigOverride): Promise<Employee[]> {
    const employees = await this.getEmployees({}, config);
    const pattern = namePattern.toLowerCase();
    return employees.filter(employee => 
      employee.first_name.toLowerCase().includes(pattern) ||
      employee.last_name.toLowerCase().includes(pattern) ||
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(pattern)
    );
  }

  /**
   * Get employee full name
   */
  getEmployeeFullName(employee: Employee): string {
    return `${employee.first_name} ${employee.last_name}`;
  }

  /**
   * Check if employee is active
   */
  isEmployeeActive(employee: Employee): boolean {
    return employee.status === 'active';
  }

  /**
   * Get employee years of service
   */
  getEmployeeYearsOfService(employee: Employee): number {
    const hiredDate = new Date(employee.date_hired);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hiredDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears);
  }

  // ================================
  // LEAVE REQUESTS
  // ================================

  /**
   * Get all leave requests
   * 
   * @param params - Query parameters for filtering leave requests
   * @param config - API configuration override
   * @returns Promise resolving to array of leave requests
   * 
   * @example
   * ```typescript
   * // Get all leave requests
   * const requests = await hrService.getLeaveRequests();
   * 
   * // Get leave requests with filtering
   * const requests = await hrService.getLeaveRequests({
   *   status: 'pending',
   *   employee_id: 'dc545b92-0005-46e2-89eb-f09e8bf6fe19'
   * });
   * ```
   * 
   * HTTP: GET /hr/leave-requests
   */
  async getLeaveRequests(params?: {
    status?: "pending" | "approved" | "rejected" | "cancelled";
    employee_id?: string;
    start_date?: string;
    end_date?: string;
    leave_type?: string;
    page?: number;
    limit?: number;
  }, config?: ApiConfigOverride): Promise<LeaveRequest[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.status) queryParams.append('status', params.status);
      if (params?.employee_id) queryParams.append('employee_id', params.employee_id);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.leave_type) queryParams.append('leave_type', params.leave_type);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const url = queryString ? `${HR_ENDPOINTS.LEAVE_REQUESTS}?${queryString}` : HR_ENDPOINTS.LEAVE_REQUESTS;
      
      const response = await this.apiClient.get<LeaveRequest[]>(url, config);
      console.log("📋 Leave requests API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch leave requests:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Create a new leave request
   * 
   * @param data - Leave request creation data
   * @param config - API configuration override
   * @returns Promise resolving to created leave request
   * 
   * @example
   * ```typescript
   * const leaveRequestData: CreateLeaveRequestData = {
   *   employee_id: "dc545b92-0005-46e2-89eb-f09e8bf6fe19",
   *   start_date: "2024-04-01",
   *   end_date: "2024-04-05",
   *   leave_type: "annual",
   *   reason: "Family vacation",
   *   status: "pending"
   * };
   * 
   * const request = await hrService.createLeaveRequest(leaveRequestData);
   * ```
   * 
   * HTTP: POST /hr/leave-requests
   * Request body: {
   *   "employee_id": "dc545b92-0005-46e2-89eb-f09e8bf6fe19",
   *   "start_date": "2024-04-01",
   *   "end_date": "2024-04-05",
   *   "leave_type": "annual",
   *   "reason": "Family vacation",
   *   "status": "pending"
   * }
   */
  async createLeaveRequest(data: CreateLeaveRequestData, config?: ApiConfigOverride): Promise<LeaveRequest> {
    try {
      console.log("📡 Creating leave request with data:", data);
      const response = await this.apiClient.post<LeaveRequest>(HR_ENDPOINTS.LEAVE_REQUESTS, data, config);
      console.log("✅ Leave request created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create leave request:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Get leave request by ID
   * 
   * @param requestId - ID of the leave request to retrieve
   * @param config - API configuration override
   * @returns Promise resolving to leave request details
   * 
   * @example
   * ```typescript
   * const request = await hrService.getLeaveRequestById('request-id-123');
   * console.log('Leave request:', request.leave_type, request.status);
   * ```
   * 
   * HTTP: GET /hr/leave-requests/:id
   */
  async getLeaveRequestById(requestId: string, config?: ApiConfigOverride): Promise<LeaveRequest> {
    try {
      const response = await this.apiClient.get<LeaveRequest>(HR_ENDPOINTS.LEAVE_REQUEST_DETAIL(requestId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update leave request by ID
   * 
   * @param requestId - ID of the leave request to update
   * @param data - Leave request update data
   * @param config - API configuration override
   * @returns Promise resolving to updated leave request
   * 
   * @example
   * ```typescript
   * const updatedRequest = await hrService.updateLeaveRequest(
   *   'request-id-123',
   *   {
   *     reason: "Updated reason for leave",
   *     end_date: "2024-04-06"
   *   }
   * );
   * ```
   * 
   * HTTP: PUT /hr/leave-requests/:id
   */
  async updateLeaveRequest(requestId: string, data: UpdateLeaveRequestData, config?: ApiConfigOverride): Promise<LeaveRequest> {
    try {
      const response = await this.apiClient.put<LeaveRequest>(HR_ENDPOINTS.LEAVE_REQUEST_DETAIL(requestId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Approve a leave request
   * 
   * @param requestId - ID of the leave request to approve
   * @param config - API configuration override
   * @returns Promise resolving to approved leave request
   * 
   * @example
   * ```typescript
   * const approvedRequest = await hrService.approveLeaveRequest('request-id-123');
   * console.log('Leave request approved:', approvedRequest.status);
   * ```
   * 
   * HTTP: PUT /hr/leave-requests/:id/approve
   */
  async approveLeaveRequest(requestId: string, config?: ApiConfigOverride): Promise<LeaveRequest> {
    try {
      console.log("✅ Approving leave request:", requestId);
      const response = await this.apiClient.put<LeaveRequest>(HR_ENDPOINTS.LEAVE_REQUEST_APPROVE(requestId), {}, config);
      console.log("✅ Leave request approved successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to approve leave request:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Reject a leave request
   * 
   * @param requestId - ID of the leave request to reject
   * @param config - API configuration override
   * @returns Promise resolving to rejected leave request
   * 
   * @example
   * ```typescript
   * const rejectedRequest = await hrService.rejectLeaveRequest('request-id-123');
   * console.log('Leave request rejected:', rejectedRequest.status);
   * ```
   * 
   * HTTP: PUT /hr/leave-requests/:id/reject
   */
  async rejectLeaveRequest(requestId: string, config?: ApiConfigOverride): Promise<LeaveRequest> {
    try {
      console.log("❌ Rejecting leave request:", requestId);
      const response = await this.apiClient.put<LeaveRequest>(HR_ENDPOINTS.LEAVE_REQUEST_REJECT(requestId), {}, config);
      console.log("❌ Leave request rejected successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to reject leave request:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Cancel a leave request
   * 
   * @param requestId - ID of the leave request to cancel
   * @param config - API configuration override
   * @returns Promise resolving to cancelled leave request
   * 
   * @example
   * ```typescript
   * const cancelledRequest = await hrService.cancelLeaveRequest('request-id-123');
   * console.log('Leave request cancelled:', cancelledRequest.status);
   * ```
   * 
   * HTTP: PUT /hr/leave-requests/:id/cancel
   */
  async cancelLeaveRequest(requestId: string, config?: ApiConfigOverride): Promise<LeaveRequest> {
    try {
      console.log("🚫 Cancelling leave request:", requestId);
      const response = await this.apiClient.put<LeaveRequest>(HR_ENDPOINTS.LEAVE_REQUEST_CANCEL(requestId), {}, config);
      console.log("🚫 Leave request cancelled successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to cancel leave request:", error);
      throw handleApiError(error);
    }
  }

  // ================================
  // LEAVE REQUEST UTILITY METHODS
  // ================================

  /**
   * Get leave requests by status
   */
  async getLeaveRequestsByStatus(status: LeaveRequest['status'], config?: ApiConfigOverride): Promise<LeaveRequest[]> {
    return this.getLeaveRequests({ status }, config);
  }

  /**
   * Get pending leave requests
   */
  async getPendingLeaveRequests(config?: ApiConfigOverride): Promise<LeaveRequest[]> {
    return this.getLeaveRequestsByStatus('pending', config);
  }

  /**
   * Get approved leave requests
   */
  async getApprovedLeaveRequests(config?: ApiConfigOverride): Promise<LeaveRequest[]> {
    return this.getLeaveRequestsByStatus('approved', config);
  }

  /**
   * Get rejected leave requests
   */
  async getRejectedLeaveRequests(config?: ApiConfigOverride): Promise<LeaveRequest[]> {
    return this.getLeaveRequestsByStatus('rejected', config);
  }

  /**
   * Get cancelled leave requests
   */
  async getCancelledLeaveRequests(config?: ApiConfigOverride): Promise<LeaveRequest[]> {
    return this.getLeaveRequestsByStatus('cancelled', config);
  }

  /**
   * Get leave requests by employee
   */
  async getLeaveRequestsByEmployee(employeeId: string, config?: ApiConfigOverride): Promise<LeaveRequest[]> {
    return this.getLeaveRequests({ employee_id: employeeId }, config);
  }

  /**
   * Get leave requests by leave type
   */
  async getLeaveRequestsByType(leaveType: string, config?: ApiConfigOverride): Promise<LeaveRequest[]> {
    return this.getLeaveRequests({ leave_type: leaveType }, config);
  }

  /**
   * Get leave requests by date range
   */
  async getLeaveRequestsByDateRange(startDate: string, endDate: string, config?: ApiConfigOverride): Promise<LeaveRequest[]> {
    return this.getLeaveRequests({ start_date: startDate, end_date: endDate }, config);
  }

  /**
   * Create a simple leave request
   */
  async createLeaveRequestSimple(
    employeeId: string,
    startDate: string,
    endDate: string,
    leaveType: string,
    reason?: string,
    config?: ApiConfigOverride
  ): Promise<LeaveRequest> {
    const data: CreateLeaveRequestData = {
      employee_id: employeeId,
      start_date: startDate,
      end_date: endDate,
      leave_type: leaveType,
      reason,
      status: 'pending'
    };
    return this.createLeaveRequest(data, config);
  }

  /**
   * Get leave request duration in days
   */
  getLeaveRequestDuration(leaveRequest: LeaveRequest): number {
    const startDate = new Date(leaveRequest.start_date);
    const endDate = new Date(leaveRequest.end_date);
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end days
  }

  /**
   * Check if leave request is active/ongoing
   */
  isLeaveRequestActive(leaveRequest: LeaveRequest): boolean {
    if (leaveRequest.status !== 'approved') return false;
    
    const now = new Date();
    const startDate = new Date(leaveRequest.start_date);
    const endDate = new Date(leaveRequest.end_date);
    
    return now >= startDate && now <= endDate;
  }

  /**
   * Check if leave request is upcoming
   */
  isLeaveRequestUpcoming(leaveRequest: LeaveRequest): boolean {
    if (leaveRequest.status !== 'approved') return false;
    
    const now = new Date();
    const startDate = new Date(leaveRequest.start_date);
    
    return startDate > now;
  }

  /**
   * Check if leave request is past
   */
  isLeaveRequestPast(leaveRequest: LeaveRequest): boolean {
    const now = new Date();
    const endDate = new Date(leaveRequest.end_date);
    
    return endDate < now;
  }

  // ================================
  // EMPLOYEE ONBOARDING
  // ================================

  /**
   * Get all onboarding records
   * 
   * @param params - Query parameters for filtering onboarding records
   * @param config - API configuration override
   * @returns Promise resolving to array of onboarding records
   * 
   * @example
   * ```typescript
   * // Get all onboarding records
   * const onboardings = await hrService.getOnboardings();
   * 
   * // Get onboarding records with filtering
   * const onboardings = await hrService.getOnboardings({
   *   status: 'in_progress',
   *   employee_id: 'EMP001'
   * });
   * ```
   * 
   * HTTP: GET /hr/onboarding
   */
  async getOnboardings(params?: {
    status?: "in_progress" | "completed" | "paused";
    employee_id?: string;
    start_date?: string;
    page?: number;
    limit?: number;
  }, config?: ApiConfigOverride): Promise<Onboarding[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.status) queryParams.append('status', params.status);
      if (params?.employee_id) queryParams.append('employee_id', params.employee_id);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const url = queryString ? `${HR_ENDPOINTS.ONBOARDING}?${queryString}` : HR_ENDPOINTS.ONBOARDING;
      
      const response = await this.apiClient.get<Onboarding[]>(url, config);
      console.log("🎯 Onboarding records API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch onboarding records:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Create a new onboarding record
   * 
   * @param data - Onboarding creation data
   * @param config - API configuration override
   * @returns Promise resolving to created onboarding record
   * 
   * @example
   * ```typescript
   * const onboardingData: CreateOnboardingData = {
   *   employee_id: "EMP001",
   *   start_date: "2024-03-20",
   *   status: "in_progress",
   *   checklist: [
   *     { task: "Complete paperwork", completed: false },
   *     { task: "Setup workstation", completed: false },
   *     { task: "Orientation meeting", completed: false }
   *   ]
   * };
   * 
   * const onboarding = await hrService.createOnboarding(onboardingData);
   * ```
   * 
   * HTTP: POST /hr/onboarding
   * Request body: {
   *   "employee_id": "EMP001",
   *   "start_date": "2024-03-20",
   *   "status": "in_progress",
   *   "checklist": [
   *     { "task": "Complete paperwork", "completed": false },
   *     { "task": "Setup workstation", "completed": false },
   *     { "task": "Orientation meeting", "completed": false }
   *   ]
   * }
   */
  async createOnboarding(data: CreateOnboardingData, config?: ApiConfigOverride): Promise<Onboarding> {
    try {
      console.log("📡 Creating onboarding record with data:", data);
      const response = await this.apiClient.post<Onboarding>(HR_ENDPOINTS.ONBOARDING, data, config);
      console.log("✅ Onboarding record created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create onboarding record:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Get onboarding record by ID
   * 
   * @param onboardingId - ID of the onboarding record to retrieve
   * @param config - API configuration override
   * @returns Promise resolving to onboarding record details
   * 
   * @example
   * ```typescript
   * const onboarding = await hrService.getOnboardingById('onboarding-id-123');
   * console.log('Onboarding:', onboarding.status, onboarding.checklist.length);
   * ```
   * 
   * HTTP: GET /hr/onboarding/:id
   */
  async getOnboardingById(onboardingId: string, config?: ApiConfigOverride): Promise<Onboarding> {
    try {
      const response = await this.apiClient.get<Onboarding>(HR_ENDPOINTS.ONBOARDING_DETAIL(onboardingId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update onboarding record by ID
   * 
   * @param onboardingId - ID of the onboarding record to update
   * @param data - Onboarding update data
   * @param config - API configuration override
   * @returns Promise resolving to updated onboarding record
   * 
   * @example
   * ```typescript
   * const updatedOnboarding = await hrService.updateOnboarding(
   *   'onboarding-id-123',
   *   {
   *     status: "completed",
   *     start_date: "2024-03-21"
   *   }
   * );
   * ```
   * 
   * HTTP: PUT /hr/onboarding/:id
   */
  async updateOnboarding(onboardingId: string, data: UpdateOnboardingData, config?: ApiConfigOverride): Promise<Onboarding> {
    try {
      const response = await this.apiClient.put<Onboarding>(HR_ENDPOINTS.ONBOARDING_DETAIL(onboardingId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update onboarding checklist
   * 
   * @param onboardingId - ID of the onboarding record to update checklist for
   * @param data - Checklist update data
   * @param config - API configuration override
   * @returns Promise resolving to updated onboarding record
   * 
   * @example
   * ```typescript
   * const updatedOnboarding = await hrService.updateOnboardingChecklist(
   *   '6161c365-80ad-4252-a94f-305a263a6c83',
   *   {
   *     checklist: [
   *       { task: "Complete paperwork", completed: true },
   *       { task: "Setup workstation", completed: true },
   *       { task: "Orientation meeting", completed: false }
   *     ]
   *   }
   * );
   * ```
   * 
   * HTTP: PUT /hr/onboarding/:id/checklist
   * Request body: {
   *   "checklist": [
   *     { "task": "Complete paperwork", "completed": true },
   *     { "task": "Setup workstation", "completed": true },
   *     { "task": "Orientation meeting", "completed": false }
   *   ]
   * }
   */
  async updateOnboardingChecklist(onboardingId: string, data: UpdateOnboardingChecklistData, config?: ApiConfigOverride): Promise<Onboarding> {
    try {
      console.log("📋 Updating onboarding checklist:", onboardingId, data);
      const response = await this.apiClient.put<Onboarding>(HR_ENDPOINTS.ONBOARDING_CHECKLIST(onboardingId), data, config);
      console.log("✅ Onboarding checklist updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to update onboarding checklist:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Complete onboarding process
   * 
   * @param onboardingId - ID of the onboarding record to complete
   * @param config - API configuration override
   * @returns Promise resolving to completed onboarding record
   * 
   * @example
   * ```typescript
   * const completedOnboarding = await hrService.completeOnboarding('onboarding-id-123');
   * console.log('Onboarding completed:', completedOnboarding.status);
   * ```
   * 
   * HTTP: PUT /hr/onboarding/:id/complete
   */
  async completeOnboarding(onboardingId: string, config?: ApiConfigOverride): Promise<Onboarding> {
    try {
      console.log("🎉 Completing onboarding:", onboardingId);
      const response = await this.apiClient.put<Onboarding>(HR_ENDPOINTS.ONBOARDING_COMPLETE(onboardingId), {}, config);
      console.log("🎉 Onboarding completed successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to complete onboarding:", error);
      throw handleApiError(error);
    }
  }

  // ================================
  // ONBOARDING UTILITY METHODS
  // ================================

  /**
   * Get onboarding records by status
   */
  async getOnboardingsByStatus(status: Onboarding['status'], config?: ApiConfigOverride): Promise<Onboarding[]> {
    return this.getOnboardings({ status }, config);
  }

  /**
   * Get in-progress onboarding records
   */
  async getInProgressOnboardings(config?: ApiConfigOverride): Promise<Onboarding[]> {
    return this.getOnboardingsByStatus('in_progress', config);
  }

  /**
   * Get completed onboarding records
   */
  async getCompletedOnboardings(config?: ApiConfigOverride): Promise<Onboarding[]> {
    return this.getOnboardingsByStatus('completed', config);
  }

  /**
   * Get paused onboarding records
   */
  async getPausedOnboardings(config?: ApiConfigOverride): Promise<Onboarding[]> {
    return this.getOnboardingsByStatus('paused', config);
  }

  /**
   * Get onboarding record by employee
   */
  async getOnboardingByEmployee(employeeId: string, config?: ApiConfigOverride): Promise<Onboarding[]> {
    return this.getOnboardings({ employee_id: employeeId }, config);
  }

  /**
   * Create a simple onboarding record
   */
  async createOnboardingSimple(
    employeeId: string,
    startDate: string,
    tasks: string[],
    status: Onboarding['status'] = 'in_progress',
    config?: ApiConfigOverride
  ): Promise<Onboarding> {
    const checklist: OnboardingTask[] = tasks.map(task => ({
      task,
      completed: false
    }));

    const data: CreateOnboardingData = {
      employee_id: employeeId,
      start_date: startDate,
      status,
      checklist
    };
    return this.createOnboarding(data, config);
  }

  /**
   * Mark a specific task as completed in checklist
   */
  async markTaskCompleted(onboardingId: string, taskName: string, config?: ApiConfigOverride): Promise<Onboarding> {
    const onboarding = await this.getOnboardingById(onboardingId, config);
    const updatedChecklist = onboarding.checklist.map(item => 
      item.task === taskName ? { ...item, completed: true } : item
    );
    
    return this.updateOnboardingChecklist(onboardingId, { checklist: updatedChecklist }, config);
  }

  /**
   * Mark a specific task as incomplete in checklist
   */
  async markTaskIncomplete(onboardingId: string, taskName: string, config?: ApiConfigOverride): Promise<Onboarding> {
    const onboarding = await this.getOnboardingById(onboardingId, config);
    const updatedChecklist = onboarding.checklist.map(item => 
      item.task === taskName ? { ...item, completed: false } : item
    );
    
    return this.updateOnboardingChecklist(onboardingId, { checklist: updatedChecklist }, config);
  }

  /**
   * Get onboarding completion percentage
   */
  getOnboardingCompletionPercentage(onboarding: Onboarding): number {
    if (onboarding.checklist.length === 0) return 0;
    
    const completedTasks = onboarding.checklist.filter(task => task.completed).length;
    return Math.round((completedTasks / onboarding.checklist.length) * 100);
  }

  /**
   * Check if onboarding is fully completed (all tasks done)
   */
  isOnboardingFullyCompleted(onboarding: Onboarding): boolean {
    return onboarding.checklist.every(task => task.completed);
  }

  /**
   * Get remaining tasks for onboarding
   */
  getRemainingTasks(onboarding: Onboarding): OnboardingTask[] {
    return onboarding.checklist.filter(task => !task.completed);
  }

  /**
   * Get completed tasks for onboarding
   */
  getCompletedTasks(onboarding: Onboarding): OnboardingTask[] {
    return onboarding.checklist.filter(task => task.completed);
  }

  /**
   * Add a new task to onboarding checklist
   */
  async addTaskToOnboarding(onboardingId: string, taskName: string, config?: ApiConfigOverride): Promise<Onboarding> {
    const onboarding = await this.getOnboardingById(onboardingId, config);
    const updatedChecklist = [
      ...onboarding.checklist,
      { task: taskName, completed: false }
    ];
    
    return this.updateOnboardingChecklist(onboardingId, { checklist: updatedChecklist }, config);
  }

  /**
   * Remove a task from onboarding checklist
   */
  async removeTaskFromOnboarding(onboardingId: string, taskName: string, config?: ApiConfigOverride): Promise<Onboarding> {
    const onboarding = await this.getOnboardingById(onboardingId, config);
    const updatedChecklist = onboarding.checklist.filter(task => task.task !== taskName);
    
    return this.updateOnboardingChecklist(onboardingId, { checklist: updatedChecklist }, config);
  }
}
