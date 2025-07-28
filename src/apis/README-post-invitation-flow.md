# Post-Invitation Flow Documentation

This document explains what happens after a user successfully accepts an invitation and their account is created.

## Overview

When a user accepts an invitation, the following sequence of events occurs:

1. **Account Creation** - User account is created in the database
2. **Success Message** - User sees confirmation message
3. **Redirect to Login** - User is redirected to the login page
4. **Manual Login** - User logs in with their credentials

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

### 2. Success Message Display

The user sees a success message:
```
"Account created successfully! Redirecting to login..."
```

### 3. Redirect to Login Page

After 2 seconds, the user is automatically redirected to the login page with pre-filled email:

```typescript
// Redirect to login page with email pre-filled
router.push(`/auth/login?email=${encodeURIComponent(formData.email)}&invitation=success`);
```

### 4. Login Page Integration

The login page can detect invitation success and show appropriate messaging:

```typescript
import { getInvitationParams, isInvitationSuccess, getPrefillEmail } from '../apis/utils/invitation-login-helper';

const LoginPage = () => {
  const router = useRouter();
  const invitationParams = getInvitationParams(router.query);
  
  const [email, setEmail] = useState(getPrefillEmail(invitationParams) || '');
  const [showSuccessMessage, setShowSuccessMessage] = useState(isInvitationSuccess(invitationParams));
  
  // Show success message for 5 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [showSuccessMessage]);
  
  return (
    <div>
      {showSuccessMessage && (
        <div className="success-message">
          Account created successfully! Please log in with your email and password.
        </div>
      )}
      <form>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        {/* rest of login form */}
      </form>
    </div>
  );
};
```

## User Experience Flow

### Complete Flow
1. User receives invitation email with link
2. User clicks invitation link
3. User fills out invitation form (email, password, first name, last name)
4. User clicks "Accept Invitation"
5. System validates password requirements
6. Account is created successfully
7. User sees: "Account created successfully! Redirecting to login..."
8. User is automatically redirected to login page
9. Login page shows success message and pre-fills email
10. User enters password and logs in
11. User is redirected to dashboard

## Technical Implementation

### AcceptInvitation Component

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    // Client-side password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      setLoading(false);
      return;
    }

    // Accept the invitation
    const response = await api.invitations.acceptInvitation(inviteToken, formData);

    setSuccess('Account created successfully! Redirecting to login...');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      router.push(`/auth/login?email=${encodeURIComponent(formData.email)}&invitation=success`);
    }, 2000);

  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Login Page Helper Functions

The `invitation-login-helper.ts` utility provides functions to:

- Extract invitation parameters from URL
- Check if user just completed invitation acceptance
- Get success message
- Pre-fill email field

## Error Handling

The system handles various error scenarios:

1. **Password Validation Errors**: Client-side validation before API call
2. **Server Validation Errors**: Backend password requirements
3. **Network Errors**: Connection issues during API calls
4. **Invalid Tokens**: Expired or invalid invitation tokens

## Security Considerations

1. **Password Requirements**: Enforced on both client and server
2. **Token Validation**: Proper invitation token validation
3. **HTTPS**: All API calls use secure connections
4. **Input Validation**: Proper form validation and sanitization

## Benefits of This Approach

1. **Simplicity**: Straightforward flow without complex auto-login logic
2. **Reliability**: No dependency on auto-login success
3. **User Control**: Users explicitly log in with their credentials
4. **Clear Feedback**: Users know exactly what happened and what to do next
5. **Consistent Experience**: Same login flow for all users

## Integration Points

### URL Parameters

The login page receives these URL parameters:
- `email`: Pre-filled email address
- `invitation`: Set to "success" when coming from invitation acceptance

### Login Page Integration

The login page can:
- Show success message for invitation completion
- Pre-fill email field
- Focus on password field for better UX
- Clear success message after a few seconds

## Best Practices

1. **Clear Messaging**: Always provide clear feedback about the process status
2. **Pre-fill Email**: Reduce friction by pre-filling the email field
3. **Loading States**: Show loading indicators during API calls
4. **Validation**: Client-side validation before server calls
5. **Error Recovery**: Graceful handling of all error scenarios

## Troubleshooting

### Common Issues

1. **Invalid invitation token**: Check token validity and expiration
2. **Password requirements**: Verify password meets all requirements
3. **Network errors**: Check connectivity and server status
4. **Redirect issues**: Ensure proper route configuration

### Debug Information

Enable debug logging to track the flow:

```typescript
console.log('Invitation accepted:', response);
console.log('Redirecting to:', `/auth/login?email=${formData.email}&invitation=success`);
``` 