import { ApiClient, type ApiConfigOverride } from "../core/client";
import { USER_ENDPOINTS } from "../endpoints"; // Corrected import
import { handleApiError } from "../core/errors"; // Corrected import
import type {
  User,
  UserProfile,
  UserPreferences,
  UserActivity,
  UpdateUserProfileData,
  UpdateUserPreferencesData,
  ChangePasswordData,
  PaginatedResponse,
} from "../types";

export class UserService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getCurrentUser(config?: ApiConfigOverride): Promise<User> {
    // This typically comes from an auth context or a dedicated /me endpoint
    // Assuming USER_ENDPOINTS.PROFILE serves this purpose for now
    try {
      const response = await this.apiClient.get<{success: boolean; message: string; data: User}>(USER_ENDPOINTS.PROFILE, config);
      return response.data.data; // Extract the nested data field
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getUserProfile(userId?: string, config?: ApiConfigOverride): Promise<UserProfile> {
    // If userId is not provided, fetch current user's profile
    const endpoint = userId ? `${USER_ENDPOINTS.GET_USER}/${userId}` : USER_ENDPOINTS.PROFILE;
    try {
      const response = await this.apiClient.get<{success: boolean; message: string; data: UserProfile}>(endpoint, config);
      return response.data.data; // Extract the nested data field
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateUserProfile(data: UpdateUserProfileData, userId?: string, config?: ApiConfigOverride): Promise<UserProfile> {
    // If userId is not provided, we need to get it from the current user profile
    if (!userId) {
      throw new Error("User ID is required for profile updates");
    }
    const endpoint = `${USER_ENDPOINTS.UPDATE_PROFILE}/${userId}`;
    try {
      const response = await this.apiClient.put<{success: boolean; message: string; data: UserProfile}>(endpoint, data, config);
      return response.data.data; // Extract the nested data field
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getUserPreferences(userId?: string, config?: ApiConfigOverride): Promise<UserPreferences> {
    const endpoint = userId ? `${USER_ENDPOINTS.PREFERENCES}/${userId}` : USER_ENDPOINTS.PREFERENCES;
    try {
      const response = await this.apiClient.get<UserPreferences>(endpoint, config);
      return response.data;
    } catch (error) {
      console.warn("User preferences endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }

  async updateUserPreferences(data: UpdateUserPreferencesData, userId?: string, config?: ApiConfigOverride): Promise<UserPreferences> {
    const endpoint = userId ? `${USER_ENDPOINTS.PREFERENCES}/${userId}` : USER_ENDPOINTS.PREFERENCES; // Assuming same endpoint for update
    try {
      const response = await this.apiClient.put<UserPreferences>(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.warn("User preferences endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }

  async getUserActivity(userId?: string, params?: { page?: number; limit?: number; type?: string }, config?: ApiConfigOverride): Promise<PaginatedResponse<UserActivity>> {
    const endpoint = userId ? `${USER_ENDPOINTS.ACTIVITY}/${userId}` : USER_ENDPOINTS.ACTIVITY;
    try {
      const response = await this.apiClient.get<PaginatedResponse<UserActivity>>(endpoint, { ...config, params });
      return response.data;
    } catch (error) {
      console.warn("User activity endpoint may not be implemented yet on the backend");
      throw handleApiError(error);
    }
  }

  async changePassword(data: ChangePasswordData, config?: ApiConfigOverride): Promise<void> {
    try {
      // Note: This should use a proper change password endpoint with current/new passwords
      console.warn("Password change endpoint not yet implemented. Using available data.");
      await this.apiClient.post(USER_ENDPOINTS.CHANGE_PASSWORD, data, config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Example: Get users for a company (might belong in CompanyService or a dedicated AdminService)
  async getCompanyUsers(companyId: string, params?: { page?: number; limit?: number; role?: string }, config?: ApiConfigOverride): Promise<User[]> {
    // Using the actual backend endpoint /users/company/:companyId
    try {
      const response = await this.apiClient.get<{success: boolean; message: string; data: User[]}>(`${USER_ENDPOINTS.COMPANY_USERS}/${companyId}`, { ...config, params });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Remove default instance export from here
// export const userService = new UserService();
