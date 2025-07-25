# My Tasks - Modular Components

This directory contains the modular components for the My Tasks page, broken down from the original monolithic `my-tasks.tsx` file.

## Structure

```
my-tasks/
├── TaskCard.tsx           # Individual task card with drag functionality
├── TaskColumn.tsx         # Kanban column with droppable area
├── TaskStats.tsx          # Summary statistics cards
├── TaskSearch.tsx         # Search and filter component
├── TaskBoard.tsx          # Main kanban board with drag & drop
├── hooks/
│   └── useTaskManagement.ts  # Custom hook for task state management
├── index.tsx              # Main component that composes everything
└── README.md              # This file
```

## Components

### TaskCard.tsx
- **Purpose**: Renders individual task cards with drag functionality
- **Features**: 
  - Drag and drop support via `@dnd-kit/sortable`
  - Priority color coding
  - Due date formatting and overdue detection
  - Loading states for updates

### TaskColumn.tsx
- **Purpose**: Renders kanban columns with droppable areas
- **Features**:
  - Drop zone for tasks
  - Column header with task count
  - Empty state when no tasks
  - Visual feedback during drag operations

### TaskStats.tsx
- **Purpose**: Displays summary statistics cards
- **Features**:
  - Total tasks count
  - In progress tasks
  - Overdue tasks
  - Completed tasks
  - Loading skeleton states

### TaskSearch.tsx
- **Purpose**: Handles search and filtering functionality
- **Features**:
  - Search input with icon
  - Filter button (placeholder for future features)
  - Disabled state during loading

### TaskBoard.tsx
- **Purpose**: Main kanban board component
- **Features**:
  - Drag and drop context setup
  - Loading skeletons
  - Empty state handling
  - Drag overlay for visual feedback

### useTaskManagement.ts
- **Purpose**: Custom hook for task state management
- **Features**:
  - Task data fetching and caching
  - Optimistic updates for smooth UX
  - Drag and drop event handling
  - Search functionality
  - Error handling and notifications

### index.tsx
- **Purpose**: Main component that composes all other components
- **Features**:
  - Layout integration
  - Error boundaries
  - Loading states
  - Component orchestration

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Maintainability**: Easier to debug and modify individual components
4. **Testability**: Each component can be tested in isolation
5. **Performance**: Better code splitting and lazy loading opportunities
6. **Developer Experience**: Easier to understand and work with smaller files

## Usage

The main page file (`src/pages/projects/my-tasks.tsx`) now simply imports and exports the modular component:

```tsx
import MyTasks from "@/sections/projects/my-tasks";

export default MyTasks;
```

## Dependencies

- `@dnd-kit/core` - Drag and drop functionality
- `@dnd-kit/sortable` - Sortable drag and drop
- `@dnd-kit/utilities` - CSS utilities for drag and drop
- `lucide-react` - Icons
- `@/components/ui/*` - UI components
- `@/contexts/*` - Context providers
- `@/hooks/*` - Custom hooks
- `@/apis/*` - API types and clients 