import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notifications, useNotifications } from "@/components/NotificationService";

export function NotificationDemo() {
  const { custom } = useNotifications();

  const handleSuccessTest = () => {
    notifications.success("This is a success message!");
  };

  const handleErrorTest = () => {
    notifications.error("This is an error message!");
  };

  const handleWarningTest = () => {
    notifications.warning("This is a warning message!");
  };

  const handleInfoTest = () => {
    notifications.info("This is an info message!");
  };

  const handleProjectCreatedTest = () => {
    notifications.projectCreated("My Awesome Project");
  };

  const handleNetworkErrorTest = () => {
    notifications.networkError();
  };

  const handleCustomTest = () => {
    custom({
      title: "Custom Notification",
      description: "This is a custom notification with an action button",
      action: (
        <Button variant="outline" size="sm" onClick={() => alert("Action clicked!")}>
          Action
        </Button>
      ),
    });
  };

  const handlePromiseTest = async () => {
    try {
      await notifications.promise(
        // Simulate an async operation
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.5) {
              resolve("Success!");
            } else {
              reject(new Error("Failed!"));
            }
          }, 2000);
        }),
        {
          loading: "Processing your request...",
          success: "Operation completed successfully!",
          error: "Operation failed. Please try again.",
        }
      );
    } catch {
      // Error is already handled by the promise wrapper
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Notification System Demo</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test different types of notifications available in the app.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="default" onClick={handleSuccessTest}>
            Success
          </Button>
          <Button variant="destructive" onClick={handleErrorTest}>
            Error
          </Button>
          <Button variant="outline" onClick={handleWarningTest}>
            Warning
          </Button>
          <Button variant="secondary" onClick={handleInfoTest}>
            Info
          </Button>
        </div>
        
        <div className="space-y-2">
          <Button variant="outline" onClick={handleProjectCreatedTest} className="w-full">
            Project Created (Contextual)
          </Button>
          <Button variant="outline" onClick={handleNetworkErrorTest} className="w-full">
            Network Error (Contextual)
          </Button>
          <Button variant="outline" onClick={handleCustomTest} className="w-full">
            Custom with Action
          </Button>
          <Button variant="outline" onClick={handlePromiseTest} className="w-full">
            Promise-based (Loading + Result)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
