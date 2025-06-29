import { toast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationService {
  private getIcon(type: NotificationType) {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Info;
    }
  }

  private getVariant(type: NotificationType) {
    switch (type) {
      case 'error':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  }

  private show(type: NotificationType, message: string, options: NotificationOptions = {}) {
    const Icon = this.getIcon(type);
    
    return toast({
      title: options.title,
      description: message,
      variant: this.getVariant(type),
      duration: options.duration || 5000,
      action: options.action ? (
        <button
          onClick={options.action.onClick}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {options.action.label}
        </button>
      ) : undefined,
    });
  }

  success(message: string, options?: NotificationOptions) {
    return this.show('success', message, {
      title: options?.title || 'Success',
      ...options
    });
  }

  error(message: string, options?: NotificationOptions) {
    return this.show('error', message, {
      title: options?.title || 'Error',
      duration: options?.duration || 8000, // Longer duration for errors
      ...options
    });
  }

  warning(message: string, options?: NotificationOptions) {
    return this.show('warning', message, {
      title: options?.title || 'Warning',
      ...options
    });
  }

  info(message: string, options?: NotificationOptions) {
    return this.show('info', message, {
      title: options?.title || 'Information',
      ...options
    });
  }

  // Convenience methods for common use cases
  projectCreated(projectName?: string) {
    return this.success(
      projectName ? `Project "${projectName}" has been created successfully.` : 'Project created successfully.'
    );
  }

  projectUpdated(projectName?: string) {
    return this.success(
      projectName ? `Project "${projectName}" has been updated.` : 'Project updated successfully.'
    );
  }

  projectDeleted(projectName?: string) {
    return this.success(
      projectName ? `Project "${projectName}" has been deleted.` : 'Project deleted successfully.'
    );
  }

  saveSuccess(itemType?: string) {
    return this.success(`${itemType || 'Item'} saved successfully.`);
  }

  deleteSuccess(itemType?: string) {
    return this.success(`${itemType || 'Item'} deleted successfully.`);
  }

  networkError() {
    return this.error('Network error. Please check your connection and try again.');
  }

  validationError(message?: string) {
    return this.error(message || 'Please check your input and try again.');
  }

  permissionDenied() {
    return this.error('You do not have permission to perform this action.');
  }

  // Promise-based notifications for async operations
  async promise<T>(
    promise: Promise<T>,
    {
      loading = 'Loading...',
      success = 'Operation completed successfully.',
      error = 'Operation failed. Please try again.'
    }: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: any) => string);
    } = {}
  ): Promise<T> {
    // Show loading notification
    const loadingToast = this.info(loading, { duration: Infinity });

    try {
      const result = await promise;
      
      // Dismiss loading and show success
      loadingToast.dismiss();
      const successMessage = typeof success === 'function' ? success(result) : success;
      this.success(successMessage);
      
      return result;
    } catch (err) {
      // Dismiss loading and show error
      loadingToast.dismiss();
      const errorMessage = typeof error === 'function' ? error(err) : error;
      this.error(errorMessage);
      
      throw err;
    }
  }
}

// Export a singleton instance
export const notifications = new NotificationService();

// Export the class for custom instances if needed
export { NotificationService };

// Hook for using notifications in React components
import { useToast } from "@/hooks/use-toast";

export function useNotifications() {
  const { toast: toastFn, dismiss } = useToast();
  
  return {
    ...notifications,
    dismiss,
    // Direct access to toast function for custom notifications
    custom: toastFn
  };
} 