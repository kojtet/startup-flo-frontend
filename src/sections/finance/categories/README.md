# Finance Categories Section

This section contains modular components for managing finance categories in the application.

## Components

### `useCategories.ts`
Custom hook that manages category state and operations using the authenticated `useFinance` hook.

**Features:**
- Category CRUD operations (Create, Read, Update, Delete)
- Search and filtering functionality
- Form state management
- Error handling with toast notifications
- Automatic data refresh after operations
- **Pagination support** with configurable items per page
- **Real-time data updates** after create/update/delete operations

**API Endpoints:**
- `GET /finance/categories` - Fetch all categories
- `POST /finance/categories` - Create new category
- `PATCH /finance/categories/:id` - Update category
- `DELETE /finance/categories/:id` - Delete category

**Pagination Features:**
- Configurable items per page (default: 10)
- Smart page number display with ellipsis
- Automatic page reset when filters change
- Page navigation with Previous/Next buttons

### `CategoryForm.tsx`
Reusable form component for creating and editing categories.

**Props:**
- `formData`: Category form data
- `setFormData`: Function to update form data
- `onSubmit`: Form submission handler
- `isLoading`: Loading state
- `submitLabel`: Custom submit button text

**Fields:**
- Category Name (required)
- Category Type (income/expense)
- Color picker with live preview
- Description (optional)
- **Live preview** of how the category will look

**Features:**
- Visual icons for each field
- Color picker with preview
- Real-time form validation
- Loading states with standard app spinner
- Helpful text for each field

### `CategoryCard.tsx`
Card component for displaying individual categories.

**Props:**
- `category`: Category data to display
- `onEdit`: Edit handler function
- `onDelete`: Delete handler function

**Features:**
- Visual category type indicators (income/expense icons)
- Color-coded badges with gradients
- Edit and delete action buttons with hover animations
- Creation date and ID display
- **Hover effects** with scaling and shadow changes
- **Gradient overlays** based on category color
- **Animated action buttons** that slide in on hover

### `CategoryFilters.tsx`
Filter and search component for categories.

**Props:**
- `searchTerm`: Current search term
- `setSearchTerm`: Search term setter
- `typeFilter`: Current type filter
- `setTypeFilter`: Type filter setter
- `onCreateClick`: Create button click handler

**Features:**
- Enhanced search input with visual feedback
- Type filter dropdown with color-coded options
- Gradient create button with hover effects
- **Active filters display** showing current filters as badges
- **Visual feedback** when searching

### `CategoryPagination.tsx`
Pagination component for navigating through categories.

**Props:**
- `currentPage`: Current page number
- `totalPages`: Total number of pages
- `onPageChange`: Page change handler
- `onNextPage`: Next page handler
- `onPreviousPage`: Previous page handler
- `startIndex`: Start index of current page
- `endIndex`: End index of current page
- `totalItems`: Total number of items

**Features:**
- Smart page number display with ellipsis
- Previous/Next navigation buttons
- Results count display
- Responsive design
- Disabled states for edge cases

### `index.tsx`
Main categories section component that combines all other components.

**Features:**
- Enhanced summary cards with gradients and hover effects
- Integrated search and filtering
- Category list with paginated cards
- Create and edit modals
- Error handling and loading states
- **Pagination controls** when needed
- **Loading spinner** using app standard
- **Empty states** with helpful messaging

## Data Types

### `FinanceCategory`
```typescript
interface FinanceCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  description?: string;
  color: string;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}
```

### `CreateFinanceCategoryData`
```typescript
interface CreateFinanceCategoryData {
  name: string;
  type: "income" | "expense";
  description?: string;
  color: string;
}
```

### `UpdateFinanceCategoryData`
```typescript
interface UpdateFinanceCategoryData extends Partial<CreateFinanceCategoryData> {
  // All fields are optional since this extends Partial<CreateFinanceCategoryData>
  // This interface is intentionally empty to provide a clear type for updates
}
```

## Usage

The categories section is used in the main finance categories page:

```tsx
import { CategoriesSection } from '@/sections/finance/categories';

export default function CategoriesPage() {
  return (
    <ExtensibleLayout>
      <CategoriesSection />
    </ExtensibleLayout>
  );
}
```

## Authentication

All API calls use the authenticated `apiClient` from the `useAuth` context, ensuring proper authentication headers are included with each request.

## Error Handling

- Network errors are displayed as toast notifications
- Loading states are managed for better UX
- Retry functionality for failed requests
- Form validation with required field indicators
- **Automatic data refresh** after successful operations

## Pagination

The categories section includes comprehensive pagination:

- **10 items per page** by default
- **Smart page navigation** with ellipsis for large page counts
- **Automatic page reset** when search or filters change
- **Results counter** showing current range and total
- **Responsive design** that works on all screen sizes

## Loading States

- **Standard app spinner** (`animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent`)
- **Form loading states** with spinner in submit buttons
- **Page loading** with centered spinner and message
- **Smooth transitions** between loading and loaded states

## Recent Improvements

- ✅ **Fixed linter errors** in categories page
- ✅ **Added pagination** with smart page navigation
- ✅ **Fixed reload issue** after creating categories
- ✅ **Standardized loading spinner** across all components
- ✅ **Enhanced visual design** with gradients and animations
- ✅ **Improved user experience** with better feedback and states 