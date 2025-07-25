import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { getProjectsSidebarSections } from "@/components/sidebars/ProjectsSidebar";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ProjectTask } from "@/apis/types";
import { TaskStats } from "./TaskStats";
import { TaskSearch } from "./TaskSearch";
import { TaskBoard } from "./TaskBoard";
import { useTaskManagement } from "./hooks/useTaskManagement";

export default function MyTasks() {
  const { user, apiClient } = useAuth() as any;
  const { 
    isLoadingTasks, 
    tasksError, 
    updateProjectTask
  } = useProjects();

  // State for user-specific tasks
  const [userTasks, setUserTasks] = useState<ProjectTask[]>([]);
  const [isLoadingUserTasks, setIsLoadingUserTasks] = useState(false);
  const [userTasksError, setUserTasksError] = useState<string | null>(null);

  // Fetch user-specific tasks - memoized to prevent infinite re-renders
  const fetchUserTasks = useCallback(async (userId: string) => {
    if (!userId) return;
    
    setIsLoadingUserTasks(true);
    setUserTasksError(null);
    
    try {
      // Use the correct endpoint for user assigned tasks
      const response = await apiClient.get(`/project-tasks/assignee/${userId}`);
      setUserTasks(response.data);
    } catch (error: any) {
      console.error('Failed to fetch user tasks:', error);
      setUserTasksError(error.response?.data?.message || 'Failed to fetch your tasks');
    } finally {
      setIsLoadingUserTasks(false);
    }
  }, [apiClient]);



  // Memoize the updateProjectTask function to prevent unnecessary re-renders
  const memoizedUpdateProjectTask = useCallback(updateProjectTask, [updateProjectTask]);

  const {
    searchTerm,
    activeTask,
    updatingTasks,
    taskColumns,
    taskStats,
    handleDragStart,
    handleDragEnd,
    handleSearchChange,
    handleClearSearch,
    isLoading,
    error
  } = useTaskManagement({
    userTasks,
    isLoadingUserTasks: isLoadingUserTasks || isLoadingTasks,
    userTasksError: userTasksError || tasksError,
    fetchUserTasks,
    user,
    updateProjectTask: memoizedUpdateProjectTask
  });

  // Generate sidebar sections with pending tasks count
  const sidebarSections = getProjectsSidebarSections({ 
    pendingTasksCount: taskStats.pending 
  });

  // Show loading state if actively loading OR if we haven't completed initial load
  if (isLoading) {
    return (
      <ExtensibleLayout moduleSidebar={sidebarSections} moduleTitle="Project Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your tasks...</p>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  if (error) {
    return (
      <ExtensibleLayout moduleSidebar={sidebarSections} moduleTitle="Project Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Failed to load tasks</h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">{error}</p>
            <Button 
              onClick={() => user?.id && fetchUserTasks(user.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={sidebarSections} moduleTitle="Project Management">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-2">
              Manage your personal tasks across all projects
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <TaskStats stats={taskStats} isLoading={isLoading} />

        {/* Filters and Search */}
        <TaskSearch 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          isLoading={isLoading}
        />

        {/* Tasks Kanban Board */}
        <TaskBoard
          taskColumns={taskColumns}
          updatingTasks={updatingTasks}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          activeTask={activeTask}
          isLoading={isLoading}
          userTasks={userTasks}
          searchTerm={searchTerm}
        />
      </div>
    </ExtensibleLayout>
  );
} 