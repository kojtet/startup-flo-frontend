/**
 * Utility functions for handling invitation success in the login page
 */

export interface InvitationLoginParams {
  email?: string;
  invitation?: string;
}

/**
 * Extract invitation parameters from URL query string
 */
export const getInvitationParams = (query: any): InvitationLoginParams => {
  return {
    email: query.email as string,
    invitation: query.invitation as string
  };
};

/**
 * Check if user just completed invitation acceptance
 */
export const isInvitationSuccess = (params: InvitationLoginParams): boolean => {
  return params.invitation === 'success';
};

/**
 * Get success message for invitation completion
 */
export const getInvitationSuccessMessage = (): string => {
  return 'Account created successfully! Please log in with your email and password.';
};

/**
 * Pre-fill email in login form if available
 */
export const getPrefillEmail = (params: InvitationLoginParams): string | undefined => {
  return params.email;
}; 