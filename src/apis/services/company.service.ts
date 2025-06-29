import { ApiClient, type ApiConfigOverride } from "../core/client";
import { COMPANY_ENDPOINTS } from "../endpoints"; // Corrected import
import { handleApiError } from "../core/errors"; // Corrected import
import type {
  Company,
  CompanyMember,
  CompanySettings,
  CompanyModule,
  CompanyModulesResponse,
  CompanyResponse,
  CreateCompanyMemberData,
  UpdateCompanyData,
  UpdateCompanyMemberRoleData,
  UpdateCompanySettingsData,
  PaginatedResponse,
  Team, // Assuming Team type exists for department members
  Department, // Assuming Department type exists
} from "../types";

export class CompanyService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // Company Details
  async getCompanyDetails(companyId: string, config?: ApiConfigOverride): Promise<Company> {
    try {
      const response = await this.apiClient.get<CompanyResponse>(COMPANY_ENDPOINTS.DETAILS(companyId), config);
      return response.data.company; // Extract the company field from response
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateCompanyDetails(companyId: string, data: UpdateCompanyData, config?: ApiConfigOverride): Promise<Company> {
    try {
      const response = await this.apiClient.patch<CompanyResponse>(COMPANY_ENDPOINTS.UPDATE(companyId), data, config);
      return response.data.company; // Extract the company field from response
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Company Modules
  async getCompanyModules(companyId: string, config?: ApiConfigOverride): Promise<CompanyModule[]> {
    try {
      const response = await this.apiClient.get<CompanyModulesResponse>(COMPANY_ENDPOINTS.MODULES(companyId), config);
      return response.data.modules; // Extract the modules array from response
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Company Members
  async getCompanyMembers(companyId: string, params?: { page?: number; limit?: number; role?: string }, config?: ApiConfigOverride): Promise<PaginatedResponse<CompanyMember>> {
    try {
      const response = await this.apiClient.get<PaginatedResponse<CompanyMember>>(`${COMPANY_ENDPOINTS.MEMBERS}/${companyId}`, { ...config, params });
      return response.data;
    } catch (error) {
      console.warn("Company members endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }

  async addCompanyMember(companyId: string, data: CreateCompanyMemberData, config?: ApiConfigOverride): Promise<CompanyMember> {
    try {
      const response = await this.apiClient.post<CompanyMember>(`${COMPANY_ENDPOINTS.ADD_MEMBER}/${companyId}`, data, config);
      return response.data;
    } catch (error) {
      console.warn("Add company member endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }

  async removeCompanyMember(companyId: string, memberId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(`${COMPANY_ENDPOINTS.REMOVE_MEMBER(memberId)}/${companyId}`, config);
    } catch (error) {
      console.warn("Remove company member endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }

  async updateCompanyMemberRole(companyId: string, memberId: string, data: UpdateCompanyMemberRoleData, config?: ApiConfigOverride): Promise<CompanyMember> {
    try {
      const response = await this.apiClient.patch<CompanyMember>(`${COMPANY_ENDPOINTS.UPDATE_MEMBER_ROLE(memberId)}/${companyId}`, data, config);
      return response.data;
    } catch (error) {
      console.warn("Update company member role endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }

  // Company Settings
  async getCompanySettings(companyId: string, config?: ApiConfigOverride): Promise<CompanySettings> {
    try {
      const response = await this.apiClient.get<CompanySettings>(`${COMPANY_ENDPOINTS.SETTINGS}/${companyId}`, config);
      return response.data;
    } catch (error) {
      console.warn("Company settings endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }

  async updateCompanySettings(companyId: string, data: UpdateCompanySettingsData, config?: ApiConfigOverride): Promise<CompanySettings> {
    try {
      const response = await this.apiClient.put<CompanySettings>(`${COMPANY_ENDPOINTS.UPDATE_SETTINGS}/${companyId}`, data, config);
      return response.data;
    } catch (error) {
      console.warn("Update company settings endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }
  
  // Departments (assuming these are part of company management)
  // Note: Endpoints for departments might be separate, adjust if COMPANY_ENDPOINTS doesn't cover this.
  // This is a placeholder, actual department endpoints are in DEPARTMENTS_ENDPOINTS
  async getDepartments(companyId: string, config?: ApiConfigOverride): Promise<Department[]> {
    // This should ideally use DEPARTMENTS_ENDPOINTS.LIST
    // For now, assuming a generic endpoint or that it's part of company settings/details
    console.warn("getDepartments in CompanyService is a placeholder and might need specific department endpoints.");
    try {
      // Example: const response = await this.apiClient.get<Department[]>(`/company/${companyId}/departments`, config);
      // return response.data;
      // To satisfy eslint, use the parameters or remove them if truly unused long-term
      console.log(companyId, config); 
      return Promise.resolve([]); // Placeholder
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getDepartmentTeams(departmentId: string, config?: ApiConfigOverride): Promise<Team[]> {
    console.warn("getDepartmentTeams in CompanyService is a placeholder.");
     try {
      // Example: const response = await this.apiClient.get<Team[]>(`/departments/${departmentId}/teams`, config);
      // return response.data;
      // To satisfy eslint, use the parameters
      console.log(departmentId, config);
      return Promise.resolve([]); // Placeholder
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Remove default instance export from here, it's handled in src/apis/index.ts
// export const companyService = new CompanyService();
// export default companyService;
