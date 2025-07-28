// Basic API client and utilities

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Export types
export type { 
  Employee, 
  CreateEmployeeData, 
  UpdateEmployeeData, 
  Department, 
  Onboarding, 
  CreateOnboardingData, 
  UpdateOnboardingData, 
  OnboardingTask,
  User,
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
  UpdateProjectSprintData,
  Lead,
  CreateLeadData,
  UpdateLeadData,
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  Contact,
  CreateContactData,
  UpdateContactData,
  Account,
  CreateAccountData,
  UpdateAccountData,
  Stage,
  CreateStageData,
  UpdateStageData,
  Opportunity,
  CreateOpportunityData,
  UpdateOpportunityData,
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
  Asset,
  AssetCategory,
  CreateAssetData,
  UpdateAssetData,
  CreateAssetCategoryData,
  UpdateAssetCategoryData
} from './types';

// Invitation types
export interface AcceptInvitationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AcceptInvitationSuccessResponse {
  message: string;
  user: {
    id: string;
    email: string;
    company_id: string;
    role: string;
  };
  details: string;
}

export interface AcceptInvitationErrorResponse {
  message: string;
  errors: string[];
}

// Password validation utility
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  // Check for common sequences (basic check)
  const commonSequences = ['123', 'abc', 'qwe', 'asd', 'password', '123456'];
  const lowerPassword = password.toLowerCase();
  if (commonSequences.some(seq => lowerPassword.includes(seq))) {
    errors.push("Password must not contain common sequences");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// API client instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://startup-flo-backend.onrender.com',
  timeout: 10000,
});

// Authentication interceptor
api.interceptors.request.use((config) => {
  // Add authorization header if token exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sf_access_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Performance tracking
  requestCount++;
  config.metadata = { startTime: Date.now() };
  
  return config;
});

// Performance metrics interface
export interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  cacheHitCount: number;
  cacheMissCount: number;
  errorCount: number;
}

// Mock performance metrics for now
let mockMetrics: PerformanceMetrics = {
  requestCount: 0,
  averageResponseTime: 150,
  errorRate: 0.02,
  cacheHitRate: 0.75,
  cacheHitCount: 150,
  cacheMissCount: 50,
  errorCount: 4,
};

// Performance tracking
let requestCount = 0;
let totalResponseTime = 0;
let errorCount = 0;
let cacheHits = 0;
let cacheMisses = 0;

// Update metrics
const updateMetrics = () => {
  mockMetrics = {
    requestCount,
    averageResponseTime: requestCount > 0 ? totalResponseTime / requestCount : 0,
    errorRate: requestCount > 0 ? errorCount / requestCount : 0,
    cacheHitRate: (cacheHits + cacheMisses) > 0 ? cacheHits / (cacheHits + cacheMisses) : 0,
    cacheHitCount: cacheHits,
    cacheMissCount: cacheMisses,
    errorCount,
  };
};

// Response interceptor to track metrics
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
    totalResponseTime += duration;
    updateMetrics();
    return response;
  },
  (error) => {
    errorCount++;
    const duration = Date.now() - (error.config?.metadata?.startTime || Date.now());
    totalResponseTime += duration;
    updateMetrics();
    return Promise.reject(error);
  }
);

// Export performance metrics function
export const getPerformanceMetrics = (): PerformanceMetrics => {
  return { ...mockMetrics };
};

// Cache utilities
export const clearApiCache = () => {
  // Reset cache metrics
  cacheHits = 0;
  cacheMisses = 0;
  updateMetrics();
};

// Track cache hits and misses
export const trackCacheHit = () => {
  cacheHits++;
  updateMetrics();
};

export const trackCacheMiss = () => {
  cacheMisses++;
  updateMetrics();
};

// Reset all metrics
export const resetMetrics = () => {
  requestCount = 0;
  totalResponseTime = 0;
  errorCount = 0;
  cacheHits = 0;
  cacheMisses = 0;
  updateMetrics();
};

// CRM API functions
const crmApi = {
  // Leads
  getLeads: async (params?: any) => {
    const response = await api.get('/crm/leads', { params });
    return response.data.leads || response.data;
  },
  
  createLead: async (data: any) => {
    const response = await api.post('/crm/leads', data);
    return response.data;
  },
  
  updateLead: async (id: string, data: any) => {
    const response = await api.patch(`/crm/leads/${id}`, data);
    return response.data;
  },
  
  deleteLead: async (id: string) => {
    await api.delete(`/crm/leads/${id}`);
  },
  
  getLeadById: async (id: string) => {
    const response = await api.get(`/crm/leads/${id}`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/crm/categories');
    return response.data.categories || response.data;
  },
  
  createCategory: async (data: any) => {
    const response = await api.post('/crm/categories', data);
    return response.data;
  },
  
  updateCategory: async (id: string, data: any) => {
    const response = await api.patch(`/crm/categories/${id}`, data);
    return response.data;
  },
  
  deleteCategory: async (id: string) => {
    await api.delete(`/crm/categories/${id}`);
  },

  // Contacts
  getContacts: async (params?: any) => {
    const response = await api.get('/crm/contacts', { params });
    return response.data.contacts || response.data;
  },
  
  createContact: async (data: any) => {
    const response = await api.post('/crm/contacts', data);
    return response.data;
  },
  
  updateContact: async (id: string, data: any) => {
    const response = await api.patch(`/crm/contacts/${id}`, data);
    return response.data;
  },
  
  deleteContact: async (id: string) => {
    await api.delete(`/crm/contacts/${id}`);
  },
  
  getContactById: async (id: string) => {
    const response = await api.get(`/crm/contacts/${id}`);
    return response.data;
  },

  // Accounts
  getAccounts: async (params?: any) => {
    const response = await api.get('/crm/accounts', { params });
    return response.data.accounts || response.data;
  },
  
  createAccount: async (data: any) => {
    const response = await api.post('/crm/accounts', data);
    return response.data;
  },
  
  updateAccount: async (id: string, data: any) => {
    const response = await api.put(`/crm/accounts/${id}`, data);
    return response.data;
  },
  
  deleteAccount: async (id: string) => {
    await api.delete(`/crm/accounts/${id}`);
  },
  
  getAccountById: async (id: string) => {
    const response = await api.get(`/crm/accounts/${id}`);
    return response.data;
  },

  // Opportunities
  getOpportunities: async (params?: any) => {
    const response = await api.get('/crm/opportunities', { params });
    return response.data.opportunities || response.data;
  },
  
  createOpportunity: async (data: any) => {
    const response = await api.post('/crm/opportunities', data);
    return response.data;
  },
  
  updateOpportunity: async (id: string, data: any) => {
    const response = await api.put(`/crm/opportunities/${id}`, data);
    return response.data;
  },
  
  deleteOpportunity: async (id: string) => {
    await api.delete(`/crm/opportunities/${id}`);
  },
  
  getOpportunityById: async (id: string) => {
    const response = await api.get(`/crm/opportunities/${id}`);
    return response.data;
  },
  
  moveOpportunityToStage: async (id: string, data: { stage_id: string }) => {
    const response = await api.patch(`/crm/opportunities/${id}/stage`, data);
    return response.data;
  },

  // Stages
  getStages: async () => {
    const response = await api.get('/crm/stages');
    return response.data.stages || response.data;
  },
  
  createStage: async (data: any) => {
    const response = await api.post('/crm/stages', data);
    return response.data;
  },
  
  updateStage: async (id: string, data: any) => {
    const response = await api.put(`/crm/stages/${id}`, data);
    return response.data;
  },
  
  deleteStage: async (id: string) => {
    await api.delete(`/crm/stages/${id}`);
  },
  
  getStageById: async (id: string) => {
    const response = await api.get(`/crm/stages/${id}`);
    return response.data;
  },

  // Activities
  getActivities: async (params?: any) => {
    const response = await api.get('/crm/activities', { params });
    return response.data.activities || response.data;
  },
  
  createActivity: async (data: any) => {
    const response = await api.post('/crm/activities', data);
    return response.data;
  },
  
  updateActivity: async (id: string, data: any) => {
    const response = await api.patch(`/crm/activities/${id}`, data);
    return response.data;
  },
  
  deleteActivity: async (id: string) => {
    await api.delete(`/crm/activities/${id}`);
  },
  
  getActivityById: async (id: string) => {
    const response = await api.get(`/crm/activities/${id}`);
    return response.data;
  },
  
  markActivityAsCompleted: async (id: string) => {
    const response = await api.patch(`/crm/activities/${id}/complete`);
    return response.data;
  },

  // Notes
  getNotes: async (params?: any) => {
    const response = await api.get('/crm/notes', { params });
    return response.data.notes || response.data;
  },
  
  createNote: async (data: any) => {
    const response = await api.post('/crm/notes', data);
    return response.data;
  },
  
  updateNote: async (id: string, data: any) => {
    const response = await api.patch(`/crm/notes/${id}`, data);
    return response.data;
  },
  
  deleteNote: async (id: string) => {
    await api.delete(`/crm/notes/${id}`);
  },
  
  getNoteById: async (id: string) => {
    const response = await api.get(`/crm/notes/${id}`);
    return response.data;
  },
};

// Assets API functions
const assetsApi = {
  // Assets
  getAssets: async (params?: any) => {
    const response = await api.get('/assets/assets', { params });
    return response.data;
  },
  
  getAssetById: async (id: string) => {
    const response = await api.get(`/assets/assets/${id}`);
    return response.data;
  },
  
  createAsset: async (data: any) => {
    const response = await api.post('/assets/assets', data);
    return response.data;
  },
  
  updateAsset: async (id: string, data: any) => {
    const response = await api.patch(`/assets/assets/${id}`, data);
    return response.data;
  },
  
  deleteAsset: async (id: string) => {
    await api.delete(`/assets/assets/${id}`);
  },

  // Asset Categories
  getAssetCategories: async () => {
    const response = await api.get('/asset/categories');
    return response.data;
  },
  
  getAssetCategoryById: async (id: string) => {
    const response = await api.get(`/asset/categories/${id}`);
    return response.data;
  },
  
  createAssetCategory: async (data: any) => {
    const response = await api.post('/asset/categories', data);
    return response.data;
  },
  
  updateAssetCategory: async (id: string, data: any) => {
    const response = await api.patch(`/asset/categories/${id}`, data);
    return response.data;
  },
  
  deleteAssetCategory: async (id: string) => {
    await api.delete(`/asset/categories/${id}`);
  },
};

// Invitation API functions
const invitationApi = {
  // Get invitation info by token
  getInvitationByToken: async (inviteToken: string) => {
    try {
      const response = await api.get(`/invites/${inviteToken}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get invitation: ${error.response?.data?.message || error.message}`);
    }
  },
  
  // Accept invitation
  acceptInvitation: async (inviteToken: string, data: AcceptInvitationData) => {
    // Validate password before making API call
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }
    
    try {
      const response = await api.post(`/invites/${inviteToken}/accept`, data);
      return response.data as AcceptInvitationSuccessResponse;
    } catch (error: any) {
      if (error.response?.data?.message === "Password does not meet requirements") {
        // Return the specific validation errors from the server
        throw new Error(`Password validation failed: ${error.response.data.errors.join(', ')}`);
      }
      throw new Error(`Failed to accept invitation: ${error.response?.data?.message || error.message}`);
    }
  },
  
  // Send invitation
  sendInvitation: async (data: {
    email: string;
    role: string;
    company_id: string;
  }) => {
    const response = await api.post('/invites', data);
    return response.data;
  },
  
  // List company invitations
  getCompanyInvitations: async (companyId: string) => {
    const response = await api.get(`/invites/company/${companyId}`);
    return response.data;
  },
  
  // Expire invitation
  expireInvitation: async (inviteId: string) => {
    const response = await api.patch(`/invites/${inviteId}`, {});
    return response.data;
  },
  
  // Delete invitation
  deleteInvitation: async (inviteId: string) => {
    await api.delete(`/invites/${inviteId}`);
  },
};

// Add TypeScript declaration for the extended api object
declare module 'axios' {
  interface AxiosInstance {
    crm: typeof crmApi;
    assets: typeof assetsApi;
    invitations: typeof invitationApi;
  }
}

// Extend the api object with CRM, Assets, and Invitation functionality
Object.assign(api, { crm: crmApi, assets: assetsApi, invitations: invitationApi }); 