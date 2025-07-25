# Finance Accounts Section

This section provides a complete implementation for managing financial accounts with a modern, responsive interface following the same patterns as other sections in the application.

## Components

### `useAccounts` Hook
- **Location**: `src/sections/finance/accounts/useAccounts.ts`
- **Purpose**: Custom hook that manages all account-related state and operations
- **Features**:
  - Fetch accounts from API
  - Pagination (10 items per page)
  - Search and filtering by account type
  - CRUD operations (Create, Read, Update, Delete)
  - Loading states and error handling
  - Summary statistics calculation

### `AccountForm` Component
- **Location**: `src/sections/finance/accounts/AccountForm.tsx`
- **Purpose**: Form component for creating and editing financial accounts
- **Features**:
  - Account name, type, currency, balance, and description fields
  - Primary account toggle
  - Form validation
  - Loading states
  - Responsive design

### `AccountCard` Component
- **Location**: `src/sections/finance/accounts/AccountCard.tsx`
- **Purpose**: Card component to display account information
- **Features**:
  - Account type icons and color coding
  - Balance display with currency formatting
  - Primary account badge
  - Edit and delete actions
  - Hover effects

### `AccountFilters` Component
- **Location**: `src/sections/finance/accounts/AccountFilters.tsx`
- **Purpose**: Search and filter controls
- **Features**:
  - Text search for account names and descriptions
  - Account type filter dropdown
  - Responsive layout

### `AccountPagination` Component
- **Location**: `src/sections/finance/accounts/AccountPagination.tsx`
- **Purpose**: Pagination controls
- **Features**:
  - Previous/Next buttons
  - Page number navigation
  - Items count display
  - Smart page number display (with ellipsis)

### Main Page Component
- **Location**: `src/sections/finance/accounts/index.tsx`
- **Purpose**: Main page that orchestrates all components
- **Features**:
  - Summary cards (Total Balance, Total Accounts, Primary Account, Bank Accounts)
  - Modal dialogs for create/edit operations
  - Loading and empty states
  - Responsive layout

## API Integration

### Types
- `FinancialAccount`: Complete account interface
- `CreateFinancialAccountData`: Data structure for creating accounts
- `UpdateFinancialAccountData`: Data structure for updating accounts

### API Endpoints
- `GET /finance/accounts` - Fetch all accounts
- `POST /finance/accounts` - Create new account
- `PATCH /finance/accounts/:id` - Update account
- `DELETE /finance/accounts/:id` - Delete account

### Account Types
- Bank Account
- Credit Card
- Cash
- Investment
- Loan
- Other

### Currencies
- USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY

## Features

### Summary Dashboard
- Total balance across all accounts
- Total number of accounts
- Primary account identification
- Bank accounts count

### Search and Filtering
- Real-time search by account name or description
- Filter by account type
- Combined search and filter functionality

### Pagination
- 10 accounts per page
- Smart page number display
- Previous/Next navigation
- Items count display

### CRUD Operations
- Create new accounts with validation
- Edit existing accounts
- Delete accounts with confirmation
- Real-time updates

### Responsive Design
- Mobile-friendly layout
- Adaptive card layouts
- Responsive filters and pagination

## Usage

The main page is imported and used in `src/pages/finance/accounts-balances.tsx`:

```typescript
import AccountsBalancesPage from '@/sections/finance/accounts';

export default AccountsBalancesPage;
```

## Styling

- Uses shadcn/ui components for consistent design
- Tailwind CSS for responsive styling
- Lucide React icons for visual elements
- Color-coded account types for easy identification

## Error Handling

- API error handling with toast notifications
- Loading states for better UX
- Form validation
- Confirmation dialogs for destructive actions

## Performance

- Efficient pagination to handle large datasets
- Optimized re-renders with proper state management
- Debounced search functionality
- Minimal API calls with proper caching 