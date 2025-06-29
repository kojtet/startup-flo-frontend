import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { getProjectsSidebarSections } from "@/components/sidebars/ProjectsSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Calendar,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Flag,
  Edit3,
  Trash2,
  Plus,
  PlayCircle,
  PauseCircle,
  MoreHorizontal,
  Zap,
  FolderOpen,
  ListTodo,
  Activity,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/apis";
import { notifications } from "@/components/NotificationService";
import type { Project, User as AppUser, ProjectSprint } from "@/apis/types";

interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  owner_id: string;
  due_date: string;
  sprint_id: string | null;
  parent_task_id: string | null;
  created_at: string;
}

interface ProjectMilestone {
  id: string;
  project_id: string;
  name: string;
  description: string;
  requirements: string;
  expected_date: string;
  completed_date: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  progress: number;
  priority: string;
  owner_id: string;
  created_by: string | null;
  updated_by: string | null;
  tags: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
}

interface SprintWithTasks extends ProjectSprint {
  tasks: ProjectTask[];
  taskCount: number;
  completedTasks: number;
  progress: number;
}

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, companyId } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [sprints, setSprints] = useState<ProjectSprint[]>([]);
  const [sprintsWithTasks, setSprintsWithTasks] = useState<SprintWithTasks[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ProjectTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false);
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [isCreateMilestoneModalOpen, setIsCreateMilestoneModalOpen] = useState(false);
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [selectedSprintForTask, setSelectedSprintForTask] = useState<string | null>(null);
  const [parentTaskForSubtask, setParentTaskForSubtask] = useState<ProjectTask | null>(null);
  
  // Sprint creation form
  const [sprintForm, setSprintForm] = useState({
    name: '',
    goal: '',
    start_date: '',
    end_date: ''
  });

  // Milestone creation form
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    requirements: '',
    expected_date: '',
    priority: 'medium',
    status: 'planning'
  });

  // Task creation form
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    sprint_id: 'backlog',
    assignee_id: 'unassigned'
  });

  // Expandable sprints
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set());

  // Active tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Create a user object compatible with ExtensibleLayout
  const layoutUser = user ? {
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
    email: user.email,
    role: user.role || 'User',
    avatarUrl: user.avatar_url || undefined
  } : null;

  // Date utility functions
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const isValidDate = (dateString: string | null | undefined) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!id || !companyId) return;
    
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project details, tasks, milestones, sprints and users in parallel
        const [projectRes, tasksRes, milestonesRes, sprintsRes, usersRes] = await Promise.all([
          apiClient.get(`/projects/${id}`),
          apiClient.get(`/project-tasks/project/${id}`),
          apiClient.get(`/project-deliverables/project/${id}`),
          apiClient.get(`/project-sprints/project/${id}`),
          apiClient.get(`/users/company/${companyId}`)
        ]);

        setProject(projectRes.data as Project);
        const allTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
        setTasks(allTasks);
        setMilestones(Array.isArray(milestonesRes.data) ? milestonesRes.data : []);
        const allSprints = Array.isArray(sprintsRes.data) ? sprintsRes.data : [];
        setSprints(allSprints);
        setUsers(Array.isArray((usersRes.data as any)?.data) ? (usersRes.data as any).data : []);

        // Process sprints with their tasks
        const sprintsWithTasksData = await Promise.all(
          allSprints.map(async (sprint) => {
            const sprintTasks = allTasks.filter((task: ProjectTask) => task.sprint_id === sprint.id);
            const completedTasks = sprintTasks.filter(task => task.status === 'done' || task.status === 'completed').length;
            const progress = sprintTasks.length > 0 ? Math.round((completedTasks / sprintTasks.length) * 100) : 0;
            
            return {
              ...sprint,
              tasks: sprintTasks,
              taskCount: sprintTasks.length,
              completedTasks,
              progress
            };
          })
        );
        
        setSprintsWithTasks(sprintsWithTasksData);

      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project details. Please try again.');
        notifications.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, companyId]);

  // Memoized data calculations
  const projectStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const activeSprints = sprintsWithTasks.filter(s => {
      if (!isValidDate(s.start_date) || !isValidDate(s.end_date)) return false;
      const now = new Date();
      const startDate = new Date(s.start_date);
      const endDate = new Date(s.end_date);
      return startDate <= now && now <= endDate;
    }).length;
    
    const backlogTasks = tasks.filter(t => !t.sprint_id);
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      completedMilestones,
      activeSprints,
      backlogCount: backlogTasks.length,
      overallProgress,
      totalSprints: sprints.length,
      totalMilestones: milestones.length
    };
  }, [tasks, milestones, sprints, sprintsWithTasks]);

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };

  const handleCreateSprint = async () => {
    if (!project || !user) return;
    
    try {
      setIsCreatingSprint(true);
      
      const sprintData = {
        project_id: project.id,
        name: sprintForm.name,
        goal: sprintForm.goal,
        start_date: sprintForm.start_date,
        end_date: sprintForm.end_date,
        owner_id: user.id
      };
      
      const response = await apiClient.post('/project-sprints', sprintData);
      const newSprint = response.data;
      
      // Add to sprints list
      setSprints(prev => [...prev, newSprint]);
      setSprintsWithTasks(prev => [...prev, {
        ...newSprint,
        tasks: [],
        taskCount: 0,
        completedTasks: 0,
        progress: 0
      }]);
      
      // Reset form and close modal
      setSprintForm({
        name: '',
        goal: '',
        start_date: '',
        end_date: ''
      });
      setIsCreateSprintModalOpen(false);
      
      notifications.success(`Sprint "${newSprint.name}" created successfully!`);
      
    } catch (error: any) {
      console.error('Error creating sprint:', error);
      notifications.error('Failed to create sprint. Please try again.');
    } finally {
      setIsCreatingSprint(false);
    }
  };

  const handleCreateMilestone = async () => {
    if (!project || !user) return;
    
    // Validate required fields
    if (!milestoneForm.name.trim()) {
      notifications.error('Milestone name is required.');
      return;
    }
    
    if (!milestoneForm.expected_date) {
      notifications.error('Expected date is required.');
      return;
    }
    
    if (!project.id) {
      notifications.error('Project ID is missing. Please refresh the page and try again.');
      return;
    }
    
    if (!user.id) {
      notifications.error('User ID is missing. Please log out and log back in.');
      return;
    }
    
    // Validate that expected date is within project timeline
    const expectedDate = new Date(milestoneForm.expected_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
    
    // Get project start and end dates
    const projectStartDate = project.start_date || project.startDate;
    const projectEndDate = (project as any).expected_end || project.end_date || project.endDate;
    
    if (isNaN(expectedDate.getTime())) {
      notifications.error('Please enter a valid expected date.');
      return;
    }
    
    if (expectedDate < today) {
      notifications.error('Expected date must be today or in the future.');
      return;
    }
    
    if (projectStartDate && expectedDate < new Date(projectStartDate)) {
      notifications.error('Milestone date must be after the project start date.');
      return;
    }
    
    if (projectEndDate && expectedDate > new Date(projectEndDate)) {
      notifications.error('Milestone date must be before the project end date.');
      return;
    }
    
    try {
      setIsCreatingMilestone(true);
      
            // Build milestone data exactly matching the API example format
      const milestoneData = {
        project_id: project.id,
        name: milestoneForm.name.trim(),
        description: milestoneForm.description?.trim() || "",
        expected_date: milestoneForm.expected_date,
        priority: milestoneForm.priority,
        status: milestoneForm.status,
        owner_id: user.id,
        progress: 0,
        requirements: milestoneForm.requirements?.trim() || ""
      };
      
      console.log('Creating milestone with data:', milestoneData);
      console.log('JSON payload:', JSON.stringify(milestoneData, null, 2));
      console.log('API endpoint:', '/project-deliverables');
      
      const response = await apiClient.post('/project-deliverables', milestoneData);
      const newMilestone = response.data;
      
      // Add to milestones list
      setMilestones(prev => [...prev, newMilestone]);
      
      // Reset form and close modal
      setMilestoneForm({
        name: '',
        description: '',
        requirements: '',
        expected_date: '',
        priority: 'medium',
        status: 'planning'
      });
      setIsCreateMilestoneModalOpen(false);
      
      notifications.success(`Milestone "${newMilestone.name}" created successfully!`);
      
    } catch (error: any) {
      console.error('Error creating milestone:', error);
      console.error('Full error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      
      let errorMessage = 'Failed to create milestone. Please try again.';
      
      if (error.response?.data?.error) {
        const serverError = error.response.data.error;
        if (serverError.includes('expected_date') || serverError.includes('future')) {
          errorMessage = 'Expected date must be today or in the future.';
        } else if (serverError.includes('project_deliverables_project_id_fkey')) {
          errorMessage = 'Invalid project ID. Please refresh the page and try again.';
        } else if (serverError.includes('owner_id') || serverError.includes('users')) {
          errorMessage = 'Invalid user ID. Please log out and log back in.';
        } else if (serverError.includes('name') && serverError.includes('empty')) {
          errorMessage = 'Milestone name cannot be empty.';
        } else if (serverError.includes('status')) {
          errorMessage = 'Invalid status value. Please try again.';
        } else if (serverError.includes('priority')) {
          errorMessage = 'Invalid priority value. Please try again.';
        } else {
          errorMessage = `Server error: ${serverError}`;
        }
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please check that all fields are valid and within the project timeline.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please log out and log back in.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to create milestones for this project.';
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      }
      
      notifications.error(errorMessage);
    } finally {
      setIsCreatingMilestone(false);
    }
  };

  const handleCreateTask = async () => {
    if (!project || !user) return;
    
    try {
      setIsCreatingTask(true);
      
      // Build task data using the same format as projects.tsx (which works)
      const sprintId = (selectedSprintForTask === 'backlog' || taskForm.sprint_id === 'backlog') ? null : (selectedSprintForTask || taskForm.sprint_id || null);
      const assigneeId = taskForm.assignee_id === 'unassigned' ? null : (taskForm.assignee_id || null);
      
      const taskData = {
        project_id: project.id,
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        status: taskForm.status,
        owner_id: assigneeId, // This is the assignee, not the creator
        due_date: taskForm.due_date || null,
        sprint_id: sprintId,
        parent_task_id: parentTaskForSubtask?.id || null
      };
      
      console.log('Creating task with data:', taskData);
      
      const response = await apiClient.post('/project-tasks', taskData);
      const newTask = response.data;
      
      // Add to tasks list
      setTasks(prev => [...prev, newTask]);
      
      // Update sprints with tasks if task is assigned to a sprint
      if (newTask.sprint_id) {
        setSprintsWithTasks(prev => 
          prev.map(sprint => {
            if (sprint.id === newTask.sprint_id) {
              const updatedTasks = [...sprint.tasks, newTask];
              const completedTasks = updatedTasks.filter(t => t.status === 'done' || t.status === 'completed').length;
              const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
              
              return {
                ...sprint,
                tasks: updatedTasks,
                taskCount: updatedTasks.length,
                completedTasks,
                progress
              };
            }
            return sprint;
          })
        );
      }
      
      // Reset form and close modal
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        due_date: '',
        sprint_id: 'backlog',
        assignee_id: 'unassigned'
      });
      setSelectedSprintForTask(null);
      setParentTaskForSubtask(null);
      setIsCreateTaskModalOpen(false);
      
      const taskType = parentTaskForSubtask ? 'Subtask' : 'Task';
      notifications.success(`${taskType} "${newTask.title}" created successfully!`);
      
    } catch (error: any) {
      console.error('Error creating task:', error);
      
      let errorMessage = 'Failed to create task. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = `Failed to create task: ${error.response.data.error}`;
      } else if (error instanceof Error) {
        errorMessage = `Failed to create task: ${error.message}`;
      }
      
      notifications.error(errorMessage);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleAddTaskToSprint = (sprintId: string) => {
    setSelectedSprintForTask(sprintId);
    setParentTaskForSubtask(null);
    setTaskForm(prev => ({ ...prev, sprint_id: sprintId }));
    setIsCreateTaskModalOpen(true);
  };

  const handleAddSubtask = (parentTask: ProjectTask) => {
    setParentTaskForSubtask(parentTask);
    setSelectedSprintForTask(parentTask.sprint_id || 'backlog');
    setTaskForm(prev => ({ ...prev, sprint_id: parentTask.sprint_id || 'backlog' }));
    setIsCreateTaskModalOpen(true);
  };

  const handleAddTaskToBacklog = () => {
    setSelectedSprintForTask('backlog');
    setParentTaskForSubtask(null);
    setTaskForm(prev => ({ ...prev, sprint_id: 'backlog' }));
    setIsCreateTaskModalOpen(true);
  };

  const handleMoveTaskToSprint = async (taskId: string, sprintId: string) => {
    try {
      const response = await apiClient.put(`/project-tasks/${taskId}`, { sprint_id: sprintId });
      const updatedTask = response.data;
      
      // Update tasks list
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, sprint_id: sprintId } : task
        )
      );
      
      // Update sprints with tasks
      setSprintsWithTasks(prev => 
        prev.map(sprint => {
          if (sprint.id === sprintId) {
            const updatedTasks = [...sprint.tasks, updatedTask];
            const completedTasks = updatedTasks.filter(t => t.status === 'done' || t.status === 'completed').length;
            const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
            
            return {
              ...sprint,
              tasks: updatedTasks,
              taskCount: updatedTasks.length,
              completedTasks,
              progress
            };
          }
          // Remove task from other sprints if it was previously assigned
          return {
            ...sprint,
            tasks: sprint.tasks.filter(t => t.id !== taskId),
            taskCount: sprint.tasks.filter(t => t.id !== taskId).length,
            completedTasks: sprint.tasks.filter(t => t.id !== taskId && (t.status === 'done' || t.status === 'completed')).length,
            progress: sprint.tasks.filter(t => t.id !== taskId).length > 0 ? 
              Math.round((sprint.tasks.filter(t => t.id !== taskId && (t.status === 'done' || t.status === 'completed')).length / sprint.tasks.filter(t => t.id !== taskId).length) * 100) : 0
          };
        })
      );
      
      const sprintName = sprints.find(s => s.id === sprintId)?.name || 'Sprint';
      notifications.success(`Task moved to ${sprintName} successfully!`);
      
    } catch (error: any) {
      console.error('Error moving task to sprint:', error);
      notifications.error('Failed to move task to sprint. Please try again.');
    }
  };

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setIsDeleting(true);
      
      await apiClient.delete(`/project-tasks/${taskToDelete.id}`);
      notifications.success(`Task "${taskToDelete.title}" deleted successfully!`);
      
      // Remove task from local state
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
      
      // Update sprints with tasks
      setSprintsWithTasks(prev => prev.map(sprint => ({
        ...sprint,
        tasks: sprint.tasks.filter(task => task.id !== taskToDelete.id),
        taskCount: sprint.tasks.filter(task => task.id !== taskToDelete.id).length,
        completedTasks: sprint.tasks.filter(task => 
          task.id !== taskToDelete.id && (task.status === 'done' || task.status === 'completed')
        ).length
      })));
      
      setIsDeleteTaskModalOpen(false);
      setTaskToDelete(null);
      
    } catch (error: unknown) {
      console.error('Error deleting task:', error);
      notifications.error('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSprintExpansion = (sprintId: string) => {
    setExpandedSprints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sprintId)) {
        newSet.delete(sprintId);
      } else {
        newSet.add(sprintId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'todo':
      case 'planning':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'review':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'on_hold':
      case 'blocked':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ExtensibleLayout moduleSidebar={getProjectsSidebarSections()} moduleTitle="Project Management" user={layoutUser}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <span>Loading project details...</span>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  if (error || !project) {
    return (
      <ExtensibleLayout moduleSidebar={getProjectsSidebarSections()} moduleTitle="Project Management" user={layoutUser}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error || 'Project not found'}</p>
            <Button onClick={() => router.back()} variant="outline" className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={getProjectsSidebarSections()} moduleTitle="Project Management" user={layoutUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        {/* Project Overview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{project.name}</CardTitle>
                <p className="text-gray-600 mt-2">{project.description}</p>
              </div>
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(project.start_date || project.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{formatDate((project as any).expected_end || project.end_date || project.endDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Team Lead</p>
                  <p className="font-medium">{
                    ((project as any).team_lead || project.owner_id) ? 
                    getUserName((project as any).team_lead || project.owner_id) : 
                    'Not assigned'
                  }</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Progress</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={projectStats.overallProgress} className="w-16 h-2" />
                    <span className="text-sm font-medium">{projectStats.overallProgress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Sprints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.totalSprints}</div>
              <p className="text-sm text-gray-600">{projectStats.activeSprints} active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <ListTodo className="h-4 w-4 mr-2" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.totalTasks}</div>
              <p className="text-sm text-gray-600">{projectStats.completedTasks} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <FolderOpen className="h-4 w-4 mr-2" />
                Backlog
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.backlogCount}</div>
              <p className="text-sm text-gray-600">Unassigned tasks</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Flag className="h-4 w-4 mr-2" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.totalMilestones}</div>
              <p className="text-sm text-gray-600">{projectStats.completedMilestones} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.team_ids?.length || 0}</div>
              <p className="text-sm text-gray-600">Members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Time Left
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(() => {
                  const dueDate = (project as any).expected_end || project.end_date || project.endDate;
                  return isValidDate(dueDate) ? Math.max(0, Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : '∞';
                })()}
              </div>
              <p className="text-sm text-gray-600">Days remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* Project Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sprints">Sprints ({projectStats.totalSprints})</TabsTrigger>
              <TabsTrigger value="backlog">Backlog ({projectStats.backlogCount})</TabsTrigger>
              <TabsTrigger value="milestones">Milestones ({projectStats.totalMilestones})</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              {activeTab === "sprints" && (
                <Button onClick={() => setIsCreateSprintModalOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Sprint
                </Button>
              )}
              {activeTab === "backlog" && (
                <Button onClick={handleAddTaskToBacklog} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              )}
              {activeTab === "milestones" && (
                <Button onClick={() => setIsCreateMilestoneModalOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Milestone
                </Button>
              )}
            </div>
          </div>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sprint Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Sprint Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sprintsWithTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No sprints created yet</p>
                      <Button onClick={() => setIsCreateSprintModalOpen(true)} size="sm" className="mt-2">
                        Create First Sprint
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sprintsWithTasks.slice(0, 3).map((sprint) => (
                        <div key={sprint.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{sprint.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {sprint.taskCount} tasks
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Progress value={sprint.progress} className="h-2 flex-1" />
                            <span className="text-sm text-gray-600">{sprint.progress}%</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'done' ? 'bg-green-500' :
                          task.status === 'in-progress' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-gray-500">
                            {task.sprint_id ? 'In sprint' : 'Backlog'} • {formatDate(task.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sprints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Sprints</CardTitle>
              </CardHeader>
              <CardContent>
                {sprintsWithTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sprints yet</h3>
                    <p className="text-gray-600 mb-6">Create your first sprint to organize tasks and track progress</p>
                    <Button onClick={() => setIsCreateSprintModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Sprint
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sprintsWithTasks.map((sprint) => (
                      <div key={sprint.id} className="border rounded-lg">
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleSprintExpansion(sprint.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {expandedSprints.has(sprint.id) ? 
                                <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              }
                              <div>
                                <h4 className="font-medium">{sprint.name}</h4>
                                {sprint.goal && (
                                  <p className="text-sm text-gray-600">{sprint.goal}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-sm text-gray-500">
                                {sprint.completedTasks}/{sprint.taskCount} tasks
                              </div>
                              <div className="flex items-center space-x-2">
                                <Progress value={sprint.progress} className="w-20 h-2" />
                                <span className="text-sm text-gray-600">{sprint.progress}%</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                              </Badge>
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddTaskToSprint(sprint.id);
                                }}
                                className="h-8"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Task
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {expandedSprints.has(sprint.id) && (
                          <div className="border-t bg-gray-50 p-4">
                            <div className="mb-4">
                              <h5 className="font-medium text-sm">Sprint Tasks</h5>
                            </div>
                            
                            {sprint.tasks.length === 0 ? (
                              <div className="text-center py-8">
                                <ListTodo className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">No tasks in this sprint</p>
                                <p className="text-xs text-gray-500">Use the "Add Task" button above to get started</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {sprint.tasks.map((task) => (
                                  <div key={task.id} className="flex items-center justify-between p-3 bg-white border rounded">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-3 h-3 rounded-full ${
                                        task.status === 'done' ? 'bg-green-500' :
                                        task.status === 'in-progress' ? 'bg-blue-500' :
                                        'bg-gray-300'
                                      }`} />
                                      <div>
                                        <h5 className="font-medium text-sm">{task.title}</h5>
                                        <p className="text-xs text-gray-500">{task.description}</p>
                                        {task.parent_task_id && (
                                          <p className="text-xs text-blue-600">↳ Subtask</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {task.priority && (
                                        <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
                                          {task.priority}
                                        </Badge>
                                      )}
                                      <Badge className={`${getStatusColor(task.status)} text-xs`}>
                                        {task.status.replace('_', ' ')}
                                      </Badge>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-blue-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddSubtask(task);
                                        }}
                                        title="Add Subtask"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-red-500"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTaskToDelete(task);
                                          setIsDeleteTaskModalOpen(true);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backlog" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2" />
                  Project Backlog
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.filter(task => !task.sprint_id).length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No backlog items</h3>
                    <p className="text-gray-600">All tasks are assigned to sprints</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.filter(task => !task.sprint_id).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            task.status === 'done' ? 'bg-green-500' :
                            task.status === 'in-progress' ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`} />
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            {task.parent_task_id && (
                              <p className="text-xs text-blue-600">↳ Subtask</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.priority && (
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          )}
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          
                          {/* Sprint Assignment Dropdown */}
                          {sprints.length > 0 && (
                            <Select 
                              onValueChange={(sprintId) => {
                                handleMoveTaskToSprint(task.id, sprintId);
                              }}
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue placeholder="Add to Sprint" />
                              </SelectTrigger>
                              <SelectContent>
                                {sprints.map((sprint) => (
                                  <SelectItem key={sprint.id} value={sprint.id}>
                                    {sprint.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600"
                              onClick={() => handleAddSubtask(task)}
                              title="Add Subtask"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500"
                              onClick={() => {
                                setTaskToDelete(task);
                                setIsDeleteTaskModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="h-5 w-5 mr-2" />
                  Project Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {milestones.length === 0 ? (
                  <div className="text-center py-12">
                    <Flag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones found</h3>
                    <p className="text-gray-600">Create milestones to track major project deliverables</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Milestone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Expected Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {milestones.map((milestone) => (
                        <TableRow key={milestone.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{milestone.name}</p>
                              <p className="text-sm text-gray-500">{milestone.description}</p>
                              {milestone.requirements && (
                                <p className="text-xs text-gray-400 mt-1">Requirements: {milestone.requirements}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(milestone.status)}>
                              {milestone.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(milestone.priority)}>
                              {milestone.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={milestone.progress} className="w-16 h-2" />
                              <span className="text-sm">{milestone.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{getUserName(milestone.owner_id)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{formatDate(milestone.expected_date)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Project Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Team management coming soon</h3>
                  <p className="text-gray-600">Manage project team members and permissions</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Sprint Modal */}
        <Dialog open={isCreateSprintModalOpen} onOpenChange={setIsCreateSprintModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-blue-500" />
                <span>Create New Sprint</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Sprint Name</label>
                <Input
                  value={sprintForm.name}
                  onChange={(e) => setSprintForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sprint 1"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Goal (optional)</label>
                <Textarea
                  value={sprintForm.goal}
                  onChange={(e) => setSprintForm(prev => ({ ...prev, goal: e.target.value }))}
                  placeholder="What should be achieved in this sprint?"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={sprintForm.start_date}
                    onChange={(e) => setSprintForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={sprintForm.end_date}
                    onChange={(e) => setSprintForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateSprintModalOpen(false)}
                disabled={isCreatingSprint}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSprint}
                disabled={isCreatingSprint || !sprintForm.name || !sprintForm.start_date || !sprintForm.end_date}
              >
                {isCreatingSprint ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sprint
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Milestone Modal */}
        <Dialog open={isCreateMilestoneModalOpen} onOpenChange={setIsCreateMilestoneModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-green-500" />
                <span>Create New Milestone</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Milestone Name</label>
                <Input
                  value={milestoneForm.name}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., MVP Release"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this milestone represents"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Requirements</label>
                <Textarea
                  value={milestoneForm.requirements}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="List the specific requirements or deliverables"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={milestoneForm.priority} 
                    onValueChange={(value) => setMilestoneForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={milestoneForm.status} 
                    onValueChange={(value) => setMilestoneForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Expected Date</label>
                  <Input
                    type="date"
                    value={milestoneForm.expected_date}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, expected_date: e.target.value }))}
                    className="mt-1"
                    min={(() => {
                      const today = new Date().toISOString().split('T')[0];
                      const projectStart = project?.start_date || project?.startDate;
                      if (projectStart) {
                        const startDate = new Date(projectStart).toISOString().split('T')[0];
                        return startDate > today ? startDate : today;
                      }
                      return today;
                    })()}
                    max={(() => {
                      const projectEnd = (project as any)?.expected_end || project?.end_date || project?.endDate;
                      return projectEnd ? new Date(projectEnd).toISOString().split('T')[0] : undefined;
                    })()}
                  />
                  {project && (
                    <p className="text-xs text-gray-500 mt-1">
                      Project timeline: {formatDate(project.start_date || project.startDate)} - {formatDate((project as any).expected_end || project.end_date || project.endDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateMilestoneModalOpen(false)}
                disabled={isCreatingMilestone}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMilestone}
                disabled={isCreatingMilestone || !milestoneForm.name || !milestoneForm.expected_date}
              >
                {isCreatingMilestone ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Milestone
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Task Modal */}
        <Dialog open={isCreateTaskModalOpen} onOpenChange={setIsCreateTaskModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-blue-500" />
                <span>
                  {parentTaskForSubtask ? `Create Subtask for "${parentTaskForSubtask.title}"` : 'Create New Task'}
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Task Title</label>
                <Input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the task requirements"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={taskForm.priority} 
                    onValueChange={(value) => setTaskForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={taskForm.status} 
                    onValueChange={(value) => setTaskForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Due Date (optional)</label>
                  <Input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Assignee (optional)</label>
                  <Select 
                    value={taskForm.assignee_id} 
                    onValueChange={(value) => setTaskForm(prev => ({ ...prev, assignee_id: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!parentTaskForSubtask && (
                <div>
                  <label className="text-sm font-medium">Sprint Assignment</label>
                  <Select 
                    value={selectedSprintForTask || taskForm.sprint_id} 
                    onValueChange={(value) => {
                      setSelectedSprintForTask(value);
                      setTaskForm(prev => ({ ...prev, sprint_id: value }));
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select sprint or leave in backlog" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog (No Sprint)</SelectItem>
                      {sprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateTaskModalOpen(false)}
                disabled={isCreatingTask}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTask}
                disabled={isCreatingTask || !taskForm.title}
              >
                {isCreatingTask ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {parentTaskForSubtask ? 'Create Subtask' : 'Create Task'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Task Confirmation Modal */}
        <Dialog open={isDeleteTaskModalOpen} onOpenChange={setIsDeleteTaskModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Delete Task</span>
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Are you sure you want to delete the task <strong>"{taskToDelete?.title}"</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteTaskModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteTask}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 