# API Documentation

This directory contains all API-related code organized in a compartmentalized structure using Axios.

## Structure

```
/apis
├── client.ts          # Axios configuration and interceptors
├── types.ts           # TypeScript interfaces and types
├── auth.ts            # Authentication endpoints
├── user.ts            # User management endpoints
├── projects.ts        # Project management endpoints
├── finance.ts         # Finance endpoints
├── index.ts           # Main export file
└── README.md          # This file
```

## Features

- **Centralized Token Management**: Bearer tokens are automatically attached to all requests
- **Automatic Token Refresh**: Handles token expiration and refresh automatically
- **Error Handling**: Global error handling with automatic logout on 401 errors
- **Type Safety**: Full TypeScript support with proper interfaces
- **Modular Structure**: Each business domain has its own API module

## Usage Examples

### Basic Import

```typescript
import { api } from '@/apis';
// or
import { authApi, userApi, projectsApi, financeApi } from '@/apis';
```

### Authentication

```typescript
// Login
try {
  const loginResponse = await api.auth.login({
    email: 'user@example.com',
    password: 'password123'
  });
  console.log('Login successful:', loginResponse);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Logout
await api.auth.logout();

// Forgot password
await api.auth.forgotPassword('user@example.com');
```

### User Management

```typescript
// Get current user
const currentUser = await api.user.getCurrentUser();

// Update profile
const updatedUser = await api.user.updateProfile({
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890'
});

// Change password
await api.user.changePassword({
  current_password: 'oldPassword',
  new_password: 'newPassword',
  confirm_password: 'newPassword'
});

// Upload avatar
const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
await api.user.uploadAvatar(file);
```

### Projects

```typescript
// List projects with pagination
const projects = await api.projects.list({
  page: 1,
  limit: 10,
  sort: 'created_at',
  order: 'desc'
});

// Create project
const newProject = await api.projects.create({
  name: 'New Project',
  description: 'Project description',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  budget: 50000
});

// Get project by ID
const project = await api.projects.get('project-id');

// Update project
const updatedProject = await api.projects.update('project-id', {
  status: 'completed',
  progress: 100
});

// Archive project
await api.projects.archive('project-id');
```

### Finance

```typescript
// List invoices
const invoices = await api.finance.invoices.list({
  page: 1,
  limit: 20
});

// Create invoice
const newInvoice = await api.finance.invoices.create({
  client_name: 'Client Name',
  client_email: 'client@example.com',
  amount: 1000,
  due_date: '2024-02-01'
});

// Mark invoice as paid
await api.finance.invoices.markAsPaid('invoice-id');

// Create expense
const newExpense = await api.finance.expenses.create({
  title: 'Office Supplies',
  description: 'Monthly office supplies purchase',
  amount: 250,
  category: 'Office',
  date: '2024-01-15'
});

// Approve expense
await api.finance.expenses.approve('expense-id');
```

### Error Handling

All API calls can throw errors. The axios interceptors handle:

- **401 Unauthorized**: Automatically logs out user and redirects to login
- **Network Errors**: Proper error messages
- **Validation Errors**: Server validation error details

```typescript
try {
  const data = await api.user.getCurrentUser();
} catch (error) {
  if (error.response?.status === 403) {
    console.error('Access forbidden');
  } else if (error.response?.status === 404) {
    console.error('User not found');
  } else {
    console.error('API Error:', error.message);
  }
}
```

### Manual Token Management

```typescript
import { setAuthToken } from '@/apis';

// Set token manually (usually not needed as AuthContext handles this)
setAuthToken('your-bearer-token');

// Clear token
setAuthToken(null);
```

## Adding New API Modules

To add a new API module:

1. Create a new file in `/apis` (e.g., `hr.ts`)
2. Define your endpoints and interfaces
3. Create the API functions using `apiMethods`
4. Export the module in `index.ts`

Example:

```typescript
// hr.ts
import { apiMethods } from './client';
import { ApiResponse } from './types';

export interface Employee {
  id: string;
  name: string;
  email: string;
  // ... other fields
}

export const hrApi = {
  employees: {
    list: async () => {
      const response = await apiMethods.get<ApiResponse<Employee[]>>('/hr/employees');
      return response.data.data!;
    },
    // ... other methods
  },
};

export default hrApi;
```

Then add to `index.ts`:

```typescript
export { default as hrApi } from './hr';
export { hrApi } from './hr';

// Add to main api object
export const api = {
  // ... existing modules
  hr: hrApi,
};
```

## Environment Configuration

The base URL is currently hardcoded in `client.ts`. For different environments:

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://startup-flo-backend.onrender.com';
```

Add to your `.env.local`:

```
NEXT_PUBLIC_API_URL=https://your-api-url.com
``` 