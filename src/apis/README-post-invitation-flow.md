# Post-Invitation Flow Documentation

This document explains what happens after a user successfully accepts an invitation and their account is created.

## Overview

When a user accepts an invitation, the following sequence of events occurs:

1. **Account Creation** - User account is created in the database
2. **Authentication Flow** - User is automatically logged in (if possible)
3. **Session Management** - User session is established
4. **Redirect** - User is redirected to the appropriate page
5. **Onboarding** - User may be guided through initial setup

## Detailed Flow

### 1. Account Creation Response

After successful invitation acceptance, the backend returns:

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

### 2. Automatic Login Attempt

The system attempts to automatically log in the user using their credentials:

```typescript
// Attempt to log in with the same credentials used for invitation acceptance
await login({
  email: formData.email,
  password: formData.password
});
```

**Note**: The invitation acceptance endpoint does NOT return JWT tokens. The system must make a separate login request to obtain proper authentication tokens.

### 3. Session Establishment

If automatic login succeeds:

- **JWT Tokens**: Access and refresh tokens are obtained from the login endpoint
- **User Context**: User data is stored in the AuthContext
- **API Headers**: Authorization headers are set for subsequent API calls
- **Local Storage**: Tokens and user data are persisted in localStorage

```typescript
// Tokens are stored in localStorage
localStorage.setItem('sf_access_token', tokens.accessToken);
localStorage.setItem('sf_refresh_token', tokens.refreshToken);
localStorage.setItem('sf_user', JSON.stringify(user));

// User context is updated
setUser(user);
```

### 4. Redirect to Dashboard

After successful login, the user is redirected to the dashboard:

```typescript
// Redirect after 2 seconds to show success message
setTimeout(() => {
  router.push('/dashboard');
}, 2000);
```

### 5. Fallback Flow

If automatic login fails (e.g., due to network issues or server delays):

- **Success Message**: User sees a success message with instructions
- **Manual Login**: User is prompted to log in manually
- **Email Pre-fill**: Login form may be pre-filled with their email

```typescript
// Fallback message
setSuccess('Account created successfully! Please log in with your email and password.');
```

## User Experience Scenarios

### Scenario 1: Successful Auto-Login
1. User fills out invitation form
2. Clicks "Accept Invitation"
3. Sees: "Account created and logged in successfully! Redirecting to dashboard..."
4. Automatically redirected to dashboard
5. Fully authenticated and ready to use the application

### Scenario 2: Auto-Login Failure
1. User fills out invitation form
2. Clicks "Accept Invitation"
3. Sees: "Account created successfully! Please log in with your email and password."
4. User manually logs in with their credentials
5. Redirected to dashboard after manual login

### Scenario 3: Network Issues
1. User fills out invitation form
2. Clicks "Accept Invitation"
3. Sees error message if invitation acceptance fails
4. User can retry the invitation acceptance

## Technical Implementation

### Post-Invitation Flow Utility

The `handlePostInvitationFlow` utility manages the complete post-creation process:

```typescript
const flowResult = await handlePostInvitationFlow(
  response, // API response from invitation acceptance
  credentials, // User credentials for login
  {
    onSuccess: (user) => {
      // Called when user is created successfully
    },
    onLoginSuccess: () => {
      // Called when auto-login succeeds
    },
    onLoginFailure: (message) => {
      // Called when auto-login fails
    },
    onError: (errorMessage) => {
      // Called when any error occurs
    },
    redirectTo: '/dashboard'
  }
);
```

### Error Handling

The system handles various error scenarios:

1. **Password Validation Errors**: Client-side validation before API call
2. **Server Validation Errors**: Backend password requirements
3. **Network Errors**: Connection issues during API calls
4. **Login Errors**: Auto-login failure after account creation

### Security Considerations

1. **Token Management**: Proper JWT token handling and refresh
2. **Session Security**: Secure storage of authentication data
3. **Password Requirements**: Enforced on both client and server
4. **HTTPS**: All API calls use secure connections

## Integration Points

### AuthContext Integration

The post-invitation flow integrates with the existing AuthContext:

```typescript
import { useAuth } from '../../contexts/AuthContext';

const { login } = useAuth();

// Use the login function from AuthContext
await login(credentials);
```

### Router Integration

Uses Next.js router for navigation:

```typescript
import { useRouter } from 'next/router';

const router = useRouter();
router.push('/dashboard');
```

### Local Storage Integration

Manages user session data:

```typescript
// Store invitation success state
localStorage.setItem('sf_invitation_success', 'true');
localStorage.setItem('sf_invitation_user_email', email);
```

## Best Practices

1. **User Feedback**: Always provide clear feedback about the process status
2. **Error Recovery**: Graceful handling of auto-login failures
3. **Loading States**: Show loading indicators during API calls
4. **Validation**: Client-side validation before server calls
5. **Security**: Proper token management and secure storage

## Troubleshooting

### Common Issues

1. **Auto-login fails**: Check network connectivity and server status
2. **Token issues**: Verify JWT token format and expiration
3. **Redirect problems**: Ensure proper route configuration
4. **Session persistence**: Check localStorage availability and permissions

### Debug Information

Enable debug logging to track the flow:

```typescript
console.log('Invitation accepted:', response);
console.log('Auto-login attempt:', credentials);
console.log('Flow result:', flowResult);
```

## Future Enhancements

1. **Onboarding Flow**: Guided tour for new users
2. **Email Verification**: Optional email verification step
3. **Profile Completion**: Prompt to complete user profile
4. **Welcome Email**: Send welcome email after successful creation
5. **Analytics**: Track invitation acceptance and conversion rates 