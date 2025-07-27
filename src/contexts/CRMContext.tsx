import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/apis";
import { useAuth } from "./AuthContext";
import type {
  Lead,
  Contact,
  Account,
  Pipeline,
  Stage,
  Opportunity,
  Activity,
  Note,
  CreateLeadData,
  UpdateLeadData,
  CreateContactData,
  UpdateContactData,
  CreateAccountData,
  UpdateAccountData,
  CreateOpportunityData,
  UpdateOpportunityData,
  CreateActivityData,
  UpdateActivityData,
  CreateNoteData,
  UpdateNoteData,
  PaginationParams,
} from "@/apis/types";
import { ApiError } from "@/apis/core/errors";

interface CRMCache {
  activities: {
    data: Activity[];
    timestamp: number;
  } | null;
  opportunities: {
    data: Opportunity[];
    timestamp: number;
  } | null;
  leads: {
    data: Lead[];
    timestamp: number;
  } | null;
  contacts: {
    data: Contact[];
    timestamp: number;
  } | null;
  accounts: {
    data: Account[];
    timestamp: number;
  } | null;
  stages: {
    data: Stage[];
    timestamp: number;
  } | null;
  pipelines: {
    data: Pipeline[];
    timestamp: number;
  } | null;
}

interface CRMContextType {
  // Cache state
  cache: CRMCache;
  
  // Data state
  activities: Activity[];
  opportunities: Opportunity[];
  leads: Lead[];
  contacts: Contact[];
  accounts: Account[];
  stages: Stage[];
  pipelines: Pipeline[];
  notes: Note[];
  
  // Loading states
  isLoadingActivities: boolean;
  isLoadingOpportunities: boolean;
  isLoadingLeads: boolean;
  isLoadingContacts: boolean;
  isLoadingAccounts: boolean;
  isLoadingStages: boolean;
  isLoadingPipelines: boolean;
  isLoadingNotes: boolean;
  
  // Error states
  activitiesError: string | null;
  opportunitiesError: string | null;
  leadsError: string | null;
  contactsError: string | null;
  accountsError: string | null;
  stagesError: string | null;
  pipelinesError: string | null;
  notesError: string | null;
  
  // Optimized data access methods (replaces inefficient service methods)
  getActivitiesOptimized: (useCache?: boolean) => Promise<Activity[]>;
  getPendingActivities: () => Activity[];
  getOverdueActivities: () => Activity[];
  getTodaysActivities: () => Activity[];
  getUpcomingActivities: (days?: number) => Activity[];
  getActivitiesByStatus: (status: string) => Activity[];
  getActivitiesByPriority: (priority: "low" | "medium" | "high") => Activity[];
  getActivitiesCompletionRate: () => number;
  
  getOpportunitiesOptimized: (useCache?: boolean) => Promise<Opportunity[]>;
  getOpportunitiesByAccount: (accountId: string) => Opportunity[];
  getOpportunitiesByContact: (contactId: string) => Opportunity[];
  getOpportunitiesByStage: (stageId: string) => Opportunity[];
  getTotalOpportunityValue: () => number;
  
  getStagesOptimized: (useCache?: boolean) => Promise<Stage[]>;
  getActiveStages: () => Stage[];
  getStageByName: (name: string) => Stage | null;
  
  getPipelinesOptimized: (useCache?: boolean) => Promise<Pipeline[]>;
  getPipelineByName: (name: string) => Pipeline | null;
  
  // Standard CRUD operations (maintain compatibility)
  fetchActivities: (params?: any) => Promise<void>;
  fetchOpportunities: (params?: any) => Promise<void>;
  fetchLeads: (params?: any) => Promise<void>;
  fetchContacts: (params?: any) => Promise<void>;
  fetchAccounts: (params?: any) => Promise<void>;
  fetchStages: () => Promise<void>;
  fetchPipelines: (params?: any) => Promise<void>;
  fetchNotes: (params?: any) => Promise<void>;
  
  // Cache management
  clearCache: () => void;
  invalidateCache: (type?: keyof CRMCache) => void;
  refreshData: () => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Cache duration: 5 minutes for dynamic data, 15 minutes for static data
const CACHE_DURATION = {
  DYNAMIC: 5 * 60 * 1000, // Activities, opportunities
  STATIC: 15 * 60 * 1000,  // Stages, pipelines
};

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Cache state
  const [cache, setCache] = useState<CRMCache>({
    activities: null,
    opportunities: null,
    leads: null,
    contacts: null,
    accounts: null,
    stages: null,
    pipelines: null,
  });
  
  // Data state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Loading states
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  
  // Error states
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [stagesError, setStagesError] = useState<string | null>(null);
  const [pipelinesError, setPipelinesError] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  
  // Helper function to check if cache is valid
  const isCacheValid = (cacheItem: { timestamp: number } | null, duration: number): boolean => {
    if (!cacheItem) return false;
    return Date.now() - cacheItem.timestamp < duration;
  };
  
  // ================================
  // OPTIMIZED DATA ACCESS METHODS
  // ================================
  
  // Optimized activities fetching with intelligent caching
  const getActivitiesOptimized = useCallback(async (useCache: boolean = true): Promise<Activity[]> => {
    if (useCache && isCacheValid(cache.activities, CACHE_DURATION.DYNAMIC)) {
      return cache.activities!.data;
    }
    
    setIsLoadingActivities(true);
    setActivitiesError(null);
    try {
      // @ts-ignore
      const data = await api.crm.getActivities();
      setActivities(data);
      setCache(prev => ({
        ...prev,
        activities: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load activities";
      setActivitiesError(errorMessage);
      throw err;
    } finally {
      setIsLoadingActivities(false);
    }
  }, [cache.activities]);
  
  // Optimized client-side filtering methods using cached data
  const getPendingActivities = useCallback((): Activity[] => {
    return activities.filter(activity => !activity.status || activity.status === 'pending');
  }, [activities]);
  
  const getOverdueActivities = useCallback((): Activity[] => {
    const now = new Date();
    return activities.filter(activity => {
      const dueDate = new Date(activity.due_date);
      return dueDate < now && (!activity.status || activity.status !== 'completed');
    });
  }, [activities]);
  
  const getTodaysActivities = useCallback((): Activity[] => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.due_date).toISOString().split('T')[0];
      return activityDate === todayString;
    });
  }, [activities]);
  
  const getUpcomingActivities = useCallback((days: number = 7): Activity[] => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return activities.filter(activity => {
      const dueDate = new Date(activity.due_date);
      return dueDate >= now && dueDate <= futureDate;
    });
  }, [activities]);
  
  const getActivitiesByStatus = useCallback((status: string): Activity[] => {
    return activities.filter(activity => activity.status === status);
  }, [activities]);
  
  const getActivitiesByPriority = useCallback((priority: "low" | "medium" | "high"): Activity[] => {
    return activities.filter(activity => activity.priority === priority);
  }, [activities]);
  
  const getActivitiesCompletionRate = useCallback((): number => {
    if (activities.length === 0) return 0;
    const completed = activities.filter(activity => activity.status === 'completed').length;
    return Math.round((completed / activities.length) * 100);
  }, [activities]);
  
  // Optimized opportunities methods
  const getOpportunitiesOptimized = useCallback(async (useCache: boolean = true): Promise<Opportunity[]> => {
    if (useCache && isCacheValid(cache.opportunities, CACHE_DURATION.DYNAMIC)) {
      return cache.opportunities!.data;
    }
    
    setIsLoadingOpportunities(true);
    setOpportunitiesError(null);
    try {
      // @ts-ignore
      const data = await api.crm.getOpportunities();
      setOpportunities(data);
      setCache(prev => ({
        ...prev,
        opportunities: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load opportunities";
      setOpportunitiesError(errorMessage);
      throw err;
    } finally {
      setIsLoadingOpportunities(false);
    }
  }, [cache.opportunities]);
  
  const getOpportunitiesByAccount = useCallback((accountId: string): Opportunity[] => {
    return opportunities.filter(opp => opp.account_id === accountId);
  }, [opportunities]);
  
  const getOpportunitiesByContact = useCallback((contactId: string): Opportunity[] => {
    return opportunities.filter(opp => opp.contact_id === contactId);
  }, [opportunities]);
  
  const getOpportunitiesByStage = useCallback((stageId: string): Opportunity[] => {
    return opportunities.filter(opp => opp.stage_id === stageId);
  }, [opportunities]);
  
  const getTotalOpportunityValue = useCallback((): number => {
    return opportunities.reduce((total, opp) => total + (opp.amount || 0), 0);
  }, [opportunities]);
  
  // Optimized stages methods
  const getStagesOptimized = useCallback(async (useCache: boolean = true): Promise<Stage[]> => {
    if (useCache && isCacheValid(cache.stages, CACHE_DURATION.STATIC)) {
      return cache.stages!.data;
    }
    
    setIsLoadingStages(true);
    setStagesError(null);
    try {
      // @ts-ignore
      const data = await api.crm.getStages();
      setStages(data);
      setCache(prev => ({
        ...prev,
        stages: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load stages";
      setStagesError(errorMessage);
      throw err;
    } finally {
      setIsLoadingStages(false);
    }
  }, [cache.stages]);
  
  const getActiveStages = useCallback((): Stage[] => {
    return stages.filter(stage => stage.is_active);
  }, [stages]);
  
  const getStageByName = useCallback((name: string): Stage | null => {
    return stages.find(stage => stage.name === name) || null;
  }, [stages]);
  
  // Optimized pipelines methods
  const getPipelinesOptimized = useCallback(async (useCache: boolean = true): Promise<Pipeline[]> => {
    if (useCache && isCacheValid(cache.pipelines, CACHE_DURATION.STATIC)) {
      return cache.pipelines!.data;
    }
    
    setIsLoadingPipelines(true);
    setPipelinesError(null);
    try {
      // @ts-ignore
      const data = await api.crm.getPipelines();
      setPipelines(data);
      setCache(prev => ({
        ...prev,
        pipelines: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load pipelines";
      setPipelinesError(errorMessage);
      throw err;
    } finally {
      setIsLoadingPipelines(false);
    }
  }, [cache.pipelines]);
  
  const getPipelineByName = useCallback((name: string): Pipeline | null => {
    return pipelines.find(pipeline => pipeline.name === name) || null;
  }, [pipelines]);
  
  // ================================
  // STANDARD CRUD OPERATIONS
  // ================================
  
  const fetchActivities = useCallback(async (params?: any) => {
    await getActivitiesOptimized(false); // Force fresh fetch
  }, [getActivitiesOptimized]);
  
  const fetchOpportunities = useCallback(async (params?: any) => {
    await getOpportunitiesOptimized(false); // Force fresh fetch
  }, [getOpportunitiesOptimized]);
  
  const fetchLeads = useCallback(async (params?: any) => {
    setIsLoadingLeads(true);
    setLeadsError(null);
    try {
      // @ts-ignore
      const data = await api.crm.getLeads(params);
      setLeads(data);
      setCache(prev => ({
        ...prev,
        leads: { data, timestamp: Date.now() }
      }));
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load leads";
      setLeadsError(errorMessage);
    } finally {
      setIsLoadingLeads(false);
    }
  }, []);
  
  const fetchContacts = useCallback(async (params?: any) => {
    setIsLoadingContacts(true);
    setContactsError(null);
    try {
      // @ts-ignore
      const data = await api.crm.getContacts(params);
      setContacts(data);
      setCache(prev => ({
        ...prev,
        contacts: { data, timestamp: Date.now() }
      }));
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load contacts";
      setContactsError(errorMessage);
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);
  
  const fetchAccounts = useCallback(async (params?: any) => {
    setIsLoadingAccounts(true);
    setAccountsError(null);
    try {
      // @ts-ignore
      const data = await api.crm.getAccounts(params);
      setAccounts(data);
      setCache(prev => ({
        ...prev,
        accounts: { data, timestamp: Date.now() }
      }));
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load accounts";
      setAccountsError(errorMessage);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);
  
  const fetchStages = useCallback(async () => {
    await getStagesOptimized(false); // Force fresh fetch
  }, [getStagesOptimized]);
  
  const fetchPipelines = useCallback(async (params?: any) => {
    await getPipelinesOptimized(false); // Force fresh fetch
  }, [getPipelinesOptimized]);
  
  const fetchNotes = useCallback(async (params?: any) => {
    setIsLoadingNotes(true);
    setNotesError(null);
    try {
      // @ts-ignore
      const data = await api.crm.getNotes(params);
      setNotes(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load notes";
      setNotesError(errorMessage);
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);
  
  // ================================
  // CACHE MANAGEMENT
  // ================================
  
  const clearCache = useCallback(() => {
    setCache({
      activities: null,
      opportunities: null,
      leads: null,
      contacts: null,
      accounts: null,
      stages: null,
      pipelines: null,
    });
    console.log("CRM cache cleared");
  }, []);
  
  const invalidateCache = useCallback((type?: keyof CRMCache) => {
    if (type) {
      setCache(prev => ({ ...prev, [type]: null }));
    } else {
      clearCache();
    }
  }, [clearCache]);
  
  const refreshData = useCallback(async () => {
    clearCache();
    await Promise.all([
      getActivitiesOptimized(false),
      getOpportunitiesOptimized(false),
      getStagesOptimized(false),
      getPipelinesOptimized(false),
    ]);
  }, [clearCache, getActivitiesOptimized, getOpportunitiesOptimized, getStagesOptimized, getPipelinesOptimized]);
  
  // Auto-initialize data on auth
  useEffect(() => {
    if (isAuthenticated) {
      // Load static data immediately
      getStagesOptimized();
      getPipelinesOptimized();
    } else {
      clearCache();
    }
  }, [isAuthenticated, getStagesOptimized, getPipelinesOptimized, clearCache]);
  
  const value: CRMContextType = {
    // Cache state
    cache,
    
    // Data state
    activities,
    opportunities,
    leads,
    contacts,
    accounts,
    stages,
    pipelines,
    notes,
    
    // Loading states
    isLoadingActivities,
    isLoadingOpportunities,
    isLoadingLeads,
    isLoadingContacts,
    isLoadingAccounts,
    isLoadingStages,
    isLoadingPipelines,
    isLoadingNotes,
    
    // Error states
    activitiesError,
    opportunitiesError,
    leadsError,
    contactsError,
    accountsError,
    stagesError,
    pipelinesError,
    notesError,
    
    // Optimized data access methods
    getActivitiesOptimized,
    getPendingActivities,
    getOverdueActivities,
    getTodaysActivities,
    getUpcomingActivities,
    getActivitiesByStatus,
    getActivitiesByPriority,
    getActivitiesCompletionRate,
    
    getOpportunitiesOptimized,
    getOpportunitiesByAccount,
    getOpportunitiesByContact,
    getOpportunitiesByStage,
    getTotalOpportunityValue,
    
    getStagesOptimized,
    getActiveStages,
    getStageByName,
    
    getPipelinesOptimized,
    getPipelineByName,
    
    // Standard CRUD operations
    fetchActivities,
    fetchOpportunities,
    fetchLeads,
    fetchContacts,
    fetchAccounts,
    fetchStages,
    fetchPipelines,
    fetchNotes,
    
    // Cache management
    clearCache,
    invalidateCache,
    refreshData,
  };
  
  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = (): CRMContextType => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};

export default CRMContext; 