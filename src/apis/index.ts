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
  UpdateCampaignData
} from './types';

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

// Add TypeScript declaration for the extended api object
declare module 'axios' {
  interface AxiosInstance {
    crm: typeof crmApi;
  }
}

// Extend the api object with CRM functionality
Object.assign(api, { crm: crmApi }); 