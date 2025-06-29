import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { projectsSidebarSections } from "@/components/sidebars/ProjectsSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Unused Avatar components
import { 
  Plus,
  Search,
  Filter,
  // MoreHorizontal, // Unused
  Calendar,
  Users,
  Target,
  AlertTriangle,
  Eye,
  Edit3,
  Trash2,
  Star,
  Loader2,
  ListTodo,
  Milestone,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useProjects } from "@/contexts/ProjectsContext";
import { useAuth } from "@/contexts/AuthContext";
// import { useUserContext } from "@/contexts/UserContext"; // Unused
import type { 
  Project, 
  ProjectTask, 
  User as AppUser, 
  CreateProjectData,
} from "@/apis/types";
import { ApiError } from "@/apis/core/errors";
import { api, apiClient } from "@/apis";
import { notifications } from "@/components/NotificationService";

// interface ExtendedProject extends Omit<Project, 'priority' | 'budget'> { // Unused
//   tasks?: ProjectTask[];
//   // sprints?: ProjectSprint[]; // Assuming ProjectSprint is not used yet
//   progress?: number;
//   budget?: { allocated: number; spent: number };
//   manager?: string;
//   team?: Array<{ name: string; avatar: string; role: string }>;
//   tags?: string[];
//   starred?: boolean;
//   healthStatus?: string;
//   priority?: 'low' | 'medium' | 'high' | 'urgent';
// }

export default function Projects() {
  const router = useRouter();
  const { user, companyId, loading: authLoading } = useAuth();
  
  // Debug logging
  console.log("🏢 Projects page - Auth data:", { 
    hasUser: !!user, 
    userEmail: user?.email,
    userCompanyId: user?.company_id,
    companyId: companyId,
    authLoading: authLoading
  });
  
  const { 
    projects, 
    // isLoadingProjects, // Unused
    // projectsError, // Unused
    fetchProjects, 
    createProject, 
    // updateProject, // Unused
    deleteProject,
    // projectsPagination // Unused
  } = useProjects();
  const [loading, setLoading] = useState(true); // Keep this for initial page load
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    teamLead: 'all',
    dateRange: 'all'
  });
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState<Project | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedProjectForMilestone, setSelectedProjectForMilestone] = useState<Project | null>(null);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [selectedProjectForSprint, setSelectedProjectForSprint] = useState<Project | null>(null);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);
  
  // Users state for team lead dropdown
  const [users, setUsers] = useState<AppUser[]>([]); 
  
  // Form state
  const [formData, setFormData] = useState<any>({ // Using any temporarily to match backend fields
    company_id: companyId || '',
    name: '',
    description: '',
    start_date: '',
    expected_end: '',
    team_lead: '',
    status: 'active' // Backend uses 'active' not 'not_started'
  });

  // Task form state
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    owner_id: '',
    due_date: '',
    sprint_id: '',
    parent_task_id: ''
  });

  // Milestone form state
  const [milestoneFormData, setMilestoneFormData] = useState({
    name: '',
    description: '',
    expected_date: '',
    priority: 'medium',
    status: 'planning',
    owner_id: '',
    progress: 0,
    requirements: ''
  });

  // Sprint form state
  const [sprintFormData, setSprintFormData] = useState({
    name: '',
    goal: '',
    start_date: '',
    end_date: '',
    status: 'planning',
    capacity: 40
  });

  // Edit project form state
  const [editProjectFormData, setEditProjectFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    expected_end: '',
    team_lead: '',
    status: 'active'
  });
  // const [newProjectData, setNewProjectData] = useState<Partial<CreateProjectData>>({ // Unused
  //   name: "",
  //   description: "",
  //   status: "not_started",
  // });
  const [editingProject, setEditingProject] = useState<Project | null>(null); // Keep for edit functionality
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Keep for edit functionality

  useEffect(() => {
    const loadProjects = async () => {
      if (!companyId) {
        // Don't show error immediately, wait for auth to load
        console.log('No company ID available yet, waiting...');
        return;
      }
      
    setLoading(true);
      setError(null);
      
      try {
        await fetchProjects();
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError("Something went wrong. Please try again or contact support.");
      } finally {
      setLoading(false);
    }
    };

    loadProjects();
  }, [companyId, fetchProjects]);

  // Fetch users for team lead dropdown
  const fetchUsersCallback = useCallback(async () => { // Renamed to avoid conflict with state variable
    try {
      if (!companyId) {
        console.warn('No company ID available for fetching users');
        return;
      }
      
      const usersData = await api.user.getCompanyUsers(companyId); // Fixed API call
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  }, [companyId]); // Added companyId

  useEffect(() => {
    if (companyId) {
      fetchUsersCallback();
    }
  }, [companyId, fetchUsersCallback]); // Added fetchUsersCallback

  // Handle form submission
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Ensure company_id is set
      const projectDataWithCompanyId = {
        ...formData,
        company_id: companyId || formData.company_id,
      };

      console.log('Creating project with ', projectDataWithCompanyId);
      await createProject(projectDataWithCompanyId);
      
      // Show success notification
      notifications.projectCreated(formData.name);
      
      // Reset form
      setFormData({
        company_id: companyId || '',
        name: '',
        description: '',
        start_date: '',
        expected_end: '',
        team_lead: '',
        status: 'active' // Backend uses 'active' not 'not_started'
      });
      
      // Close modal
      setIsCreateModalOpen(false);
      
      // Refresh projects list
      await fetchProjects();
      
    } catch (error: unknown) { // Changed from any to unknown
      console.error('Error creating project:', error);
      if (error instanceof ApiError) {
        notifications.error(`Failed to create project: ${error.message}. Please try again.`);
      } else {
        notifications.error('Failed to create project. An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle task creation
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedProjectForTask) return;

    try {
      setIsSubmitting(true);
      
      const taskData = {
        project_id: selectedProjectForTask.id,
        title: taskFormData.title,
        description: taskFormData.description,
        priority: taskFormData.priority,
        status: taskFormData.status,
        owner_id: taskFormData.owner_id || null,
        due_date: taskFormData.due_date || null,
        sprint_id: taskFormData.sprint_id || null,
        parent_task_id: taskFormData.parent_task_id || null
      };

      console.log('Creating task with:', taskData);
      
      // Make API call to create task using existing API client
      await apiClient.post('/project-tasks', taskData);

      // Show success notification
      notifications.success(`Task "${taskFormData.title}" created successfully!`);
      
      // Reset form
      setTaskFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        owner_id: '',
        due_date: '',
        sprint_id: '',
        parent_task_id: ''
      });
      
      // Close modal
      setIsTaskModalOpen(false);
      setSelectedProjectForTask(null);
      
    } catch (error: unknown) {
      console.error('Error creating task:', error);
      if (error instanceof Error) {
        notifications.error(`Failed to create task: ${error.message}`);
      } else {
        notifications.error('Failed to create task. An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening task modal
  const handleAddTasks = (project: Project) => {
    setSelectedProjectForTask(project);
    setIsTaskModalOpen(true);
  };

  // Handle milestone creation
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedProjectForMilestone) return;

    try {
      setIsSubmitting(true);
      
      const milestoneData = {
        project_id: selectedProjectForMilestone.id,
        name: milestoneFormData.name,
        description: milestoneFormData.description,
        expected_date: milestoneFormData.expected_date,
        priority: milestoneFormData.priority,
        status: milestoneFormData.status,
        owner_id: milestoneFormData.owner_id || null,
        progress: milestoneFormData.progress,
        requirements: milestoneFormData.requirements
      };

      console.log('Creating milestone with:', milestoneData);
      
      // Make API call to create milestone
      await apiClient.post('/project-deliverables', milestoneData);

      // Show success notification
      notifications.success(`Milestone "${milestoneFormData.name}" created successfully!`);
      
      // Reset form
      setMilestoneFormData({
        name: '',
        description: '',
        expected_date: '',
        priority: 'medium',
        status: 'planning',
        owner_id: '',
        progress: 0,
        requirements: ''
      });
      
      // Close modal
      setIsMilestoneModalOpen(false);
      setSelectedProjectForMilestone(null);
      
    } catch (error: unknown) {
      console.error('Error creating milestone:', error);
      if (error instanceof Error) {
        notifications.error(`Failed to create milestone: ${error.message}`);
      } else {
        notifications.error('Failed to create milestone. An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening milestone modal
  const handleAddMilestones = (project: Project) => {
    setSelectedProjectForMilestone(project);
    setIsMilestoneModalOpen(true);
  };

  // Handle sprint creation
  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedProjectForSprint) return;

    try {
      setIsSubmitting(true);
      
      const sprintData = {
        project_id: selectedProjectForSprint.id,
        name: sprintFormData.name,
        goal: sprintFormData.goal,
        start_date: sprintFormData.start_date,
        end_date: sprintFormData.end_date,
        status: sprintFormData.status,
        capacity: sprintFormData.capacity
      };

      console.log('Creating sprint with:', sprintData);
      
      // Make API call to create sprint
      await apiClient.post('/project-sprints', sprintData);

      // Show success notification
      notifications.success(`Sprint "${sprintFormData.name}" created successfully!`);
      
      // Reset form
      setSprintFormData({
        name: '',
        goal: '',
        start_date: '',
        end_date: '',
        status: 'planning',
        capacity: 40
      });
      
      // Close modal
      setIsSprintModalOpen(false);
      setSelectedProjectForSprint(null);
      
    } catch (error: unknown) {
      console.error('Error creating sprint:', error);
      if (error instanceof Error) {
        notifications.error(`Failed to create sprint: ${error.message}`);
      } else {
        notifications.error('Failed to create sprint. An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening sprint modal
  const handleAddSprints = (project: Project) => {
    setSelectedProjectForSprint(project);
    setIsSprintModalOpen(true);
  };

  // Handle project update
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedProjectForEdit) return;

    try {
      setIsSubmitting(true);
      
      const updateData = {
        name: editProjectFormData.name,
        description: editProjectFormData.description,
        start_date: editProjectFormData.start_date,
        expected_end: editProjectFormData.expected_end,
        team_lead: editProjectFormData.team_lead,
        status: editProjectFormData.status
      };

      console.log('Updating project with:', updateData);
      
      // Make API call to update project
      await apiClient.put(`/projects/${selectedProjectForEdit.id}`, updateData);

      // Show success notification
      notifications.success(`Project "${editProjectFormData.name}" updated successfully!`);
      
      // Close modal
      setIsEditProjectModalOpen(false);
      setSelectedProjectForEdit(null);
      
      // Refresh projects list
      await fetchProjects();
      
    } catch (error: unknown) {
      console.error('Error updating project:', error);
      if (error instanceof Error) {
        notifications.error(`Failed to update project: ${error.message}`);
      } else {
        notifications.error('Failed to update project. An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening edit project modal
  const handleEditProject = (project: Project) => {
    setSelectedProjectForEdit(project);
    // Pre-fill form with existing project data
    setEditProjectFormData({
      name: project.name,
      description: project.description,
      start_date: (project as any).start_date || '',
      expected_end: (project as any).expected_end || '',
      team_lead: (project as any).team_lead || '',
      status: project.status
    });
    setIsEditProjectModalOpen(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      teamLead: 'all',
      dateRange: 'all'
    });
    setSearchTerm('');
  };

  // Check if any filters are active
  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || 
    filters.teamLead !== 'all' || filters.dateRange !== 'all' || searchTerm !== '';

  // Update form data when company changes
  useEffect(() => {
    if (companyId) {
      setFormData(prev => ({
        ...prev,
        company_id: companyId
      }));
    }
  }, [companyId]);

  // Filter projects based on search term and filters
  const filteredProjects = useMemo(() => {
    console.log("🔍 Filtering projects:", {
      totalProjects: projects.length,
      searchTerm,
      filters,
      projects: projects
    });
    
    let filtered = projects.filter(project => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = filters.status === 'all' || project.status === filters.status;
      
      // Team lead filter
      const matchesTeamLead = filters.teamLead === 'all' || (project as any).team_lead === filters.teamLead;
      
      // Date range filter
      const matchesDateRange = (() => {
        if (filters.dateRange === 'all') return true;
        
        const projectEndDate = new Date((project as any).expected_end);
        const today = new Date();
        const oneWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const oneMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        switch (filters.dateRange) {
          case 'overdue':
            return projectEndDate < today && project.status !== 'completed';
          case 'due_this_week':
            return projectEndDate >= today && projectEndDate <= oneWeek;
          case 'due_this_month':
            return projectEndDate >= today && projectEndDate <= oneMonth;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesTeamLead && matchesDateRange;
    });
    
    console.log("✅ Filtered projects result:", {
      filteredCount: filtered.length,
      appliedFilters: filters,
      filtered: filtered
    });
    
    return filtered;
  }, [projects, searchTerm, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800";
      case "not_started": return "bg-gray-100 text-gray-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "on_hold": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Removed unused functions for health status and priority colors since columns were removed

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => (p as any).status === "active").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const totalBudget = projects.reduce((sum, p) => {
    const budget = p.budget;
    return sum + (typeof budget === 'number' ? budget : 0);
  }, 0);

  // Create a user object compatible with ExtensibleLayout
  const layoutUser = user ? {
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
    email: user.email,
    role: user.role || 'User',
    avatarUrl: user.avatar_url || undefined
  } : null;

  // Show loading if auth is still loading or if we're loading projects
  if (authLoading || (loading && companyId)) {
    return (
      <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management" user={layoutUser}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading projects...</span>
        </div>
      </ExtensibleLayout>
    );
  }

  // Show error only if auth is done loading and we have an actual error
  if (error && !authLoading) {
    return (
      <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management" user={layoutUser}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => {
              setError(null);
              if (companyId) {
                fetchProjects();
              }
            }}>
              Try Again
            </Button>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  // If auth is done loading but no company ID, show a gentle message
  if (!authLoading && !companyId) {
    return (
      <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management" user={layoutUser}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Unable to load projects. Please refresh the page or contact support.</p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management" user={layoutUser}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">Manage and track all your projects</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: string) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter project description"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date || ""}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected_end">Expected End Date *</Label>
                    <Input
                      id="expected_end"
                      type="date"
                      value={formData.expected_end || ""}
                      onChange={(e) => setFormData({ ...formData, expected_end: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_lead">Team Lead</Label>
                  <Select value={formData.team_lead || ""} onValueChange={(value) => setFormData({ ...formData, team_lead: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} - {user.job_title || 'No title'}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled>No users available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    {users.length > 0 
                      ? `${users.length} user(s) available` 
                      : 'Loading users...'
                    }
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProjects}</div>
              <p className="text-sm text-blue-600">All projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{activeProjects}</div>
              <p className="text-sm text-gray-600">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedProjects}</div>
              <p className="text-sm text-green-600">Successfully finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(totalBudget / 1000).toFixed(0)}K</div>
              <p className="text-sm text-gray-600">Allocated budget</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              className="max-w-md pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={hasActiveFilters ? "border-blue-500 bg-blue-50" : ""}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                    {Object.values(filters).filter(v => v !== 'all').length + (searchTerm ? 1 : 0)}
                  </Badge>
                )}
          </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Filter Projects</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Team Lead Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Team Lead</Label>
                    <Select value={filters.teamLead} onValueChange={(value) => setFilters({...filters, teamLead: value})}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Team Leads</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Due Date</Label>
                    <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="due_this_week">Due This Week</SelectItem>
                        <SelectItem value="due_this_month">Due This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Projects Table */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? "No projects found matching your search." : "No projects found. Create your first project!"}
            </p>
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Team Lead</TableHead>
                  <TableHead>Team Size</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-gray-900">{project.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-full max-w-24">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-xs">{project.progress || 0}%</span>
                        </div>
                        <Progress value={project.progress || 0} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {(() => {
                          const teamLead = users.find(u => u.id === (project as any).team_lead);
                          return teamLead ? `${teamLead.first_name} ${teamLead.last_name}` : 'Not assigned';
                        })()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        <span>1</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {(project as any).expected_end ? new Date((project as any).expected_end).toLocaleDateString() : 'No date set'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          0 total
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          0 done
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleAddTasks(project)}
                        >
                          <ListTodo className="h-4 w-4 mr-1" />
                          Add Tasks
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleAddMilestones(project)}
                        >
                          <Milestone className="h-4 w-4 mr-1" />
                          Add Milestones
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleAddSprints(project)}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Add Sprints
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => router.push(`/projects/${project.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditProject(project)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the project <strong>"{project.name}"</strong>? 
                                This action cannot be undone and will permanently remove all project data, 
                                including tasks and milestones.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  try {
                                    if (project.id) {
                                    await deleteProject(project.id);
                                      notifications.projectDeleted(project.name);
                                    await fetchProjects(); // Refresh list after delete
                                    }
                                  } catch (error) {
                                    console.error('Error deleting project:', error);
                                    notifications.error(`Failed to delete project "${project.name}". Please try again.`);
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Project
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Task Creation Modal */}
        <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Add Task to "{selectedProjectForTask?.name}"
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title *</Label>
                  <Input
                    id="task-title"
                    value={taskFormData.title}
                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select 
                    value={taskFormData.priority} 
                    onValueChange={(value) => setTaskFormData({ ...taskFormData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-status">Status</Label>
                  <Select 
                    value={taskFormData.status} 
                    onValueChange={(value) => setTaskFormData({ ...taskFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-due-date">Due Date</Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={taskFormData.due_date}
                    onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
                  />
                </div>
              </div>

                              <div className="space-y-2">
                  <Label htmlFor="task-owner">Assign To</Label>
                  <Select 
                    value={taskFormData.owner_id || undefined} 
                    onValueChange={(value) => setTaskFormData({ ...taskFormData, owner_id: value || '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} - {user.job_title || 'No title'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsTaskModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Milestone Creation Modal */}
        <Dialog open={isMilestoneModalOpen} onOpenChange={setIsMilestoneModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Add Milestone to "{selectedProjectForMilestone?.name}"
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMilestone} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="milestone-name">Milestone Name *</Label>
                  <Input
                    id="milestone-name"
                    value={milestoneFormData.name}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, name: e.target.value })}
                    placeholder="Enter milestone name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="milestone-priority">Priority</Label>
                  <Select 
                    value={milestoneFormData.priority} 
                    onValueChange={(value) => setMilestoneFormData({ ...milestoneFormData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="milestone-description">Description</Label>
                <Textarea
                  id="milestone-description"
                  value={milestoneFormData.description}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                  placeholder="Enter milestone description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="milestone-status">Status</Label>
                  <Select 
                    value={milestoneFormData.status} 
                    onValueChange={(value) => setMilestoneFormData({ ...milestoneFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="milestone-expected-date">Expected Date *</Label>
                  <Input
                    id="milestone-expected-date"
                    type="date"
                    value={milestoneFormData.expected_date}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, expected_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="milestone-owner">Assign To</Label>
                  <Select 
                    value={milestoneFormData.owner_id || undefined} 
                    onValueChange={(value) => setMilestoneFormData({ ...milestoneFormData, owner_id: value || '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} - {user.job_title || 'No title'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="milestone-progress">Progress (%)</Label>
                  <Input
                    id="milestone-progress"
                    type="number"
                    min="0"
                    max="100"
                    value={milestoneFormData.progress}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="milestone-requirements">Requirements</Label>
                <Textarea
                  id="milestone-requirements"
                  value={milestoneFormData.requirements}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, requirements: e.target.value })}
                  placeholder="Enter milestone requirements and specifications"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsMilestoneModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Milestone'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Sprint Creation Modal */}
        <Dialog open={isSprintModalOpen} onOpenChange={setIsSprintModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Add Sprint to "{selectedProjectForSprint?.name}"
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSprint} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sprint-name">Sprint Name *</Label>
                  <Input
                    id="sprint-name"
                    value={sprintFormData.name}
                    onChange={(e) => setSprintFormData({ ...sprintFormData, name: e.target.value })}
                    placeholder="Enter sprint name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sprint-status">Status</Label>
                  <Select 
                    value={sprintFormData.status} 
                    onValueChange={(value) => setSprintFormData({ ...sprintFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sprint-goal">Sprint Goal</Label>
                <Textarea
                  id="sprint-goal"
                  value={sprintFormData.goal}
                  onChange={(e) => setSprintFormData({ ...sprintFormData, goal: e.target.value })}
                  placeholder="What is the goal of this sprint?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sprint-start-date">Start Date *</Label>
                  <Input
                    id="sprint-start-date"
                    type="date"
                    value={sprintFormData.start_date}
                    onChange={(e) => setSprintFormData({ ...sprintFormData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sprint-end-date">End Date *</Label>
                  <Input
                    id="sprint-end-date"
                    type="date"
                    value={sprintFormData.end_date}
                    onChange={(e) => setSprintFormData({ ...sprintFormData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sprint-capacity">Sprint Capacity (hours)</Label>
                <Input
                  id="sprint-capacity"
                  type="number"
                  min="1"
                  max="200"
                  value={sprintFormData.capacity}
                  onChange={(e) => setSprintFormData({ ...sprintFormData, capacity: parseInt(e.target.value) || 40 })}
                  placeholder="Total hours available for this sprint"
                />
                <p className="text-sm text-gray-500">
                  Estimate total hours available for this sprint (default: 40 hours)
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsSprintModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Sprint'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Project Modal */}
        <Dialog open={isEditProjectModalOpen} onOpenChange={setIsEditProjectModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Edit Project "{selectedProjectForEdit?.name}"
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateProject} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-project-name">Project Name *</Label>
                  <Input
                    id="edit-project-name"
                    value={editProjectFormData.name}
                    onChange={(e) => setEditProjectFormData({ ...editProjectFormData, name: e.target.value })}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project-status">Status</Label>
                  <Select 
                    value={editProjectFormData.status} 
                    onValueChange={(value: string) => setEditProjectFormData({ ...editProjectFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-project-description">Description *</Label>
                <Textarea
                  id="edit-project-description"
                  value={editProjectFormData.description}
                  onChange={(e) => setEditProjectFormData({ ...editProjectFormData, description: e.target.value })}
                  placeholder="Enter project description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-project-start-date">Start Date *</Label>
                  <Input
                    id="edit-project-start-date"
                    type="date"
                    value={editProjectFormData.start_date}
                    onChange={(e) => setEditProjectFormData({ ...editProjectFormData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project-expected-end">Expected End Date *</Label>
                  <Input
                    id="edit-project-expected-end"
                    type="date"
                    value={editProjectFormData.expected_end}
                    onChange={(e) => setEditProjectFormData({ ...editProjectFormData, expected_end: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-project-team-lead">Team Lead</Label>
                <Select 
                  value={editProjectFormData.team_lead || undefined} 
                  onValueChange={(value) => setEditProjectFormData({ ...editProjectFormData, team_lead: value || '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} - {user.job_title || 'No title'}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>No users available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  {users.length > 0 
                    ? `${users.length} user(s) available` 
                    : 'Loading users...'
                  }
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditProjectModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Project'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 
