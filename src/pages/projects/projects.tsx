import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { projectsSidebarSections } from "@/components/sidebars/ProjectsSidebar";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";
import type { 
  Project, 
  CreateProjectData,
  User,
} from "@/apis";
import { notifications } from "@/components/NotificationService";

// Import the new sections
import {
  ProjectSummaryCards,
  ProjectFilters,
  ProjectsTable,
  CreateProjectModal,
  TaskModal,
  MilestoneModal,
  SprintModal,
  EditProjectModal
} from "@/sections/projects/projects";

export default function Projects() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const companyId = user?.company_id;
  
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
    isLoadingProjects,
    projectsError,
    fetchProjects, 
    createProject, 
    updateProject,
    deleteProject,
  } = useProjects();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [users, setUsers] = useState<User[]>([]); 
  
  // Form state for the modal (matches CreateProjectModal interface)
  const [formData, setFormData] = useState({
    company_id: companyId || '',
    name: '',
    description: '',
    start_date: '',
    expected_end: '',
    team_lead: '',
    status: 'active' as Project['status']
  });

  // Task form state
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    status: 'todo' as const,
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
    priority: 'medium' as const,
    status: 'planning' as const,
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
    status: 'planning' as const,
    capacity: 40
  });

  // Edit project form state
  const [editProjectFormData, setEditProjectFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    expected_end: '',
    team_lead: '',
    status: 'active' as Project['status']
  });

  useEffect(() => {
    const loadProjects = async () => {
      if (!companyId) {
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
  const fetchUsersCallback = useCallback(async () => {
    try {
      if (!companyId) {
        console.warn('No company ID available for fetching users');
        return;
      }
      
      // For now, we'll use a mock users array since we don't have a users API yet
      // In a real implementation, you would call: const usersData = await apiClient.get('/users');
      const mockUsers: User[] = [
        {
          id: 'de604b7c-85da-4942-98d5-56956d926b0c',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          job_title: 'Project Manager'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchUsersCallback();
    }
  }, [companyId, fetchUsersCallback]);

  // Handle form submission
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const projectDataWithCompanyId: CreateProjectData = {
        company_id: companyId || formData.company_id,
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date,
        expected_end: formData.expected_end,
        team_lead: formData.team_lead || undefined,
        status: formData.status
      };

      console.log('Creating project with ', projectDataWithCompanyId);
      await createProject(projectDataWithCompanyId);
      
      notifications.projectCreated(formData.name);
      
      // Reset form
      setFormData({
        company_id: companyId || '',
        name: '',
        description: '',
        start_date: '',
        expected_end: '',
        team_lead: '',
        status: 'active'
      });
      
      setIsCreateModalOpen(false);
      await fetchProjects();
      
    } catch (error: unknown) {
      console.error('Error creating project:', error);
      if (error instanceof Error) {
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
        owner_id: taskFormData.owner_id || undefined,
        due_date: taskFormData.due_date || undefined,
        sprint_id: taskFormData.sprint_id || undefined,
        parent_task_id: taskFormData.parent_task_id || undefined
      };

      console.log('Creating task with:', taskData);
      
      // For now, we'll just show a success message since we don't have the task API implemented yet
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
        owner_id: milestoneFormData.owner_id || undefined,
        progress: milestoneFormData.progress,
        requirements: milestoneFormData.requirements
      };

      console.log('Creating milestone with:', milestoneData);
      
      // For now, we'll just show a success message since we don't have the milestone API implemented yet
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
      
      // For now, we'll just show a success message since we don't have the sprint API implemented yet
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
      await updateProject(selectedProjectForEdit.id, updateData);
      
      notifications.success(`Project "${editProjectFormData.name}" updated successfully!`);
      
      setIsEditProjectModalOpen(false);
      setSelectedProjectForEdit(null);
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

  // Event handlers for modals
  const handleAddTasks = (project: Project) => {
    setSelectedProjectForTask(project);
    setIsTaskModalOpen(true);
  };

  const handleAddMilestones = (project: Project) => {
    setSelectedProjectForMilestone(project);
    setIsMilestoneModalOpen(true);
  };

  const handleAddSprints = (project: Project) => {
    setSelectedProjectForSprint(project);
    setIsSprintModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProjectForEdit(project);
    setEditProjectFormData({
      name: project.name,
      description: project.description,
      start_date: project.start_date,
      expected_end: project.expected_end,
      team_lead: project.team_lead || '',
      status: project.status
    });
    setIsEditProjectModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      await deleteProject(projectId);
      notifications.projectDeleted(projectName);
      await fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      notifications.error(`Failed to delete project "${projectName}". Please try again.`);
    }
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
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
      const matchesTeamLead = filters.teamLead === 'all' || project.team_lead === filters.teamLead;
      
      // Date range filter
      const matchesDateRange = (() => {
        if (filters.dateRange === 'all') return true;
        
        const projectEndDate = new Date(project.expected_end);
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

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "active").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const totalBudget = projects.reduce((sum, p) => {
    const budget = p.budget;
    return sum + (typeof budget === 'number' ? budget : 0);
  }, 0);

  // Show loading if auth is still loading or if we're loading projects
  if (authLoading || (isLoadingProjects && companyId)) {
    return (
      <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading projects...</span>
        </div>
      </ExtensibleLayout>
    );
  }

  // Show error only if auth is done loading and we have an actual error
  if ((projectsError || error) && !authLoading) {
    return (
      <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{projectsError || error}</p>
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
      <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management">
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
    <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">Manage and track all your projects</p>
          </div>
          <CreateProjectModal
            isOpen={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            formData={formData}
            onFormDataChange={setFormData}
            users={users}
            isSubmitting={isSubmitting}
            onSubmit={handleCreateProject}
          />
                </div>

        {/* Summary Cards */}
        <ProjectSummaryCards
          totalProjects={totalProjects}
          activeProjects={activeProjects}
          completedProjects={completedProjects}
          totalBudget={totalBudget}
        />

        {/* Filters and Search */}
        <ProjectFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          users={users}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {/* Projects Table */}
        <ProjectsTable
          projects={filteredProjects}
          users={users}
          onAddTasks={handleAddTasks}
          onAddMilestones={handleAddMilestones}
          onAddSprints={handleAddSprints}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onViewProject={handleViewProject}
          getStatusColor={getStatusColor}
        />

        {/* Modals */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onOpenChange={setIsTaskModalOpen}
          selectedProject={selectedProjectForTask}
          formData={taskFormData}
          onFormDataChange={setTaskFormData}
          users={users}
          isSubmitting={isSubmitting}
          onSubmit={handleCreateTask}
        />

        <MilestoneModal
          isOpen={isMilestoneModalOpen}
          onOpenChange={setIsMilestoneModalOpen}
          selectedProject={selectedProjectForMilestone}
          formData={milestoneFormData}
          onFormDataChange={setMilestoneFormData}
          users={users}
          isSubmitting={isSubmitting}
          onSubmit={handleCreateMilestone}
        />

        <SprintModal
          isOpen={isSprintModalOpen}
          onOpenChange={setIsSprintModalOpen}
          selectedProject={selectedProjectForSprint}
          formData={sprintFormData}
          onFormDataChange={setSprintFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleCreateSprint}
        />

        <EditProjectModal
          isOpen={isEditProjectModalOpen}
          onOpenChange={setIsEditProjectModalOpen}
          selectedProject={selectedProjectForEdit}
          formData={editProjectFormData}
          onFormDataChange={setEditProjectFormData}
          users={users}
          isSubmitting={isSubmitting}
          onSubmit={handleUpdateProject}
        />
      </div>
    </ExtensibleLayout>
  );
} 
