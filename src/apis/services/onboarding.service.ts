
import { ApiClient, type ApiConfigOverride } from "../core/client";
import { ONBOARDING_ENDPOINTS } from "../endpoints";
import type { OnboardingStep, PaginatedResponse, PaginationParams } from "../types";

export class OnboardingService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getOnboardingSteps(params?: PaginationParams, config?: ApiConfigOverride): Promise<PaginatedResponse<OnboardingStep>> {
    const response = await this.apiClient.get<PaginatedResponse<OnboardingStep>>(ONBOARDING_ENDPOINTS.STEPS, { params, ...config });
    return response.data;
  }

  async getOnboardingStep(id: string, config?: ApiConfigOverride): Promise<OnboardingStep> {
    const response = await this.apiClient.get<OnboardingStep>(`${ONBOARDING_ENDPOINTS.STEPS}/${id}`, config);
    return response.data;
  }

  async updateOnboardingStep(id: string, data: Partial<OnboardingStep>, config?: ApiConfigOverride): Promise<OnboardingStep> {
    const response = await this.apiClient.put<OnboardingStep>(`${ONBOARDING_ENDPOINTS.STEPS}/${id}`, data, config);
    return response.data;
  }

  async completeOnboardingStep(id: string, config?: ApiConfigOverride): Promise<OnboardingStep> {
    const response = await this.apiClient.post<OnboardingStep>(`${ONBOARDING_ENDPOINTS.STEPS}/${id}/complete`, {}, config);
    return response.data;
  }
}
