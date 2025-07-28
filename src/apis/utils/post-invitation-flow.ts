import { AcceptInvitationSuccessResponse } from '../index';
import { useAuth } from '../../contexts/AuthContext';

export interface PostInvitationFlowOptions {
  onSuccess?: (user: AcceptInvitationSuccessResponse['user']) => void;
  onLoginSuccess?: () => void;
  onLoginFailure?: (error: string) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

export interface PostInvitationFlowResult {
  success: boolean;
  user?: AcceptInvitationSuccessResponse['user'];
  autoLoginSuccess: boolean;
  message: string;
}

/**
 * Handles the complete flow after successful invitation acceptance
 */
export const handlePostInvitationFlow = async (
  response: AcceptInvitationSuccessResponse,
  credentials: { email: string; password: string },
  options: PostInvitationFlowOptions = {}
): Promise<PostInvitationFlowResult> => {
  const {
    onSuccess,
    onLoginSuccess,
    onLoginFailure,
    onError,
    redirectTo = '/dashboard'
  } = options;

  try {
    // Step 1: Call success callback with user data
    if (onSuccess) {
      onSuccess(response.user);
    }

    // Step 2: Attempt automatic login
    let autoLoginSuccess = false;
    try {
      // Import the auth context dynamically to avoid circular dependencies
      const { useAuth } = await import('../../contexts/AuthContext');
      const { login } = useAuth();
      
      await login(credentials);
      autoLoginSuccess = true;
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Step 3: Redirect after successful login
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 2000);
      }

    } catch (loginError: any) {
      autoLoginSuccess = false;
      const loginErrorMessage = `Account created successfully! Please log in with your email and password.`;
      
      if (onLoginFailure) {
        onLoginFailure(loginErrorMessage);
      }
      
      console.warn('Auto-login failed after invitation acceptance:', loginError.message);
    }

    return {
      success: true,
      user: response.user,
      autoLoginSuccess,
      message: autoLoginSuccess 
        ? response.message 
        : `${response.message} Please log in with your email and password.`
    };

  } catch (error: any) {
    const errorMessage = error.message || 'An unexpected error occurred';
    
    if (onError) {
      onError(errorMessage);
    }
    
    return {
      success: false,
      autoLoginSuccess: false,
      message: errorMessage
    };
  }
};

/**
 * Alternative flow that doesn't require the auth context
 * Useful for components that can't access the context directly
 */
export const handlePostInvitationFlowWithoutContext = async (
  response: AcceptInvitationSuccessResponse,
  credentials: { email: string; password: string },
  options: PostInvitationFlowOptions = {}
): Promise<PostInvitationFlowResult> => {
  const {
    onSuccess,
    onLoginSuccess,
    onLoginFailure,
    onError,
    redirectTo = '/dashboard'
  } = options;

  try {
    // Step 1: Call success callback with user data
    if (onSuccess) {
      onSuccess(response.user);
    }

    // Step 2: Store basic user info for manual login
    if (typeof window !== 'undefined') {
      localStorage.setItem('sf_invitation_user_email', credentials.email);
      localStorage.setItem('sf_invitation_success', 'true');
      localStorage.setItem('sf_invitation_message', response.message);
    }

    // Step 3: Redirect to login page with success message
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = `/auth/login?invitation=success&email=${encodeURIComponent(credentials.email)}`;
      }, 2000);
    }

    return {
      success: true,
      user: response.user,
      autoLoginSuccess: false,
      message: `${response.message} Please log in with your email and password.`
    };

  } catch (error: any) {
    const errorMessage = error.message || 'An unexpected error occurred';
    
    if (onError) {
      onError(errorMessage);
    }
    
    return {
      success: false,
      autoLoginSuccess: false,
      message: errorMessage
    };
  }
};

/**
 * Utility to check if user just completed invitation acceptance
 */
export const checkInvitationSuccess = (): {
  isInvitationSuccess: boolean;
  email?: string;
  message?: string;
} => {
  if (typeof window === 'undefined') {
    return { isInvitationSuccess: false };
  }

  const isInvitationSuccess = localStorage.getItem('sf_invitation_success') === 'true';
  const email = localStorage.getItem('sf_invitation_user_email');
  const message = localStorage.getItem('sf_invitation_message');

  // Clear the invitation success flags
  if (isInvitationSuccess) {
    localStorage.removeItem('sf_invitation_success');
    localStorage.removeItem('sf_invitation_user_email');
    localStorage.removeItem('sf_invitation_message');
  }

  return {
    isInvitationSuccess,
    email: email || undefined,
    message: message || undefined
  };
}; 