# Invite System Documentation

## Overview

The invite system allows company administrators to invite new users to join their company workspace. When a user is invited, they receive an email with a unique invitation link that allows them to create their account and join the company.

## How It Works

### 1. Invitation Flow

1. **Admin sends invitation**: Company admin sends an invitation to a user's email address
2. **Email sent**: User receives an email with a unique invitation link
3. **User clicks link**: User clicks the link which takes them to `/invite/[token]`
4. **Account creation**: User fills out the form to create their account
5. **Account activated**: User is automatically added to the company and can log in

### 2. Invitation Link Format

The invitation link follows this format:
```
https://startupflo.techlyafrica.com/invite/{invite_token}
```

Where `{invite_token}` is a JWT token containing:
- Email address
- Company ID
- Role (admin, member, etc.)
- Invited by (user ID)
- Expiration timestamp

### 3. API Endpoints

#### Get Invitation Details
```
GET /company/invites/{invite_token}
```
Returns invitation details including company information.

#### Accept Invitation
```
POST /company/invites/{invite_token}/accept
```
Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### 4. Frontend Implementation

#### Invite Page: `/invite/[token].tsx`

The invite page:
- Extracts the token from the URL
- Fetches invitation details from the API
- Displays a form for user registration
- Validates form inputs
- Submits the acceptance request
- Redirects to login page on success

#### Features:
- **Loading states**: Shows loading spinner while fetching invitation details
- **Error handling**: Displays appropriate error messages for invalid/expired invites
- **Form validation**: Validates required fields, password length, and password confirmation
- **User-friendly UI**: Clean, responsive design with helpful text and placeholders

### 5. Security Considerations

- Invitation tokens are JWT-based and have expiration times
- Tokens are single-use (accepted invitations cannot be used again)
- Email addresses are pre-filled and cannot be changed
- Passwords must meet minimum requirements (8+ characters)
- Form validation prevents submission of invalid data

### 6. Error Scenarios

- **Invalid token**: Token doesn't exist or is malformed
- **Expired token**: Token has passed its expiration date
- **Already accepted**: Token has already been used
- **Network errors**: API calls fail due to connectivity issues

### 7. User Experience

1. User receives email with invitation link
2. Clicks link and sees invitation details (company name, role)
3. Fills out registration form with their details
4. Submits form and sees success message
5. Redirected to login page to sign in with new account

## Testing

To test the invite system:

1. Use a valid invitation token in the URL: `/invite/{token}`
2. Fill out the registration form
3. Verify successful account creation
4. Test error scenarios with invalid/expired tokens

## Future Enhancements

- Email verification after account creation
- Password strength indicators
- Social login options
- Bulk invitation functionality
- Invitation management dashboard 