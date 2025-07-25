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
import type { Employee, OnboardingTask } from "@/apis";
import { useToast } from "@/hooks/use-toast";

// Interface matching the actual API response
interface OnboardingResponse {
  id: string;
  completed: boolean;
  start_date: string;
  end_date: string | null;
  checklist: string[];
  notes: string | null;
  created_at: string;
  employee_id: string;
  status: "in_progress" | "completed" | "paused";
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    position: string;
    staff_id: string;
  };
}

// Helper type for UI - with completion tracking
interface OnboardingWithTaskList {
  id: string;
  completed: boolean;
  start_date: string;
  end_date: string | null;
  checklist: OnboardingTask[];
  notes: string | null;
  created_at: string;
  employee_id: string;
  status: "in_progress" | "completed" | "paused";
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    position: string;
    staff_id: string;
  };
}

export default function OnboardingView() {
  const { user, apiClient, isHydrated, isAuthenticated } = useAuth() as any; // Get the authenticated apiClient
  const { toast } = useToast();
  const router = useRouter();
  const { id } = router.query;
  
  const [onboarding, setOnboarding] = useState<OnboardingWithTaskList | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTasks, setEditingTasks] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch onboarding data
  useEffect(() => {
    // Only fetch when auth is hydrated and user is authenticated
    if (id && isHydrated && isAuthenticated && user?.company_id) {
      fetchOnboarding();
    } else if (isHydrated && !isAuthenticated) {
      // User is not authenticated, show error
      setError('Authentication required. Please log in to access this page.');
      setLoading(false);
    } else if (isHydrated && isAuthenticated && !user?.company_id) {
      // User is authenticated but missing company_id
      setError('User profile incomplete. Please contact support.');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isHydrated, isAuthenticated, user?.company_id]);

  const fetchOnboarding = async () => {
    try {
      setLoading(true);
      setNotFound(false);
      setError(null);
      
      console.log('Fetching onboarding with ID:', id);
      console.log('User:', user);
      console.log('User company_id:', user?.company_id);
      
      // Fetch onboarding by ID - employee data is included in response
      const response = await apiClient.get(`/hr/onboarding/${id}`);
      console.log('Onboarding response:', response.data);
      
      const onboardingData: OnboardingResponse = response.data;
      
      // Convert checklist from string array to OnboardingTask array
      const normalizedChecklist: OnboardingTask[] = onboardingData.checklist.map(task => ({
        task,
        completed: false // Since the API doesn't return completion status, we assume all are incomplete
      }));
      
      setOnboarding({
        ...onboardingData,
        checklist: normalizedChecklist
      });
    } catch (err: any) {
      console.error('Error fetching onboarding:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load onboarding details. Please try again.';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage
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
      await apiClient.put(`/hr/onboarding/${onboarding.id}`, { status: 'completed' });
      setOnboarding(prev => prev ? { ...prev, status: 'completed' } : null);
      toast({
        title: "Onboarding completed!",
        description: "The onboarding process has been marked as completed."
      });
    } catch (error) {
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
      const updatedChecklist = onboarding.checklist.map((item, index) =>
        index === taskIndex ? { ...item, completed } : item
      );
      await apiClient.put(`/hr/onboarding/${onboarding.id}`, { checklist: updatedChecklist });
      setOnboarding(prev => prev ? { ...prev, checklist: updatedChecklist } : null);
    } catch (error) {
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
      const updatedChecklist = [...onboarding.checklist, { task: task.trim(), completed: false }];
      await apiClient.put(`/hr/onboarding/${onboarding.id}`, { checklist: updatedChecklist });
      setOnboarding(prev => prev ? { ...prev, checklist: updatedChecklist } : null);
    } catch (error) {
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

  if (loading) {
    return (
      <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ExtensibleLayout>
    );
  }

  // Show authentication error
  if (error && (error.includes('Authentication required') || error.includes('User profile incomplete'))) {
    return (
      <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <User className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {error}
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => router.push('/auth/login')} variant="default">
              Log In
            </Button>
            <Button onClick={() => router.push('/hr/onboarding')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Onboarding List
            </Button>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  if (notFound || !onboarding) {
    return (
      <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources">
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
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources">
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
              {onboarding.employee.first_name} {onboarding.employee.last_name} - Onboarding
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
                    {onboarding.employee.first_name} {onboarding.employee.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Staff ID</p>
                  <p>{onboarding.employee.staff_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p>{onboarding.employee.position}</p>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-gray-400" />
                  <p>{onboarding.employee.email}</p>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <p>Started: {new Date(onboarding.start_date).toLocaleDateString()}</p>
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
                  {onboarding.checklist.map((task, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => updateTaskCompletion(index, Boolean(checked))}
                      />
                      <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.task}
                      </span>
                      {task.completed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  ))}
                  
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