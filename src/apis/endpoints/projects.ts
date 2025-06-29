export const PROJECTS_ENDPOINTS = {
  // Projects
  LIST: "/projects",
  CREATE: "/projects",
  DETAIL: (id: string) => `/projects/${id}`,
  UPDATE: (id: string) => `/projects/${id}`,
  DELETE: (id: string) => `/projects/${id}`,

  // Project Tasks
  TASKS_LIST: (projectId: string) => `/project-tasks/project/${projectId}`,
  TASKS_CREATE: `/project-tasks`,
  TASK_DETAIL: (taskId: string) => `/project-tasks/${taskId}`,
  TASK_UPDATE: (taskId: string) => `/project-tasks/${taskId}`,
  TASK_DELETE: (taskId: string) => `/project-tasks/${taskId}`,
  
  // Task Assignment to Sprints
  ASSIGN_TASK_TO_SPRINT: (taskId: string) => `/project-tasks/${taskId}/assign-sprint`,
  REMOVE_TASK_FROM_SPRINT: (taskId: string) => `/project-tasks/${taskId}/remove-sprint`,
  MOVE_TASK_TO_SPRINT: (taskId: string) => `/project-tasks/${taskId}/move-sprint`,

  // User Tasks
  USER_TASKS: (userId: string) => `/project-tasks/assignee/${userId}`,

  // Project Sprints
  SPRINTS_LIST: "/project-sprints",
  SPRINTS_BY_PROJECT: (projectId: string) => `/project-sprints/project/${projectId}`,
  SPRINTS_CREATE: "/project-sprints",
  SPRINT_DETAIL: (sprintId: string) => `/project-sprints/${sprintId}`,
  SPRINT_UPDATE: (sprintId: string) => `/project-sprints/${sprintId}`,
  SPRINT_DELETE: (sprintId: string) => `/project-sprints/${sprintId}`,
  SPRINT_TASKS: (sprintId: string) => `/project-sprints/${sprintId}/tasks`,
  
  // Sprint Management
  START_SPRINT: (sprintId: string) => `/project-sprints/${sprintId}/start`,
  COMPLETE_SPRINT: (sprintId: string) => `/project-sprints/${sprintId}/complete`,
  SPRINT_BACKLOG: (projectId: string) => `/projects/${projectId}/backlog`,

  // Project Members
  MEMBERS_LIST: (projectId: string) => `/projects/${projectId}/members`,
  MEMBERS_ADD: (projectId: string) => `/projects/${projectId}/members`,
  MEMBER_REMOVE: (projectId: string, memberId: string) => `/projects/${projectId}/members/${memberId}`,

  // Project Comments
  COMMENTS_LIST: (taskId: string) => `/project-tasks/${taskId}/comments`,
  COMMENTS_CREATE: "/project-comments",
  COMMENT_DETAIL: (commentId: string) => `/project-comments/${commentId}`,
  COMMENT_UPDATE: (commentId: string) => `/project-comments/${commentId}`,
  COMMENT_DELETE: (commentId: string) => `/project-comments/${commentId}`,

  // Project Deliverables (Milestones)
  DELIVERABLES_LIST: (projectId: string) => `/project-deliverables/project/${projectId}`,
  DELIVERABLES_CREATE: "/project-deliverables",
  DELIVERABLE_DETAIL: (deliverableId: string) => `/project-deliverables/${deliverableId}`,
  DELIVERABLE_UPDATE: (deliverableId: string) => `/project-deliverables/${deliverableId}`,
  DELIVERABLE_DELETE: (deliverableId: string) => `/project-deliverables/${deliverableId}`,
} as const;
