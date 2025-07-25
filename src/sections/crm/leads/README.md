# CRM Leads Module

This directory contains the modular components for the CRM Leads functionality, broken down into reusable sections.

## Structure

```
src/sections/crm/leads/
├── index.tsx              # Main leads page that orchestrates all components
├── LeadForm.tsx           # Form component for creating/editing leads
├── LeadCard.tsx           # Individual lead display component
├── LeadFilters.tsx        # Search and filter functionality
├── LeadPagination.tsx     # Pagination component
├── useLeads.ts           # Custom hook for leads state management
└── README.md             # This documentation file
```

## Components

### `index.tsx`
The main leads page that orchestrates all the components. It provides:
- Page layout with ExtensibleLayout
- Dialog management for create/edit forms
- Component coordination

### `LeadForm.tsx`
A reusable form component for creating and editing leads. Features:
- Form validation
- Status and source selection
- Loading states
- Cancel/submit actions

**Props:**
- `formData`: Current form data
- `setFormData`: Function to update form data
- `onSubmit`: Form submission handler
- `isEdit`: Boolean to indicate edit mode
- `formLoading`: Loading state for form submission
- `onCancel`: Cancel action handler

### `LeadCard.tsx`
Displays individual lead information with action buttons. Features:
- Lead information display
- Status badges with color coding
- Action buttons (email, phone, calendar, edit, delete)
- Responsive design

**Props:**
- `lead`: Lead data object
- `onEdit`: Edit action handler
- `onDelete`: Delete action handler

### `LeadFilters.tsx`
Handles search and status filtering. Features:
- Search input with icon
- Status filter dropdown
- Responsive layout

**Props:**
- `searchTerm`: Current search term
- `setSearchTerm`: Function to update search term
- `statusFilter`: Current status filter
- `setStatusFilter`: Function to update status filter

### `LeadPagination.tsx`
Manages pagination display and logic. Features:
- Page navigation
- Items per page display
- Responsive pagination controls

**Props:**
- `currentPage`: Current page number
- `setCurrentPage`: Function to update current page
- `totalPages`: Total number of pages
- `startIndex`: Start index of current page
- `endIndex`: End index of current page
- `totalItems`: Total number of items

### `useLeads.ts`
Custom hook that manages all leads-related state and API operations. Provides:
- Leads data management
- API calls (fetch, create, update, delete)
- Search and filtering logic
- Pagination logic
- Loading states
- Error handling with toast notifications

**Returns:**
- State: `leads`, `loading`, `formLoading`, `searchTerm`, `statusFilter`, etc.
- Actions: `handleCreateLead`, `handleEditLead`, `handleDeleteLead`, etc.
- Utilities: `resetFormData`, `refreshLeads`, etc.

## Usage

The main page (`src/pages/crm/leads.tsx`) now simply imports and exports the modular component:

```tsx
import LeadsInbox from "@/sections/crm/leads";

export default LeadsInbox;
```

## Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Maintainability**: Easier to maintain and update individual components
4. **Testability**: Each component can be tested independently
5. **Separation of Concerns**: UI logic is separated from business logic
6. **Type Safety**: Full TypeScript support with proper type definitions

## API Integration

The module uses the `useCRM` hook (`src/hooks/useCRM.ts`) which follows the same pattern as other API hooks in the application. The hook provides:

- **fetchLeads**: GET `/crm/leads` - Fetch all leads with optional filtering
- **createLead**: POST `/crm/leads` - Create a new lead
- **updateLead**: PATCH `/crm/leads/:id` - Update an existing lead
- **deleteLead**: DELETE `/crm/leads/:id` - Delete a lead
- **getLeadById**: GET `/crm/leads/:id` - Get a specific lead by ID

The API endpoints match the Postman collection structure and use proper authentication via the `apiClient` from the AuthContext.

## Postman Collection Endpoints

The following endpoints are implemented and match the Postman collection:

1. **Create Lead** - POST `/crm/leads`
   - Body: `{ name, email, phone, source, status, assigned_to }`

2. **Get All Leads** - GET `/crm/leads`
   - Query params: `status` (optional)

3. **Get Lead by ID** - GET `/crm/leads/:id`

4. **Update Lead** - PATCH `/crm/leads/:id`
   - Body: Partial update data

5. **Delete Lead** - DELETE `/crm/leads/:id`

## Future Enhancements

- Implement caching for better performance
- Add sorting functionality
- Add bulk operations (bulk edit, bulk delete)
- Add export functionality
- Add advanced filtering options
- Add lead categories support
- Add lead assignment to team members 