import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/apis";
import { useAuth } from "./AuthContext";
import {
  Project,
  ProjectTask,
  CreateProjectData,
  UpdateProjectData,
  // CreateTaskData, // Unused
  // UpdateTaskData, // Unused
  // PaginatedResponse, // Unused
  PaginationParams,
} from "@/apis/types";
import { ApiError } from "@/apis/core/errors";

interface ProjectsContextType {
  projects: Project[];
  currentProject: Project | null;
  projectTasks: ProjectTask[];
  userTasks: ProjectTask[];
  isLoadingProjects: boolean;
  isLoadingProject: boolean;
  isLoadingTasks: boolean;
  isLoadingUserTasks: boolean;
  projectsError: string | null;
  projectError: string | null;
  tasksError: string | null;
  userTasksError: string | null;
  projectsPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  fetchProjects: (params?: PaginationParams) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  fetchProjectTasks: (projectId: string, params?: PaginationParams) => Promise<void>;
  fetchUserTasks: (userId: string) => Promise<void>;
  createProject: (projectData: CreateProjectData) => Promise<Project>;
  updateProject: (id: string, projectData: UpdateProjectData) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  clearProjectsCache: () => void;
  refreshProjects: () => Promise<void>;
  refreshCurrentProject: () => Promise<void>;
  refreshUserTasks: () => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

interface ProjectsProviderProps {
  children: ReactNode;
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [userTasks, setUserTasks] = useState<ProjectTask[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingUserTasks, setIsLoadingUserTasks] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [userTasksError, setUserTasksError] = useState<string | null>(null);
  const [projectsPagination, setProjectsPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  const fetchProjects = useCallback(async (params?: PaginationParams) => {
    setIsLoadingProjects(true);
    setProjectsError(null);
    try {
      const data = await api.projects.getProjects(params);
      console.log("📊 Raw projects API response:", data);
      
      // Handle both paginated response and direct array response
      let projectsArray: Project[] = [];
      if (Array.isArray(data)) {
        // Backend is returning array directly (not paginated)
        projectsArray = data;
        console.log("✅ Using direct array response, projects count:", projectsArray.length);
      } else if (data.data && Array.isArray(data.data)) {
        // Standard paginated response
        projectsArray = data.data;
        console.log("✅ Using paginated response, projects count:", projectsArray.length);
      } else {
        console.warn("⚠️ Unexpected response format:", data);
      }
      
      setProjects(projectsArray);
      
      // Add null checks for meta properties
      if (!Array.isArray(data) && data.meta) {
        setProjectsPagination({
          page: data.meta.currentPage || 1,
          limit: data.meta.perPage || 10,
          total: data.meta.totalItems || 0,
          pages: data.meta.totalPages || 1,
        });
      } else {
        // Fallback pagination if meta is not available
        setProjectsPagination({
          page: 1,
          limit: 10,
          total: projectsArray.length,
          pages: 1,
        });
      }
      
      localStorage.setItem(`projects_${JSON.stringify(params)}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : "Failed to load projects. Please try again.";
      setProjectsError(errorMessage);
      
      // Set empty state on error
      setProjects([]);
      setProjectsPagination(null);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  const fetchProject = useCallback(async (projectId: string) => {
    setIsLoadingProject(true);
    setProjectError(null);
    try {
      const data = await api.projects.getProjectById(projectId);
      setCurrentProject(data);
      setCurrentProjectId(projectId);
      localStorage.setItem(`project_${projectId}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err) {
      console.error("Failed to fetch project:", err);
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : "Failed to load project. Please try again.";
      setProjectError(errorMessage);
      setCurrentProject(null);
    } finally {
      setIsLoadingProject(false);
    }
  }, []);

  const fetchProjectTasks = useCallback(async (projectId: string, params?: PaginationParams) => {
    setIsLoadingTasks(true);
    setTasksError(null);
    try {
      const data = await api.projects.getProjectTasks(projectId, params);
      setProjectTasks(data.data || []);
      localStorage.setItem(`project_tasks_${projectId}_${JSON.stringify(params)}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err) {
      console.error("Failed to fetch project tasks:", err);
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : "Failed to load project tasks. Please try again.";
      setTasksError(errorMessage);
      
      // Set empty state on error
      setProjectTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  const fetchUserTasks = useCallback(async (userId: string) => {
    setIsLoadingUserTasks(true);
    setUserTasksError(null);
    try {
      const data = await api.projects.getUserTasks(userId);
      console.log("📋 Raw user tasks API response:", data);
      setUserTasks(data || []);
      setCurrentUserId(userId);
      localStorage.setItem(`user_tasks_${userId}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err) {
      console.error("Failed to fetch user tasks:", err);
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : "Failed to load your tasks. Please try again.";
      setUserTasksError(errorMessage);
      
      // Set empty state on error
      setUserTasks([]);
    } finally {
      setIsLoadingUserTasks(false);
    }
  }, []);

  const createProject = useCallback(async (projectData: CreateProjectData): Promise<Project> => {
    setIsLoadingProjects(true);
    setProjectsError(null);
    try {
      const newProject = await api.projects.createProject(projectData);
      await fetchProjects();
      return newProject;
    } catch (err) {
      console.error("Failed to create project:", err);
      throw err;
    } finally {
      setIsLoadingProjects(false);
    }
  }, [fetchProjects]);

  const updateProject = useCallback(async (projectId: string, projectData: UpdateProjectData): Promise<Project> => {
    setIsLoadingProject(true);
    setProjectError(null);
    try {
      const updatedProject = await api.projects.updateProject(projectId, projectData);
      setCurrentProject(updatedProject);
      await fetchProjects();
      return updatedProject;
    } catch (err) {
      console.error("Failed to update project:", err);
      throw err;
    } finally {
      setIsLoadingProject(false);
    }
  }, [fetchProjects]);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    setIsLoadingProjects(true);
    setProjectsError(null);
    try {
      await api.projects.deleteProject(projectId);
      await fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      throw err;
    } finally {
      setIsLoadingProjects(false);
    }
  }, [fetchProjects]);

  const clearProjectsCache = useCallback(() => {
    setProjects([]);
    setCurrentProject(null);
    setProjectTasks([]);
    setUserTasks([]);
    setProjectsPagination(null);
    console.log("Projects cache cleared");
  }, []);

  const refreshProjects = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  const refreshCurrentProject = useCallback(async () => {
    if (currentProjectId) {
      await fetchProject(currentProjectId);
    }
  }, [currentProjectId, fetchProject]);

  const refreshUserTasks = useCallback(async () => {
    if (currentUserId) {
      await fetchUserTasks(currentUserId);
    }
  }, [currentUserId, fetchUserTasks]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      clearProjectsCache();
    }
  }, [isAuthenticated, fetchProjects, clearProjectsCache]);

  const value: ProjectsContextType = {
    projects,
    currentProject,
    projectTasks,
    userTasks,
    isLoadingProjects,
    isLoadingProject,
    isLoadingTasks,
    isLoadingUserTasks,
    projectsError,
    projectError,
    tasksError,
    userTasksError,
    projectsPagination,
    fetchProjects,
    fetchProject,
    fetchProjectTasks,
    fetchUserTasks,
    createProject,
    updateProject,
    deleteProject,
    clearProjectsCache,
    refreshProjects,
    refreshCurrentProject,
    refreshUserTasks,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = (): ProjectsContextType => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
};

export default ProjectsContext;
