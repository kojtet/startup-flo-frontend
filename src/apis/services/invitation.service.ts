import { ApiClient, type ApiConfigOverride } from "../core/client";
import { INVITATION_ENDPOINTS } from "../endpoints/company";
import { handleApiError } from "../core/errors";
import type {
  Invitation,
  InvitationWithCompany,
  InvitationsResponse,
  SendInvitationData,
  AcceptInvitationData,
} from "../types";

export class InvitationService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // Send company invitation
  async sendInvitation(data: SendInvitationData, config?: ApiConfigOverride): Promise<Invitation> {
    try {
      const response = await this.apiClient.post<Invitation>(INVITATION_ENDPOINTS.SEND, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // List company invitations
  async getCompanyInvitations(companyId: string, config?: ApiConfigOverride): Promise<Invitation[]> {
    try {
      const response = await this.apiClient.get<InvitationsResponse>(INVITATION_ENDPOINTS.LIST_BY_COMPANY(companyId), config);
      return response.data.invites;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get invitation info by token
  async getInvitationByToken(inviteToken: string, config?: ApiConfigOverride): Promise<InvitationWithCompany> {
    try {
      const response = await this.apiClient.get<InvitationWithCompany>(INVITATION_ENDPOINTS.GET_BY_TOKEN(inviteToken), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Accept invitation
  async acceptInvitation(inviteToken: string, data: AcceptInvitationData, config?: ApiConfigOverride): Promise<any> {
    try {
      const response = await this.apiClient.post<any>(INVITATION_ENDPOINTS.ACCEPT(inviteToken), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Expire/cancel invitation
  async expireInvitation(inviteId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.patch<void>(`/company/invites/${inviteId}`, {}, config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Delete invitation
  async deleteInvitation(inviteId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete<void>(`/company/invites/${inviteId}`, config);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Remove default instance export from here, it's handled in src/apis/index.ts
// export const invitationService = new InvitationService();
// export default invitationService; 