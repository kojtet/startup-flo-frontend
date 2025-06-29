import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  CheckCircle,
  Loader2,
  Plus,
  X,
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Mail,
  Phone,
  Edit2,
  Save,
  Users2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/apis";
import type { Employee, Onboarding, OnboardingTask } from "@/apis/types";
import { useToast } from "@/hooks/use-toast";

// Helper type for UI - with completion tracking
interface OnboardingWithTaskList extends Omit<Onboarding, "checklist"> {
  checklist: OnboardingTask[];
  employee?: Employee;
}

export default function OnboardingView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { id } = router.query;
  
  const [onboarding, setOnboarding] = useState<OnboardingWithTaskList | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTasks, setEditingTasks] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Fetch onboarding data
  useEffect(() => {
    if (id) {
      fetchOnboarding();
    }
  }, [id]);

  const fetchOnboarding = async () => {
    try {
      setLoading(true);
      setNotFound(false);
      
      // Try to get onboarding data from localStorage first
      const storedOnboarding = localStorage.getItem('currentOnboarding');
      if (storedOnboarding) {
        const onboardingData = JSON.parse(storedOnboarding);
        
        // Normalize checklist data to ensure consistent structure
        if (onboardingData.checklist) {
          onboardingData.checklist = onboardingData.checklist.map((item: any) => {
            if (typeof item === 'string') {
              return { task: item, completed: false };
            } else if (item && typeof item === 'object') {
              return {
                task: item.task || item.description || 'Unnamed Task',
                completed: Boolean(item.completed)
              };
            } else {
              return { task: 'Invalid Task', completed: false };
            }
          });
        }
        
        setOnboarding(onboardingData);
        // Clear the stored data after using it
        localStorage.removeItem('currentOnboarding');
        return;
      }
      
      // Fallback: Try to find the onboarding from the list
      const [onboardingsData, employeesData] = await Promise.all([
        api.hr.getOnboardings(),
        api.hr.getEmployees()
      ]);
      
      // Find the specific onboarding
      const targetOnboarding = onboardingsData.find(o => o.id === id);
      if (!targetOnboarding) {
        setNotFound(true);
        return;
      }
      
      // Find the employee data
      const employee = employeesData.find(emp => emp.staff_id === targetOnboarding.employee_id);
      
      // Normalize checklist data
      const normalizedOnboarding = {
        ...targetOnboarding,
        employee,
        checklist: targetOnboarding.checklist?.map((item: any) => {
          if (typeof item === 'string') {
            return { task: item, completed: false };
          } else if (item && typeof item === 'object') {
            return {
              task: item.task || item.description || 'Unnamed Task',
              completed: Boolean(item.completed)
            };
          } else {
            return { task: 'Invalid Task', completed: false };
          }
        }) || []
      };
      
      setOnboarding(normalizedOnboarding);
    } catch (error) {
      console.error('Error fetching onboarding:', error);
      
      // Don't show "not found" for API errors, show error toast instead
      if (error instanceof Error && error.message === 'Onboarding not found') {
        setNotFound(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to load onboarding details. Please try again."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Mark onboarding as completed
  const markAsCompleted = async () => {
    if (!onboarding) return;
    
    try {
      setIsSubmitting(true);
      await api.hr.completeOnboarding(onboarding.id);

      setOnboarding(prev => prev ? {
        ...prev,
        status: 'completed',
        completed: true
      } : null);

      toast({
        title: "Onboarding completed!",
        description: "The onboarding process has been marked as completed."
      });
    } catch (error) {
      console.error('Error marking as completed:', error);
      toast({
        title: "Error",
        description: 'Failed to mark onboarding as completed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update task completion
  const updateTaskCompletion = async (taskIndex: number, completed: boolean) => {
    if (!onboarding) return;

    try {
      const updatedChecklist = onboarding.checklist.map((item, index) => {
        if (index === taskIndex) {
          // Ensure we maintain proper task object structure
          if (typeof item === 'string') {
            return { task: item, completed };
          } else if (item && typeof item === 'object') {
            return { 
              task: item.task || item.description || 'Unnamed Task', 
              completed 
            };
          } else {
            return { task: 'Invalid Task', completed };
          }
        }
        return item;
      });
      
      await api.hr.updateOnboardingChecklist(onboarding.id, {
        checklist: updatedChecklist
      });
      
      setOnboarding(prev => prev ? {
        ...prev,
        checklist: updatedChecklist
      } : null);
    } catch (error) {
      console.error('Error updating task completion:', error);
      toast({
        title: "Error",
        description: 'Failed to update task. Please try again.'
      });
    }
  };

  // Add new task
  const addTask = async (task: string) => {
    if (!onboarding || !task.trim()) return;

    try {
      // Ensure all existing tasks maintain proper structure when adding new task
      const normalizedExistingTasks = onboarding.checklist.map((item: any) => {
        if (typeof item === 'string') {
          return { task: item, completed: false };
        } else if (item && typeof item === 'object') {
          return {
            task: item.task || item.description || 'Unnamed Task',
            completed: Boolean(item.completed)
          };
        } else {
          return { task: 'Invalid Task', completed: false };
        }
      });

      const updatedChecklist = [...normalizedExistingTasks, { task: task.trim(), completed: false }];
      
      await api.hr.updateOnboardingChecklist(onboarding.id, {
        checklist: updatedChecklist
      });
      
      setOnboarding(prev => prev ? {
        ...prev,
        checklist: updatedChecklist
      } : null);
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: 'Failed to add task. Please try again.'
      });
    }
  };

  // Calculate progress
  const calculateProgress = (checklist: OnboardingTask[]) => {
    if (checklist.length === 0) return 0;
    const completed = checklist.filter(task => task.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'paused':
        return 'Paused';
      default:
        return status;
    }
  };

  const userForLayout = {
    name: user ? (`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email) : 'Guest',
    email: user?.email || 'guest@example.com',
    role: user?.role || 'User',
    avatarUrl: user?.avatar_url || undefined
  };

  if (loading) {
    return (
      <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={userForLayout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ExtensibleLayout>
    );
  }

  if (notFound || !onboarding) {
    return (
      <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={userForLayout}>
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Users2 className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Onboarding Not Found</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The onboarding process you're looking for doesn't exist or may have been removed. 
            Please check the onboarding ID and try again.
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => router.push('/hr/onboarding')} variant="default">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Onboarding List
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              <Loader2 className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  const progress = calculateProgress(onboarding.checklist);

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={userForLayout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/hr/onboarding')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Onboarding List
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {onboarding.employee?.first_name} {onboarding.employee?.last_name} - Onboarding
            </h1>
            <p className="text-gray-600 mt-2">
              Started {new Date(onboarding.start_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(onboarding.status)}>
              {getStatusDisplayName(onboarding.status)}
            </Badge>
            {onboarding.status !== 'completed' && (
              <Button
                onClick={markAsCompleted}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mark Complete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg font-semibold">
                    {onboarding.employee?.first_name} {onboarding.employee?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Staff ID</p>
                  <p>{onboarding.employee?.staff_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p>{onboarding.employee?.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p>{onboarding.employee?.departments?.name || 'No Department'}</p>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-gray-400" />
                  <p>{onboarding.employee?.email}</p>
                </div>
                {onboarding.employee?.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    <p>{onboarding.employee.phone}</p>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <p>Hired: {new Date(onboarding.employee?.date_hired || '').toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress and Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{onboarding.checklist.filter(t => t.completed).length} of {onboarding.checklist.length} tasks completed</span>
                    <span>{onboarding.checklist.length - onboarding.checklist.filter(t => t.completed).length} remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Onboarding Tasks</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTasks(!editingTasks)}
                  >
                    {editingTasks ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Tasks
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {onboarding.checklist.map((task, index) => {
                    // Normalize task data to ensure it's an object with task and completed properties
                    let taskData;
                    if (typeof task === 'string') {
                      taskData = { task: task, completed: false };
                    } else if (task && typeof task === 'object') {
                      taskData = {
                        task: task.task || task.description || 'Unnamed Task',
                        completed: Boolean(task.completed)
                      };
                    } else {
                      taskData = { task: 'Invalid Task', completed: false };
                    }
                    
                    return (
                      <div 
                        key={index} 
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={taskData.completed}
                          onCheckedChange={(checked) => updateTaskCompletion(index, Boolean(checked))}
                        />
                        <span className={`text-sm flex-1 ${taskData.completed ? 'line-through text-gray-500' : ''}`}>
                          {taskData.task}
                        </span>
                        {taskData.completed && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    );
                  })}
                  
                  {onboarding.checklist.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No tasks added yet.
                    </div>
                  )}

                  {editingTasks && (
                    <div className="flex space-x-2 pt-3 border-t">
                      <Input
                        placeholder="Add new task..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const task = (e.target as HTMLInputElement).value.trim();
                            if (task) {
                              addTask(task);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add new task..."]') as HTMLInputElement;
                          const task = input?.value.trim();
                          if (task) {
                            addTask(task);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ExtensibleLayout>
  );
} 