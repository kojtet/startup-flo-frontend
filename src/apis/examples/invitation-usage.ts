// Example usage of the Invitation API functions
import { 
  api, 
  AcceptInvitationData, 
  validatePassword,
  AcceptInvitationSuccessResponse 
} from '../index';

// Example 1: Accept an invitation
export const acceptInvitationExample = async (inviteToken: string) => {
  try {
    // Prepare the invitation data
    const invitationData: AcceptInvitationData = {
      email: 'user@example.com',
      password: 'SecurePass123!',
      first_name: 'John',
      last_name: 'Doe'
    };

    // Validate password before sending
    const passwordValidation = validatePassword(invitationData.password);
    if (!passwordValidation.isValid) {
      console.error('Password validation failed:', passwordValidation.errors);
      return;
    }

    // Accept the invitation
    const response: AcceptInvitationSuccessResponse = await api.invitations.acceptInvitation(
      inviteToken, 
      invitationData
    );

    console.log('Invitation accepted successfully:', response.message);
    console.log('User created:', response.user);
    
    // Store user data
    localStorage.setItem('sf_access_token', response.user.id);
    localStorage.setItem('sf_user_data', JSON.stringify(response.user));
    
    return response;
    
  } catch (error: any) {
    console.error('Failed to accept invitation:', error.message);
    throw error;
  }
};

// Example 2: Get invitation details
export const getInvitationDetailsExample = async (inviteToken: string) => {
  try {
    const invitationData = await api.invitations.getInvitationByToken(inviteToken);
    console.log('Invitation details:', invitationData);
    return invitationData;
  } catch (error: any) {
    console.error('Failed to get invitation details:', error.message);
    throw error;
  }
};

// Example 3: Send an invitation
export const sendInvitationExample = async () => {
  try {
    const invitationData = {
      email: 'newuser@example.com',
      role: 'admin',
      company_id: 'your-company-id'
    };

    const response = await api.invitations.sendInvitation(invitationData);
    console.log('Invitation sent successfully:', response);
    return response;
  } catch (error: any) {
    console.error('Failed to send invitation:', error.message);
    throw error;
  }
};

// Example 4: Get company invitations
export const getCompanyInvitationsExample = async (companyId: string) => {
  try {
    const invitations = await api.invitations.getCompanyInvitations(companyId);
    console.log('Company invitations:', invitations);
    return invitations;
  } catch (error: any) {
    console.error('Failed to get company invitations:', error.message);
    throw error;
  }
};

// Example 5: Password validation utility
export const passwordValidationExample = () => {
  const testPasswords = [
    'weak',           // Too short, no uppercase, no special char
    'weakpassword',   // No uppercase, no special char
    'WeakPassword',   // No special char
    'WeakPass!',      // Valid
    '123456',         // Common sequence
    'password123',    // Common sequence
    'SecurePass123!'  // Valid
  ];

  testPasswords.forEach(password => {
    const validation = validatePassword(password);
    console.log(`Password: "${password}" - Valid: ${validation.isValid}`);
    if (!validation.isValid) {
      console.log('  Errors:', validation.errors);
    }
  });
};

// Example 6: Complete invitation flow
export const completeInvitationFlowExample = async (inviteToken: string) => {
  try {
    // Step 1: Get invitation details
    console.log('Step 1: Getting invitation details...');
    const invitationDetails = await getInvitationDetailsExample(inviteToken);
    
    // Step 2: Validate and accept invitation
    console.log('Step 2: Accepting invitation...');
    const acceptanceResponse = await acceptInvitationExample(inviteToken);
    
    // Step 3: Handle success
    console.log('Step 3: Invitation flow completed successfully!');
    console.log('User ID:', acceptanceResponse.user.id);
    console.log('User Email:', acceptanceResponse.user.email);
    console.log('User Role:', acceptanceResponse.user.role);
    console.log('Company ID:', acceptanceResponse.user.company_id);
    
    return {
      invitationDetails,
      acceptanceResponse
    };
    
  } catch (error: any) {
    console.error('Invitation flow failed:', error.message);
    throw error;
  }
};

// Example 7: Error handling with specific error types
export const handleInvitationErrorsExample = async (inviteToken: string) => {
  try {
    const invitationData: AcceptInvitationData = {
      email: 'user@example.com',
      password: 'weak', // This will fail validation
      first_name: 'John',
      last_name: 'Doe'
    };

    await api.invitations.acceptInvitation(inviteToken, invitationData);
    
  } catch (error: any) {
    if (error.message.includes('Password validation failed')) {
      console.log('Client-side validation error:', error.message);
      // Handle password validation errors
    } else if (error.message.includes('Failed to accept invitation')) {
      console.log('Server-side error:', error.message);
      // Handle server errors
    } else {
      console.log('Unknown error:', error.message);
      // Handle other errors
    }
  }
}; 