# Notification System

The app includes a comprehensive toast notification system that replaces the default `alert()` function with more user-friendly notifications.

## Quick Start

```tsx
import { notifications } from '@/components/NotificationService';

// Basic notifications
notifications.success("Operation completed successfully!");
notifications.error("Something went wrong!");
notifications.warning("Please check your input!");
notifications.info("Here's some information!");
```

## Using the Hook

For React components that need more control:

```tsx
import { useNotifications } from '@/components/NotificationService';

function MyComponent() {
  const { success, error, custom, dismiss } = useNotifications();
  
  const handleAction = () => {
    success("Task completed!");
  };
  
  return <button onClick={handleAction}>Do Something</button>;
}
```

## Available Methods

### Basic Notifications

- `notifications.success(message, options?)` - Green checkmark, 5s duration
- `notifications.error(message, options?)` - Red alert, 8s duration
- `notifications.warning(message, options?)` - Yellow warning, 5s duration
- `notifications.info(message, options?)` - Blue info, 5s duration

### Contextual Methods

- `notifications.projectCreated(projectName?)` - Project creation success
- `notifications.projectUpdated(projectName?)` - Project update success
- `notifications.projectDeleted(projectName?)` - Project deletion success
- `notifications.saveSuccess(itemType?)` - Generic save success
- `notifications.deleteSuccess(itemType?)` - Generic delete success
- `notifications.networkError()` - Network connectivity issues
- `notifications.validationError(message?)` - Form validation errors
- `notifications.permissionDenied()` - Access control errors

### Promise-based Notifications

For async operations with loading states:

```tsx
await notifications.promise(
  apiCall(),
  {
    loading: "Saving project...",
    success: "Project saved successfully!",
    error: "Failed to save project"
  }
);
```

## Options

All notification methods accept an optional `options` parameter:

```tsx
notifications.success("Message", {
  title: "Custom Title",
  duration: 10000, // 10 seconds
  action: {
    label: "Undo",
    onClick: () => undoAction()
  }
});
```

## Custom Notifications

For complete control over the notification:

```tsx
import { useNotifications } from '@/components/NotificationService';

const { custom } = useNotifications();

custom({
  title: "Custom Notification",
  description: "Detailed message here",
  variant: "destructive", // or "default"
  action: <Button onClick={handleAction}>Action</Button>
});
```

## Migration from alert()

Replace all `alert()` calls with appropriate notification methods:

```tsx
// Before
alert("Project created successfully!");

// After
notifications.projectCreated(projectName);

// Before
alert("Error: " + error.message);

// After
notifications.error(error.message);
```

## Configuration

The notification system is automatically included in the app through `AppProviders`. No additional setup is required.

- Maximum visible toasts: 3
- Default duration: 5 seconds (8 seconds for errors)
- Positioning: Top-right corner
- Dismissible: Yes (click X or wait for timeout)

## Examples

See `NotificationDemo.tsx` for interactive examples of all notification types. 