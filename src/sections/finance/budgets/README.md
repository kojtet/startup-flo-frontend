# Finance Budgets Section

This directory contains the modular components for managing budgets in the Finance module.

## Components

### `useBudgets.ts`
Custom hook that manages budget state and operations:
- Fetches budgets from the API
- Handles CRUD operations (create, read, update, delete)
- Manages search and filtering
- Handles pagination
- Provides budget statistics

### `BudgetForm.tsx`
Modal form component for creating and editing budgets:
- Form validation
- Date range selection
- Scope type selection (company, department, project, user)
- Status management
- **Owner ID is automatically set to current user** (no manual input required)

### `BudgetCard.tsx`
Card component for displaying budget information:
- Budget details and status
- Progress tracking with visual progress bar
- Allocation summary
- Edit and delete actions
- **Displays user names instead of emails** using `getUserDisplayName` utility
- Responsive design

### `BudgetFilters.tsx`
Filtering component for budgets:
- Search by budget name
- Filter by status (active, inactive, completed, cancelled)
- Filter by scope type (company, department, project, user)
- Clear filters functionality

### `BudgetPagination.tsx`
Pagination component for budget lists:
- Page navigation
- Page number display
- First/last page buttons
- Loading state handling

### `index.tsx`
Main budgets section component that combines all components:
- Summary cards with statistics
- Filter and search functionality
- Budget list with cards
- Pagination
- Form modal integration

## Features

- **Budget Management**: Create, edit, and delete budgets
- **Progress Tracking**: Visual progress bars showing budget utilization
- **Allocation Tracking**: View budget allocations by category
- **Filtering & Search**: Find budgets by name, status, or scope
- **Pagination**: Handle large numbers of budgets efficiently
- **Statistics**: Overview cards showing key metrics
- **Responsive Design**: Works on desktop and mobile devices
- **User-Friendly Display**: Shows user names instead of emails
- **Automatic Ownership**: Owner ID is automatically set to current user

## API Integration

Uses the authenticated `apiClient` from `useAuth` context to:
- GET `/finance/budgets` - Fetch budgets with optional filters
- POST `/finance/budgets` - Create new budget (owner_id auto-set)
- PUT `/finance/budgets/:id` - Update existing budget
- DELETE `/finance/budgets/:id` - Delete budget

## User Display

The budget system uses the `getUserDisplayName` utility function to display user names:
- Shows "First Last" if both first_name and last_name are available
- Falls back to email if name is not available
- Shows "Unknown User" if no user data is available

## Owner Management

- **Automatic Assignment**: When creating budgets, the owner_id is automatically set to the current logged-in user's ID
- **No Manual Input**: Users cannot manually set the owner_id in the form
- **Consistent Ownership**: All budgets created by a user are automatically owned by that user

## Usage

```tsx
import { BudgetsSection } from '@/sections/finance/budgets';

function MyPage() {
  return (
    <div>
      <h1>Budgets</h1>
      <BudgetsSection />
    </div>
  );
}
```

## Dependencies

- `@/hooks/useFinance` - Finance API operations
- `@/hooks/use-toast` - Toast notifications
- `@/contexts/AuthContext` - Authentication and user data
- `@/components/ui/*` - UI components
- `@/lib/utils` - Utility functions including `getUserDisplayName`
- `lucide-react` - Icons 