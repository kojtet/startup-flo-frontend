import { useState, useEffect, useMemo } from "react";
import { ProjectTask } from "@/apis/types";
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { notifications } from "@/components/NotificationService";

// Status mapping for API calls
const statusMapping: Record<string, string> = {
  "To Do": "todo",
  "In Progress": "in-progress", 
  "Review": "review",
  "Done": "done"
};

interface UseTaskManagementProps {
  userTasks: ProjectTask[];
  isLoadingUserTasks: boolean;
  userTasksError: string | null;
  fetchUserTasks: (userId: string) => Promise<void>;
  user: any;
  updateProjectTask: (taskId: string, taskData: any) => Promise<any>;
}

export const useTaskManagement = ({
  userTasks,
  isLoadingUserTasks,
  userTasksError,
  fetchUserTasks,
  user,
  updateProjectTask
}: UseTaskManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, string>>(new Map());
  const [confirmedUpdates, setConfirmedUpdates] = useState<Map<string, string>>(new Map());
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Fetch user tasks when component mounts and user is available
  useEffect(() => {
    if (user?.id) {
      setHasInitiallyLoaded(false);
      fetchUserTasks(user.id).finally(() => {
        setHasInitiallyLoaded(true);
      });
    } else {
      setHasInitiallyLoaded(false);
    }
  }, [user?.id, fetchUserTasks]);

  // Clear updates when fresh data is loaded from server
  useEffect(() => {
    if (userTasks.length > 0) {
      // Clear any updates that match the fresh server data
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        for (const task of userTasks) {
          if (newMap.has(task.id) && newMap.get(task.id) === task.status) {
            newMap.delete(task.id);
          }
        }
        return newMap;
      });
      
      setConfirmedUpdates(prev => {
        const newMap = new Map(prev);
        for (const task of userTasks) {
          if (newMap.has(task.id) && newMap.get(task.id) === task.status) {
            newMap.delete(task.id);
          }
        }
        return newMap;
      });
    }
  }, [userTasks]);

  // Group tasks by status (with optimistic updates)
  const taskColumns = useMemo(() => {
    const filteredTasks = userTasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply optimistic and confirmed updates
    const tasksWithUpdates = filteredTasks.map(task => ({
      ...task,
      status: (
        optimisticUpdates.get(task.id) || 
        confirmedUpdates.get(task.id) || 
        task.status
      ) as ProjectTask['status']
    }));

    const todoTasks = tasksWithUpdates.filter(task => task.status === "todo");
    const inProgressTasks = tasksWithUpdates.filter(task => task.status === "in-progress");
    const reviewTasks = tasksWithUpdates.filter(task => task.status === "review");
    const doneTasks = tasksWithUpdates.filter(task => task.status === "done");

    return [
      {
        title: "To Do",
        count: todoTasks.length,
        color: "",
        headerColor: "",
        tasks: todoTasks,
        status: "todo"
      },
      {
        title: "In Progress",
        count: inProgressTasks.length,
        color: "",
        headerColor: "",
        tasks: inProgressTasks,
        status: "in-progress"
      },
      {
        title: "Review",
        count: reviewTasks.length,
        color: "",
        headerColor: "",
        tasks: reviewTasks,
        status: "review"
      },
      {
        title: "Done",
        count: doneTasks.length,
        color: "",
        headerColor: "",
        tasks: doneTasks,
        status: "done"
      }
    ];
  }, [userTasks, searchTerm, optimisticUpdates, confirmedUpdates]);

  // Calculate summary statistics (with all updates)
  const taskStats = useMemo(() => {
    // Apply optimistic and confirmed updates to tasks for statistics
    const tasksWithAllUpdates = userTasks.map(task => ({
      ...task,
      status: (
        optimisticUpdates.get(task.id) || 
        confirmedUpdates.get(task.id) || 
        task.status
      ) as ProjectTask['status']
    }));

    const totalTasks = tasksWithAllUpdates.length;
    const inProgressCount = tasksWithAllUpdates.filter(task => task.status === "in-progress").length;
    const completedTasks = tasksWithAllUpdates.filter(task => task.status === "done");
    const overdueTasks = tasksWithAllUpdates.filter(task => 
      task.due_date && new Date(task.due_date) < new Date() && task.status !== "done"
    );
    
    // Calculate pending tasks (not completed)
    const pendingTasks = tasksWithAllUpdates.filter(task => task.status !== "done");

    return {
      total: totalTasks,
      inProgress: inProgressCount,
      overdue: overdueTasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length
    };
  }, [userTasks, optimisticUpdates, confirmedUpdates]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = userTasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  // Handle drag end with optimistic updates
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    // Find the task being moved
    const task = userTasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    // Don't update if status hasn't changed
    const currentStatus = optimisticUpdates.get(taskId) || confirmedUpdates.get(taskId) || task.status;
    if (currentStatus === newStatus) {
      console.log('Status unchanged, skipping update');
      return;
    }

    console.log('Updating task:', {
      taskId,
      oldStatus: currentStatus,
      newStatus,
      taskTitle: task.title
    });

    // Apply optimistic update immediately for smooth UX
    setOptimisticUpdates(prev => new Map(prev).set(taskId, newStatus));
    setUpdatingTasks(prev => new Set(prev).add(taskId));

    try {
      // Update task status via API using the updateProjectTask function
      const requestData = { status: newStatus };
      console.log('Sending update request for task:', taskId, 'with data:', requestData);
      
      await updateProjectTask(taskId, requestData);
      console.log('Task update successful');

      // Show success notification with improved formatting
      const displayStatus = newStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      notifications.success(
        `✅ Task "${task.title}" moved to ${displayStatus}`, 
        { duration: 3000 }
      );

      // Move from optimistic to confirmed update - no page refresh needed
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
      
      setConfirmedUpdates(prev => {
        const newMap = new Map(prev);
        newMap.set(taskId, newStatus);
        return newMap;
      });

    } catch (error: any) {
      console.error('Error updating task status:', error);
      
      // Rollback optimistic update on error
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
      
      // Extract more specific error information
      let errorMessage = 'Failed to update task status. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = `Failed to update task: ${error.response.data.error}`;
      } else if (error.response?.status) {
        errorMessage = `Server error (${error.response.status}): ${error.response.statusText || 'Unknown error'}`;
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      }
      
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      notifications.error(errorMessage);
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return {
    searchTerm,
    activeTask,
    updatingTasks,
    hasInitiallyLoaded,
    taskColumns,
    taskStats,
    handleDragStart,
    handleDragEnd,
    handleSearchChange,
    handleClearSearch,
    isLoading: isLoadingUserTasks,
    error: userTasksError
  };
}; 