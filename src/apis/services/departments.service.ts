import { ApiClient, type ApiConfigOverride } from "../core/client";
import { DEPARTMENTS_ENDPOINTS } from "../endpoints";
import { handleApiError } from "../core/errors";
import type { 
  Department, 
  CreateDepartmentData, 
  UpdateDepartmentData,
  DepartmentsResponse
} from "../types";

export class DepartmentsService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // Get all departments for a company
  async getCompanyDepartments(companyId: string, config?: ApiConfigOverride): Promise<Department[]> {
    try {
      const response = await this.apiClient.get<DepartmentsResponse>(DEPARTMENTS_ENDPOINTS.LIST_BY_COMPANY(companyId), config);
      return response.data.data; // Extract the data array from the response
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Create a new department
  async createDepartment(data: CreateDepartmentData, config?: ApiConfigOverride): Promise<Department> {
    try {
      const response = await this.apiClient.post<Department>(DEPARTMENTS_ENDPOINTS.CREATE, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get single department (if this endpoint is implemented)
  async getDepartment(departmentId: string, config?: ApiConfigOverride): Promise<Department> {
    try {
      const response = await this.apiClient.get<Department>(DEPARTMENTS_ENDPOINTS.DETAIL(departmentId), config);
      return response.data;
    } catch (error) {
      console.warn("Get department by ID endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }

  // Update department (if this endpoint is implemented)
  async updateDepartment(departmentId: string, data: UpdateDepartmentData, config?: ApiConfigOverride): Promise<Department> {
    try {
      const response = await this.apiClient.patch<Department>(DEPARTMENTS_ENDPOINTS.UPDATE(departmentId), data, config);
      return response.data;
    } catch (error) {
      console.warn("Update department endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }

  // Delete department (if this endpoint is implemented)
  async deleteDepartment(departmentId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(DEPARTMENTS_ENDPOINTS.DELETE(departmentId), config);
    } catch (error) {
      console.warn("Delete department endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }

  // Legacy method for backwards compatibility (deprecated)
  // @deprecated Use getCompanyDepartments instead
  async getDepartments(companyId?: string, config?: ApiConfigOverride): Promise<Department[]> {
    if (!companyId) {
      throw new Error("Company ID is required to get departments");
    }
    return this.getCompanyDepartments(companyId, config);
  }
}
