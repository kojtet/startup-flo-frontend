import { ApiClient, type ApiConfigOverride } from "../core/client";
import { PROJECTS_ENDPOINTS } from "../endpoints";
import { handleApiError } from "../core/errors";
import type {
  Project,
  ProjectTask,
  ProjectSprint,
  ProjectMember,
  ProjectComment,
  CreateProjectData,
  UpdateProjectData,
  CreateTaskData,
  UpdateTaskData,
  CreateSprintData,
  UpdateSprintData,
  CreateCommentData,
  UpdateCommentData,
  SprintsResponse,
  SprintResponse,
  CommentsResponse,
  CommentResponse,
  PaginatedResponse,
} from "../types";

export class ProjectsService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // Projects
  async getProjects(params?: { page?: number; limit?: number; status?: string; search?: string }, config?: ApiConfigOverride): Promise<PaginatedResponse<Project> | Project[]> {
    try {
      const response = await this.apiClient.get<PaginatedResponse<Project> | Project[]>(PROJECTS_ENDPOINTS.LIST, { ...config, params });
      console.log("🔄 Projects API raw response:", response.data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async createProject(data: CreateProjectData, config?: ApiConfigOverride): Promise<Project> {
    try {
      console.log("📡 Creating project with data:", data);
      const response = await this.apiClient.post<Project>(PROJECTS_ENDPOINTS.CREATE, data, config);
      console.log("✅ Project created successfully:", response.data);
      return response.data; // Response is the project object directly
    } catch (error) {
      console.error("❌ Failed to create project:", error);
      throw handleApiError(error);
    }
  }

  async getProjectById(projectId: string, config?: ApiConfigOverride): Promise<Project> {
    try {
      const response = await this.apiClient.get<Project>(PROJECTS_ENDPOINTS.DETAIL(projectId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateProject(projectId: string, data: UpdateProjectData, config?: ApiConfigOverride): Promise<Project> {
    try {
      const response = await this.apiClient.put<Project>(PROJECTS_ENDPOINTS.UPDATE(projectId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async deleteProject(projectId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(PROJECTS_ENDPOINTS.DELETE(projectId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Project Tasks
  async getProjectTasks(projectId: string, params?: { page?: number; limit?: number; status?: string; assigneeId?: string }, config?: ApiConfigOverride): Promise<PaginatedResponse<ProjectTask>> {
    try {
      const response = await this.apiClient.get<PaginatedResponse<ProjectTask>>(PROJECTS_ENDPOINTS.TASKS_LIST(projectId), { ...config, params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getUserTasks(userId: string, config?: ApiConfigOverride): Promise<ProjectTask[]> {
    try {
      const response = await this.apiClient.get<ProjectTask[]>(PROJECTS_ENDPOINTS.USER_TASKS(userId), config);
      console.log("📋 User tasks API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch user tasks:", error);
      throw handleApiError(error);
    }
  }

  async createTask(projectId: string, data: CreateTaskData, config?: ApiConfigOverride): Promise<ProjectTask> {
    try {
      const response = await this.apiClient.post<ProjectTask>(PROJECTS_ENDPOINTS.TASKS_CREATE, { ...data, project_id: projectId }, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getTaskById(taskId: string, config?: ApiConfigOverride): Promise<ProjectTask> {
    try {
      const response = await this.apiClient.get<ProjectTask>(PROJECTS_ENDPOINTS.TASK_DETAIL(taskId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateTask(taskId: string, data: UpdateTaskData, config?: ApiConfigOverride): Promise<ProjectTask> {
    try {
      const response = await this.apiClient.put<ProjectTask>(PROJECTS_ENDPOINTS.TASK_UPDATE(taskId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async deleteTask(taskId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(PROJECTS_ENDPOINTS.TASK_DELETE(taskId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Project Sprints
  /**
   * Get sprints by project ID
   * 
   * @param projectId - ID of the project to get sprints for
   * @param config - API configuration override
   * @returns Promise resolving to array of project sprints
   * 
   * @example
   * ```typescript
   * const sprints = await projectsService.getProjectSprints('2a03b39d-066d-45ea-8fcd-918ee412d8ad');
   * console.log('Project sprints:', sprints);
   * ```
   * 
   * HTTP: GET /project-sprints/project/:projectId
   */
  async getProjectSprints(projectId: string, config?: ApiConfigOverride): Promise<ProjectSprint[]> {
    try {
      const response = await this.apiClient.get<ProjectSprint[]>(PROJECTS_ENDPOINTS.SPRINTS_BY_PROJECT(projectId), config);
      console.log("📋 Project sprints API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch project sprints:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Create a new sprint
   * 
   * @param data - Sprint creation data
   * @param config - API configuration override
   * @returns Promise resolving to created sprint
   * 
   * @example
   * ```typescript
   * const sprintData: CreateSprintData = {
   *   project_id: "aa71473e-8cbb-494f-8852-3e79979b51c8",
   *   name: "Sprint 1",
   *   goal: "Complete initial features",
   *   start_date: "2024-03-20",
   *   end_date: "2024-04-03",
   *   owner_id: "5bda4522-01c3-435d-adab-65db52e14da4"
   * };
   * 
   * const sprint = await projectsService.createSprint(sprintData);
   * ```
   * 
   * HTTP: POST /project-sprints
   */
  async createSprint(data: CreateSprintData, config?: ApiConfigOverride): Promise<ProjectSprint> {
    try {
      console.log("📡 Creating sprint with data:", data);
      const response = await this.apiClient.post<ProjectSprint>(PROJECTS_ENDPOINTS.SPRINTS_CREATE, data, config);
      console.log("✅ Sprint created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create sprint:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Get sprint by ID
   * 
   * @param sprintId - ID of the sprint to retrieve
   * @param config - API configuration override
   * @returns Promise resolving to sprint details
   * 
   * @example
   * ```typescript
   * const sprint = await projectsService.getSprintById('4269b750-5641-4f67-a925-c76822b74aaf');
   * console.log('Sprint:', sprint.name, sprint.goal);
   * ```
   * 
   * HTTP: GET /project-sprints/:id
   */
  async getSprintById(sprintId: string, config?: ApiConfigOverride): Promise<ProjectSprint> {
    try {
      const response = await this.apiClient.get<ProjectSprint>(PROJECTS_ENDPOINTS.SPRINT_DETAIL(sprintId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update sprint by ID
   * 
   * @param sprintId - ID of the sprint to update
   * @param data - Sprint update data
   * @param config - API configuration override
   * @returns Promise resolving to updated sprint
   * 
   * @example
   * ```typescript
   * const updatedSprint = await projectsService.updateSprint(
   *   '4269b750-5641-4f67-a925-c76822b74aaf',
   *   {
   *     name: "Sprint 1 - Updated",
   *     goal: "Complete initial features and setup",
   *     end_date: "2024-04-05"
   *   }
   * );
   * ```
   * 
   * HTTP: PUT /project-sprints/:id
   */
  async updateSprint(sprintId: string, data: UpdateSprintData, config?: ApiConfigOverride): Promise<ProjectSprint> {
    try {
      const response = await this.apiClient.put<ProjectSprint>(PROJECTS_ENDPOINTS.SPRINT_DETAIL(sprintId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete sprint by ID
   * 
   * @param sprintId - ID of the sprint to delete
   * @param config - API configuration override
   * @returns Promise resolving when sprint is deleted
   * 
   * @example
   * ```typescript
   * await projectsService.deleteSprint('4269b750-5641-4f67-a925-c76822b74aaf');
   * console.log('Sprint deleted successfully');
   * ```
   * 
   * HTTP: DELETE /project-sprints/:id
   */
  async deleteSprint(sprintId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(PROJECTS_ENDPOINTS.SPRINT_DETAIL(sprintId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get tasks for a specific sprint
   * 
   * @param sprintId - ID of the sprint to get tasks for
   * @param config - API configuration override
   * @returns Promise resolving to array of sprint tasks
   * 
   * @example
   * ```typescript
   * const sprintTasks = await projectsService.getSprintTasks('4269b750-5641-4f67-a925-c76822b74aaf');
   * console.log('Sprint tasks:', sprintTasks);
   * ```
   * 
   * HTTP: GET /project-sprints/:sprintId/tasks
   */
  async getSprintTasks(sprintId: string, config?: ApiConfigOverride): Promise<ProjectTask[]> {
    try {
      const response = await this.apiClient.get<ProjectTask[]>(PROJECTS_ENDPOINTS.SPRINT_TASKS(sprintId), config);
      console.log("📋 Sprint tasks API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch sprint tasks:", error);
      throw handleApiError(error);
    }
  }


  // Project Members
  async getProjectMembers(projectId: string, config?: ApiConfigOverride): Promise<ProjectMember[]> {
    try {
      const response = await this.apiClient.get<ProjectMember[]>(PROJECTS_ENDPOINTS.MEMBERS_LIST(projectId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // SPRINT UTILITY METHODS
  // ================================

  /**
   * Get sprints by project ID (alias for getProjectSprints)
   */
  async getSprintsByProject(projectId: string, config?: ApiConfigOverride): Promise<ProjectSprint[]> {
    return this.getProjectSprints(projectId, config);
  }

  /**
   * Create a project sprint with convenience method
   */
  async createProjectSprint(
    projectId: string,
    name: string,
    startDate: string,
    endDate: string,
    ownerId: string,
    goal?: string,
    config?: ApiConfigOverride
  ): Promise<ProjectSprint> {
    const sprintData: CreateSprintData = {
      project_id: projectId,
      name,
      start_date: startDate,
      end_date: endDate,
      owner_id: ownerId,
      goal
    };
    return this.createSprint(sprintData, config);
  }

  /**
   * Update sprint name
   */
  async updateSprintName(sprintId: string, name: string, config?: ApiConfigOverride): Promise<ProjectSprint> {
    return this.updateSprint(sprintId, { name }, config);
  }

  /**
   * Update sprint goal
   */
  async updateSprintGoal(sprintId: string, goal: string, config?: ApiConfigOverride): Promise<ProjectSprint> {
    return this.updateSprint(sprintId, { goal }, config);
  }

  /**
   * Update sprint dates
   */
  async updateSprintDates(sprintId: string, startDate: string, endDate: string, config?: ApiConfigOverride): Promise<ProjectSprint> {
    return this.updateSprint(sprintId, { start_date: startDate, end_date: endDate }, config);
  }

  /**
   * Update sprint owner
   */
  async updateSprintOwner(sprintId: string, ownerId: string, config?: ApiConfigOverride): Promise<ProjectSprint> {
    return this.updateSprint(sprintId, { owner_id: ownerId }, config);
  }

  /**
   * Get sprint count for a project
   */
  async getSprintCount(projectId: string, config?: ApiConfigOverride): Promise<number> {
    const sprints = await this.getProjectSprints(projectId, config);
    return sprints.length;
  }

  /**
   * Get sprint task count
   */
  async getSprintTaskCount(sprintId: string, config?: ApiConfigOverride): Promise<number> {
    const tasks = await this.getSprintTasks(sprintId, config);
    return tasks.length;
  }

  /**
   * Check if sprint is active (within date range)
   */
  async isSprintActive(sprintId: string, config?: ApiConfigOverride): Promise<boolean> {
    const sprint = await this.getSprintById(sprintId, config);
    const now = new Date();
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    
    return now >= startDate && now <= endDate;
  }

  /**
   * Get sprint duration in days
   */
  async getSprintDuration(sprintId: string, config?: ApiConfigOverride): Promise<number> {
    const sprint = await this.getSprintById(sprintId, config);
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get remaining days in sprint
   */
  async getSprintRemainingDays(sprintId: string, config?: ApiConfigOverride): Promise<number> {
    const sprint = await this.getSprintById(sprintId, config);
    const now = new Date();
    const endDate = new Date(sprint.end_date);
    
    if (now > endDate) return 0;
    
    const diffTime = Math.abs(endDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get sprint progress based on dates
   */
  async getSprintProgress(sprintId: string, config?: ApiConfigOverride): Promise<number> {
    const sprint = await this.getSprintById(sprintId, config);
    const now = new Date();
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    
    if (now < startDate) return 0;
    if (now > endDate) return 100;
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = now.getTime() - startDate.getTime();
    
    return Math.round((elapsedDuration / totalDuration) * 100);
  }

  // ================================
  // PROJECT COMMENT METHODS
  // ================================

  /**
   * Create a comment on a task
   * 
   * @param data - Comment creation data
   * @param config - API configuration override
   * @returns Promise resolving to created comment
   * 
   * @example
   * ```typescript
   * const commentData: CreateCommentData = {
   *   task_id: "04a9e9e6-39c6-409d-af0c-2e4a0beac995",
   *   user_id: "5bda4522-01c3-435d-adab-65db52e14da4",
   *   message: "Comment content"
   * };
   * 
   * const comment = await projectsService.createComment(commentData);
   * ```
   * 
   * HTTP: POST /project-comments
   */
  async createComment(data: CreateCommentData, config?: ApiConfigOverride): Promise<ProjectComment> {
    try {
      console.log("📡 Creating comment with data:", data);
      const response = await this.apiClient.post<ProjectComment>(PROJECTS_ENDPOINTS.COMMENTS_CREATE, data, config);
      console.log("✅ Comment created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create comment:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Get comments for a specific task
   * 
   * @param taskId - ID of the task to get comments for
   * @param config - API configuration override
   * @returns Promise resolving to array of task comments
   * 
   * @example
   * ```typescript
   * const comments = await projectsService.getTaskComments('04a9e9e6-39c6-409d-af0c-2e4a0beac995');
   * console.log('Task comments:', comments);
   * ```
   * 
   * HTTP: GET /project-comments/task/:taskId
   */
  async getTaskComments(taskId: string, config?: ApiConfigOverride): Promise<ProjectComment[]> {
    try {
      const response = await this.apiClient.get<ProjectComment[]>(PROJECTS_ENDPOINTS.COMMENTS_LIST(taskId), config);
      console.log("📋 Task comments API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch task comments:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Get comment by ID
   * 
   * @param commentId - ID of the comment to retrieve
   * @param config - API configuration override
   * @returns Promise resolving to comment details
   * 
   * @example
   * ```typescript
   * const comment = await projectsService.getCommentById('comment-id-123');
   * console.log('Comment:', comment.message);
   * ```
   * 
   * HTTP: GET /project-comments/:id
   */
  async getCommentById(commentId: string, config?: ApiConfigOverride): Promise<ProjectComment> {
    try {
      const response = await this.apiClient.get<ProjectComment>(PROJECTS_ENDPOINTS.COMMENT_DETAIL(commentId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update comment by ID
   * 
   * @param commentId - ID of the comment to update
   * @param data - Comment update data
   * @param config - API configuration override
   * @returns Promise resolving to updated comment
   * 
   * @example
   * ```typescript
   * const updatedComment = await projectsService.updateComment(
   *   'comment-id-123',
   *   {
   *     message: "Updated comment content"
   *   }
   * );
   * ```
   * 
   * HTTP: PATCH /project-comments/:id
   */
  async updateComment(commentId: string, data: UpdateCommentData, config?: ApiConfigOverride): Promise<ProjectComment> {
    try {
      const response = await this.apiClient.patch<ProjectComment>(PROJECTS_ENDPOINTS.COMMENT_DETAIL(commentId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete comment by ID
   * 
   * @param commentId - ID of the comment to delete
   * @param config - API configuration override
   * @returns Promise resolving when comment is deleted
   * 
   * @example
   * ```typescript
   * await projectsService.deleteComment('comment-id-123');
   * console.log('Comment deleted successfully');
   * ```
   * 
   * HTTP: DELETE /project-comments/:id
   */
  async deleteComment(commentId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(PROJECTS_ENDPOINTS.COMMENT_DETAIL(commentId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // COMMENT UTILITY METHODS
  // ================================

  /**
   * Create a task comment with convenience method
   */
  async createTaskComment(
    taskId: string,
    userId: string,
    message: string,
    config?: ApiConfigOverride
  ): Promise<ProjectComment> {
    const commentData: CreateCommentData = {
      task_id: taskId,
      user_id: userId,
      message
    };
    return this.createComment(commentData, config);
  }

  /**
   * Update comment message
   */
  async updateCommentMessage(commentId: string, message: string, config?: ApiConfigOverride): Promise<ProjectComment> {
    return this.updateComment(commentId, { message }, config);
  }

  /**
   * Get comment count for a task
   */
  async getTaskCommentCount(taskId: string, config?: ApiConfigOverride): Promise<number> {
    const comments = await this.getTaskComments(taskId, config);
    return comments.length;
  }

  /**
   * Get comments by user for a task
   */
  async getTaskCommentsByUser(taskId: string, userId: string, config?: ApiConfigOverride): Promise<ProjectComment[]> {
    const comments = await this.getTaskComments(taskId, config);
    return comments.filter(comment => comment.user_id === userId);
  }

  /**
   * Get recent comments for a task (last N comments)
   */
  async getRecentTaskComments(taskId: string, limit: number = 5, config?: ApiConfigOverride): Promise<ProjectComment[]> {
    const comments = await this.getTaskComments(taskId, config);
    // Sort by created_at descending and take the limit
    return comments
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  /**
   * Check if user can edit comment (is the author)
   */
  canUserEditComment(comment: ProjectComment, userId: string): boolean {
    return comment.user_id === userId;
  }

  /**
   * Get formatted comment timestamp
   */
  getCommentAge(comment: ProjectComment): string {
    const now = new Date();
    const commentDate = new Date(comment.created_at);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return commentDate.toLocaleDateString();
  }

  /**
   * Search comments by content
   */
  async searchTaskComments(taskId: string, searchTerm: string, config?: ApiConfigOverride): Promise<ProjectComment[]> {
    const comments = await this.getTaskComments(taskId, config);
    return comments.filter(comment => 
      comment.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Get tasks that are not assigned to any sprint (backlog)
   */
  async getProjectBacklog(projectId: string, config?: ApiConfigOverride): Promise<ProjectTask[]> {
    try {
      const allTasks = await this.getProjectTasks(projectId, undefined, config);
      // Filter tasks that don't have a sprint_id
      const backlogTasks = Array.isArray(allTasks) 
        ? allTasks.filter(task => !task.sprint_id)
        : allTasks.data.filter(task => !task.sprint_id);
      return backlogTasks;
    } catch (error) {
      console.error("❌ Failed to fetch project backlog:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Assign a task to a sprint
   */
  async assignTaskToSprint(taskId: string, sprintId: string, config?: ApiConfigOverride): Promise<ProjectTask> {
    try {
      const response = await this.apiClient.put<ProjectTask>(
        PROJECTS_ENDPOINTS.ASSIGN_TASK_TO_SPRINT(taskId),
        { sprint_id: sprintId },
        config
      );
      console.log("✅ Task assigned to sprint successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to assign task to sprint:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Remove a task from its current sprint (move to backlog)
   */
  async removeTaskFromSprint(taskId: string, config?: ApiConfigOverride): Promise<ProjectTask> {
    try {
      const response = await this.apiClient.put<ProjectTask>(
        PROJECTS_ENDPOINTS.REMOVE_TASK_FROM_SPRINT(taskId),
        { sprint_id: null },
        config
      );
      console.log("✅ Task removed from sprint successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to remove task from sprint:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Move a task from one sprint to another
   */
  async moveTaskToSprint(taskId: string, fromSprintId: string | null, toSprintId: string, config?: ApiConfigOverride): Promise<ProjectTask> {
    try {
      const response = await this.apiClient.put<ProjectTask>(
        PROJECTS_ENDPOINTS.MOVE_TASK_TO_SPRINT(taskId),
        { 
          from_sprint_id: fromSprintId,
          to_sprint_id: toSprintId 
        },
        config
      );
      console.log("✅ Task moved between sprints successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to move task between sprints:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Start a sprint
   */
  async startSprint(sprintId: string, config?: ApiConfigOverride): Promise<ProjectSprint> {
    try {
      const response = await this.apiClient.post<ProjectSprint>(
        PROJECTS_ENDPOINTS.START_SPRINT(sprintId),
        {},
        config
      );
      console.log("✅ Sprint started successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to start sprint:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Complete a sprint
   */
  async completeSprint(sprintId: string, config?: ApiConfigOverride): Promise<ProjectSprint> {
    try {
      const response = await this.apiClient.post<ProjectSprint>(
        PROJECTS_ENDPOINTS.COMPLETE_SPRINT(sprintId),
        {},
        config
      );
      console.log("✅ Sprint completed successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to complete sprint:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Get project deliverables/milestones
   */
  async getProjectDeliverables(projectId: string, config?: ApiConfigOverride): Promise<any[]> {
    try {
      const response = await this.apiClient.get<any[]>(
        PROJECTS_ENDPOINTS.DELIVERABLES_LIST(projectId),
        config
      );
      console.log("📋 Project deliverables API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch project deliverables:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Create a new task directly in a sprint
   */
  async createTaskInSprint(
    projectId: string,
    sprintId: string,
    taskData: Omit<CreateTaskData, 'projectId'>,
    config?: ApiConfigOverride
  ): Promise<ProjectTask> {
    try {
      const response = await this.apiClient.post<ProjectTask>(
        PROJECTS_ENDPOINTS.TASKS_CREATE,
        { 
          ...taskData,
          project_id: projectId,
          sprint_id: sprintId 
        },
        config
      );
      console.log("✅ Task created in sprint successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create task in sprint:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Get sprint statistics
   */
  async getSprintStats(sprintId: string, config?: ApiConfigOverride): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    progress: number;
  }> {
    try {
      const tasks = await this.getSprintTasks(sprintId, config);
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'done').length;
      const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
      const todoTasks = tasks.filter(task => task.status === 'todo').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        progress
      };
    } catch (error) {
      console.error("❌ Failed to get sprint statistics:", error);
      throw handleApiError(error);
    }
  }

  /**
   * Check if a sprint is currently active
   */
  isSprintCurrentlyActive(sprint: ProjectSprint): boolean {
    const now = new Date();
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    return startDate <= now && now <= endDate;
  }

  /**
   * Get days remaining in a sprint
   */
  getSprintDaysRemaining(sprint: ProjectSprint): number {
    const now = new Date();
    const endDate = new Date(sprint.end_date);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get sprint duration in days
   */
  getSprintDurationDays(sprint: ProjectSprint): number {
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Remove default instance export from here
// export const projectsService = new ProjectsService();
// export default projectsService;
