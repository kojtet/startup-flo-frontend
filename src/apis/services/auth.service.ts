import { ApiClient, type ApiConfigOverride } from "../core/client";
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from "../endpoints";
import type { LoginCredentials, RegisterCredentials, User, AuthTokens } from "../types";
import { handleApiError } from "../core/errors";

export class AuthService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async login(credentials: LoginCredentials, config?: ApiConfigOverride): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.apiClient.post<{ user: User; tokens: AuthTokens }>(AUTH_ENDPOINTS.LOGIN, credentials, config);
    if (response.data.tokens?.accessToken) {
      this.apiClient.setAuthToken(response.data.tokens.accessToken);
    }
    // TODO: Handle refresh token storage securely
    return response.data;
  }

  async signup(credentials: RegisterCredentials, config?: ApiConfigOverride): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.apiClient.post<{ user: User; tokens: AuthTokens }>(AUTH_ENDPOINTS.SIGNUP, credentials, config);
    if (response.data.tokens?.accessToken) {
      this.apiClient.setAuthToken(response.data.tokens.accessToken);
    }
    // TODO: Handle refresh token storage securely
    return response.data;
  }

  async getMe(config?: ApiConfigOverride): Promise<User> {
    try {
      const response = await this.apiClient.get<{success: boolean; message: string; data: User}>(USER_ENDPOINTS.PROFILE, config);
      return response.data.data; // Extract the nested data field
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async logout(config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.post(AUTH_ENDPOINTS.LOGOUT, {}, config);
    } catch (error) {
      console.error("Logout failed, clearing token anyway:", error);
    } finally {
      this.apiClient.setAuthToken(null); // Clear token regardless of server response
      // TODO: Clear refresh token from storage
    }
  }

  async refreshToken(refreshTokenValue: string, config?: ApiConfigOverride): Promise<AuthTokens> {
    const response = await this.apiClient.post<AuthTokens>(AUTH_ENDPOINTS.REFRESH, { refreshToken: refreshTokenValue }, config);
    if (response.data.accessToken) {
      this.apiClient.setAuthToken(response.data.accessToken);
    }
    return response.data;
  }

  async forgotPassword(email: string, config?: ApiConfigOverride): Promise<void> {
    await this.apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email }, config);
  }

  async resetPassword(password: string, token: string, config?: ApiConfigOverride): Promise<void> {
    await this.apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, { password, token }, config);
  }

  async verifyEmail(token: string, config?: ApiConfigOverride): Promise<void> {
    // Assuming verify email might be a GET request with a token in query param or path
    // Adjust if it's a POST request
    await this.apiClient.get(`${AUTH_ENDPOINTS.VERIFY_EMAIL}?token=${token}`, config);
  }
}
