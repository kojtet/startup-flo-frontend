# Invitation API Documentation

This document describes the Invitation API functionality for the StartupFlo frontend application.

## Overview

The Invitation API allows users to accept invitations to join companies, manage invitation data, and handle the complete invitation flow from token validation to user account creation.

## API Endpoints

### Base URL
```
{{base_url}}/invites
```

### Endpoints

1. **Get Invitation by Token**
   - `GET /invites/{invite_token}`
   - Retrieves invitation details using the invitation token

2. **Accept Invitation**
   - `POST /invites/{invite_token}/accept`
   - Accepts an invitation and creates a new user account

3. **Send Invitation**
   - `POST /invites`
   - Sends a new invitation to a user

4. **Get Company Invitations**
   - `GET /invites/company/{company_id}`
   - Lists all invitations for a specific company

5. **Expire Invitation**
   - `PATCH /invites/{invite_id}`
   - Expires an invitation

6. **Delete Invitation**
   - `DELETE /invites/{invite_id}`
   - Deletes an invitation

## Data Types

### AcceptInvitationData
```typescript
interface AcceptInvitationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}
```

### AcceptInvitationSuccessResponse
```typescript
interface AcceptInvitationSuccessResponse {
  message: string;
  user: {
    id: string;
    email: string;
    company_id: string;
    role: string;
  };
  details: string;
}
```

### AcceptInvitationErrorResponse
```typescript
interface AcceptInvitationErrorResponse {
  message: string;
  errors: string[];
}
```

## Password Requirements

The password must meet the following criteria:
- At least 8 characters long
- Contains at least one uppercase letter
- Contains at least one special character
- Does not contain common sequences (123, abc, password, etc.)

## Usage Examples

### Basic Invitation Acceptance

```typescript
import { api, AcceptInvitationData } from '../apis';

const acceptInvitation = async (inviteToken: string) => {
  try {
    const data: AcceptInvitationData = {
      email: 'user@example.com',
      password: 'SecurePass123!',
      first_name: 'John',
      last_name: 'Doe'
    };

    const response = await api.invitations.acceptInvitation(inviteToken, data);
    console.log('Success:', response.message);
    return response;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
```

### Password Validation

```typescript
import { validatePassword } from '../apis';

const validateUserPassword = (password: string) => {
  const validation = validatePassword(password);
  
  if (!validation.isValid) {
    console.log('Password errors:', validation.errors);
    return false;
  }
  
  return true;
};
```

### Complete Invitation Flow

```typescript
import { api } from '../apis';

const completeInvitationFlow = async (inviteToken: string) => {
  try {
    // Step 1: Get invitation details
    const invitationDetails = await api.invitations.getInvitationByToken(inviteToken);
    
    // Step 2: Accept invitation
    const acceptanceResponse = await api.invitations.acceptInvitation(inviteToken, {
      email: 'user@example.com',
      password: 'SecurePass123!',
      first_name: 'John',
      last_name: 'Doe'
    });
    
    // Step 3: Store user data
    localStorage.setItem('sf_access_token', acceptanceResponse.user.id);
    localStorage.setItem('sf_user_data', JSON.stringify(acceptanceResponse.user));
    
    return acceptanceResponse;
  } catch (error) {
    console.error('Invitation flow failed:', error.message);
    throw error;
  }
};
```

## Error Handling

### Password Validation Errors

When password validation fails, the API returns:
```json
{
  "message": "Password does not meet requirements",
  "errors": [
    "Password must contain at least one uppercase letter",
    "Password must contain at least one special character",
    "Password must not contain common sequences"
  ]
}
```

### Success Response

When invitation acceptance is successful:
```json
{
  "message": "Invitation accepted successfully",
  "user": {
    "id": "2b53d772-0aab-451d-a5bc-09e963354538",
    "email": "user@example.com",
    "company_id": "d4dd2666-bfa8-49ed-8658-058f4e00b360",
    "role": "admin"
  },
  "details": "Welcome! Your account has been created successfully. You can now log in with your email address and password."
}
```

## React Component Usage

### AcceptInvitation Component

```typescript
import AcceptInvitation from '../components/auth/AcceptInvitation';

// In your page component
const InvitationPage = () => {
  const { inviteToken } = useRouter().query;
  
  if (!inviteToken) {
    return <div>Invalid invitation link</div>;
  }
  
  return <AcceptInvitation inviteToken={inviteToken as string} />;
};
```

## Best Practices

1. **Client-side Validation**: Always validate passwords on the client-side before making API calls to provide immediate feedback to users.

2. **Error Handling**: Implement proper error handling to show user-friendly error messages.

3. **Loading States**: Show loading states during API calls to improve user experience.

4. **Token Storage**: Store user tokens securely after successful invitation acceptance.

5. **Redirect Handling**: Redirect users to appropriate pages after successful invitation acceptance.

## Security Considerations

1. **Token Validation**: Always validate invitation tokens before allowing users to accept invitations.

2. **Password Strength**: Enforce strong password requirements both on client and server side.

3. **HTTPS**: Ensure all API calls are made over HTTPS in production.

4. **Token Expiration**: Handle expired invitation tokens gracefully.

## Testing

Use the provided example functions in `examples/invitation-usage.ts` to test the API functionality:

```typescript
import { passwordValidationExample } from './examples/invitation-usage';

// Test password validation
passwordValidationExample();
```

## Troubleshooting

### Common Issues

1. **Invalid Token**: Ensure the invitation token is valid and not expired.
2. **Password Requirements**: Verify that the password meets all requirements.
3. **Network Errors**: Check network connectivity and API endpoint availability.
4. **CORS Issues**: Ensure proper CORS configuration on the backend.

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages and API responses. 