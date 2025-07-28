// Examples of handling post-invitation flow in different scenarios
import { 
  handlePostInvitationFlow, 
  handlePostInvitationFlowWithoutContext,
  checkInvitationSuccess 
} from '../utils/post-invitation-flow';
import { AcceptInvitationSuccessResponse, api } from '../index';

// Example 1: Basic post-invitation flow with AuthContext
export const basicPostInvitationExample = async (
  response: AcceptInvitationSuccessResponse,
  credentials: { email: string; password: string }
) => {
  const result = await handlePostInvitationFlow(response, credentials, {
    onSuccess: (user) => {
      console.log('User created:', user);
    },
    onLoginSuccess: () => {
      console.log('Auto-login successful');
    },
    onLoginFailure: (message) => {
      console.log('Auto-login failed:', message);
    },
    redirectTo: '/dashboard'
  });

  return result;
};

// Example 2: Post-invitation flow with custom redirect
export const customRedirectExample = async (
  response: AcceptInvitationSuccessResponse,
  credentials: { email: string; password: string },
  userRole: string
) => {
  // Determine redirect based on user role
  let redirectPath = '/dashboard';
  
  switch (userRole) {
    case 'admin':
      redirectPath = '/admin/dashboard';
      break;
    case 'manager':
      redirectPath = '/manager/dashboard';
      break;
    case 'employee':
      redirectPath = '/employee/dashboard';
      break;
    default:
      redirectPath = '/dashboard';
  }

  const result = await handlePostInvitationFlow(response, credentials, {
    onSuccess: (user) => {
      console.log(`User ${user.role} created successfully`);
    },
    onLoginSuccess: () => {
      console.log(`Redirecting ${userRole} to ${redirectPath}`);
    },
    redirectTo: redirectPath
  });

  return result;
};

// Example 3: Post-invitation flow without AuthContext (for utility functions)
export const utilityFunctionExample = async (
  response: AcceptInvitationSuccessResponse,
  credentials: { email: string; password: string }
) => {
  const result = await handlePostInvitationFlowWithoutContext(response, credentials, {
    onSuccess: (user) => {
      console.log('User created, redirecting to login');
    },
    redirectTo: '/auth/login'
  });

  return result;
};

// Example 4: Handling invitation success in login page
export const handleInvitationSuccessInLogin = () => {
  const { isInvitationSuccess, email, message } = checkInvitationSuccess();
  
  if (isInvitationSuccess) {
    return {
      showSuccessMessage: true,
      successMessage: message || 'Account created successfully!',
      prefillEmail: email,
      autoFocusPassword: true
    };
  }
  
  return {
    showSuccessMessage: false,
    prefillEmail: undefined,
    autoFocusPassword: false
  };
};

// Example 5: Complete invitation flow with error handling
export const completeInvitationFlowWithErrorHandling = async (
  inviteToken: string,
  formData: { email: string; password: string; first_name: string; last_name: string }
) => {
  try {
    // Step 1: Accept invitation
    const response = await api.invitations.acceptInvitation(inviteToken, formData);
    
    // Step 2: Handle post-invitation flow
    const flowResult = await handlePostInvitationFlow(response, {
      email: formData.email,
      password: formData.password
    }, {
      onSuccess: (user) => {
        // Log analytics event
        console.log('Invitation accepted:', {
          userId: user.id,
          companyId: user.company_id,
          role: user.role
        });
      },
      onLoginSuccess: () => {
        // Show welcome message
        console.log('Welcome to the platform!');
      },
      onLoginFailure: (message) => {
        // Store for manual login
        localStorage.setItem('pending_login_email', formData.email);
      },
      onError: (error) => {
        // Log error for debugging
        console.error('Post-invitation error:', error);
      }
    });

    return flowResult;

  } catch (error: any) {
    console.error('Invitation flow failed:', error);
    throw error;
  }
};

// Example 6: Onboarding flow after invitation acceptance
export const onboardingFlowExample = async (
  response: AcceptInvitationSuccessResponse,
  credentials: { email: string; password: string }
) => {
  const result = await handlePostInvitationFlow(response, credentials, {
    onSuccess: (user) => {
      // Check if user needs onboarding
      if (user.role === 'admin') {
        // Redirect to admin onboarding
        window.location.href = '/onboarding/admin';
      } else {
        // Redirect to regular onboarding
        window.location.href = '/onboarding/employee';
      }
    },
    onLoginSuccess: () => {
      console.log('User logged in, starting onboarding');
    },
    redirectTo: '/onboarding'
  });

  return result;
};

// Example 7: Multi-step post-invitation process
export const multiStepPostInvitationExample = async (
  response: AcceptInvitationSuccessResponse,
  credentials: { email: string; password: string }
) => {
  // Step 1: Handle basic post-invitation flow
  const flowResult = await handlePostInvitationFlow(response, credentials, {
    onSuccess: (user) => {
      // Step 2: Send welcome email
      sendWelcomeEmail(user.email);
      
      // Step 3: Create user profile
      createUserProfile(user.id);
      
      // Step 4: Set up user preferences
      setupUserPreferences(user.id, user.role);
    },
    onLoginSuccess: () => {
      // Step 5: Show welcome modal
      showWelcomeModal();
    }
  });

  return flowResult;
};

// Mock functions for the multi-step example
const sendWelcomeEmail = (email: string, firstName?: string) => {
  console.log(`Sending welcome email to ${email}`);
  // Implementation would call email service
};

const createUserProfile = (userId: string) => {
  console.log(`Creating profile for user ${userId}`);
  // Implementation would call profile API
};

const setupUserPreferences = (userId: string, role: string) => {
  console.log(`Setting up preferences for ${role} user ${userId}`);
  // Implementation would call preferences API
};

const showWelcomeModal = () => {
  console.log('Showing welcome modal');
  // Implementation would show modal component
};

// Example 8: Error recovery and retry logic
export const errorRecoveryExample = async (
  response: AcceptInvitationSuccessResponse,
  credentials: { email: string; password: string },
  maxRetries: number = 3
) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const result = await handlePostInvitationFlow(response, credentials, {
        onLoginSuccess: () => {
          console.log(`Login successful on attempt ${attempts + 1}`);
        },
        onLoginFailure: (message) => {
          console.log(`Login failed on attempt ${attempts + 1}: ${message}`);
        }
      });

      if (result.autoLoginSuccess) {
        return result;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));
      attempts++;

    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed:`, error);
      attempts++;
      
      if (attempts >= maxRetries) {
        throw error;
      }
    }
  }

  // All retries failed, return failure result
  return {
    success: false,
    autoLoginSuccess: false,
    message: 'Auto-login failed after multiple attempts. Please log in manually.'
  };
}; 