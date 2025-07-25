import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  Project, 
  CreateProjectData, 
  UpdateProjectData,
  ProjectTask,
  CreateProjectTaskData,
  UpdateProjectTaskData,
  ProjectDeliverable,
  CreateProjectDeliverableData,
  UpdateProjectDeliverableData,
  ProjectSprint,
  CreateProjectSprintData,
  UpdateProjectSprintData
} from '@/apis';

export function useProjects() {
  const { user, apiClient } = useAuth() as any;
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  
  // Project Tasks state
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Project Deliverables state
  const [projectDeliverables, setProjectDeliverables] = useState<ProjectDeliverable[]>([]);
  const [isLoadingDeliverables, setIsLoadingDeliverables] = useState(false);
  const [deliverablesError, setDeliverablesError] = useState<string | null>(null);

  // Project Sprints state
  const [projectSprints, setProjectSprints] = useState<ProjectSprint[]>([]);
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);
  const [sprintsError, setSprintsError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user?.company_id) {
      setProjectsError('No company ID available');
      return;
    }

    setIsLoadingProjects(true);
    setProjectsError(null);
    
    try {
      const response = await apiClient.get('/projects');
      setProjects(response.data);
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      setProjectsError(error.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setIsLoadingProjects(false);
    }
  }, [user?.company_id, apiClient]);

  const createProject = useCallback(async (projectData: CreateProjectData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.post('/projects', projectData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const updateProject = useCallback(async (projectId: string, projectData: UpdateProjectData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/projects/${projectId}`, projectData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/projects/${projectId}`);
  }, [user?.company_id, apiClient]);

  // Project Tasks methods
  const fetchProjectTasks = useCallback(async (projectId?: string) => {
    if (!user?.company_id) {
      setTasksError('No company ID available');
      return;
    }

    setIsLoadingTasks(true);
    setTasksError(null);
    
    try {
      const url = projectId ? `/project-tasks?project_id=${projectId}` : '/project-tasks';
      const response = await apiClient.get(url);
      setProjectTasks(response.data);
    } catch (error: any) {
      console.error('Failed to fetch project tasks:', error);
      setTasksError(error.response?.data?.message || 'Failed to fetch project tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  }, [user?.company_id, apiClient]);

  const createProjectTask = useCallback(async (taskData: CreateProjectTaskData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.post('/project-tasks', taskData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const updateProjectTask = useCallback(async (taskId: string, taskData: UpdateProjectTaskData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/project-tasks/${taskId}`, taskData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteProjectTask = useCallback(async (taskId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/project-tasks/${taskId}`);
  }, [user?.company_id, apiClient]);

  // Project Deliverables methods
  const fetchProjectDeliverables = useCallback(async (projectId?: string) => {
    if (!user?.company_id) {
      setDeliverablesError('No company ID available');
      return;
    }

    setIsLoadingDeliverables(true);
    setDeliverablesError(null);
    
    try {
      const url = projectId ? `/project-deliverables?project_id=${projectId}` : '/project-deliverables';
      const response = await apiClient.get(url);
      setProjectDeliverables(response.data);
    } catch (error: any) {
      console.error('Failed to fetch project deliverables:', error);
      setDeliverablesError(error.response?.data?.message || 'Failed to fetch project deliverables');
    } finally {
      setIsLoadingDeliverables(false);
    }
  }, [user?.company_id, apiClient]);

  const createProjectDeliverable = useCallback(async (deliverableData: CreateProjectDeliverableData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.post('/project-deliverables', deliverableData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const updateProjectDeliverable = useCallback(async (deliverableId: string, deliverableData: UpdateProjectDeliverableData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/project-deliverables/${deliverableId}`, deliverableData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteProjectDeliverable = useCallback(async (deliverableId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/project-deliverables/${deliverableId}`);
  }, [user?.company_id, apiClient]);

  // Project Sprints methods
  const fetchProjectSprints = useCallback(async (projectId?: string) => {
    if (!user?.company_id) {
      setSprintsError('No company ID available');
      return;
    }

    setIsLoadingSprints(true);
    setSprintsError(null);
    
    try {
      const url = projectId ? `/project-sprints?project_id=${projectId}` : '/project-sprints';
      const response = await apiClient.get(url);
      setProjectSprints(response.data);
    } catch (error: any) {
      console.error('Failed to fetch project sprints:', error);
      setSprintsError(error.response?.data?.message || 'Failed to fetch project sprints');
    } finally {
      setIsLoadingSprints(false);
    }
  }, [user?.company_id, apiClient]);

  const createProjectSprint = useCallback(async (sprintData: CreateProjectSprintData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.post('/project-sprints', sprintData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const updateProjectSprint = useCallback(async (sprintId: string, sprintData: UpdateProjectSprintData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/project-sprints/${sprintId}`, sprintData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteProjectSprint = useCallback(async (sprintId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/project-sprints/${sprintId}`);
  }, [user?.company_id, apiClient]);

  useEffect(() => {
    if (user?.company_id) {
      fetchProjects();
    }
  }, [user?.company_id, fetchProjects]);

  return {
    // Projects
    projects,
    isLoadingProjects,
    projectsError,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    
    // Project Tasks
    projectTasks,
    isLoadingTasks,
    tasksError,
    fetchProjectTasks,
    createProjectTask,
    updateProjectTask,
    deleteProjectTask,
    
    // Project Deliverables
    projectDeliverables,
    isLoadingDeliverables,
    deliverablesError,
    fetchProjectDeliverables,
    createProjectDeliverable,
    updateProjectDeliverable,
    deleteProjectDeliverable,
    
    // Project Sprints
    projectSprints,
    isLoadingSprints,
    sprintsError,
    fetchProjectSprints,
    createProjectSprint,
    updateProjectSprint,
    deleteProjectSprint,
  };
} 