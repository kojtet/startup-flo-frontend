import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Activity, CreateActivityData, UpdateActivityData, Contact, Opportunity, Lead, Account } from '@/apis/types';

export function useActivities() {
  const { user, apiClient } = useAuth() as any;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  
  // Related entities state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  const fetchActivities = useCallback(async (params?: any) => {
    if (!user?.company_id) {
      setActivitiesError('No company ID available');
      return;
    }

    setIsLoadingActivities(true);
    setActivitiesError(null);
    
    try {
      const response = await apiClient.get('/crm/activities', { params });
      setActivities(response.data.activities || response.data);
    } catch (error: any) {
      console.error('Failed to fetch activities:', error);
      setActivitiesError(error.response?.data?.message || 'Failed to fetch activities');
    } finally {
      setIsLoadingActivities(false);
    }
  }, [user?.company_id]);

  const createActivity = useCallback(async (activityData: CreateActivityData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.post('/crm/activities', activityData);
    return response.data;
  }, [user?.company_id]);

  const updateActivity = useCallback(async (activityId: string, activityData: UpdateActivityData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.patch(`/crm/activities/${activityId}`, activityData);
    return response.data;
  }, [user?.company_id]);

  const deleteActivity = useCallback(async (activityId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/crm/activities/${activityId}`);
  }, [user?.company_id]);

  const markActivityAsCompleted = useCallback(async (activityId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.patch(`/crm/activities/${activityId}/complete`);
    return response.data;
  }, [user?.company_id]);

  // Fetch related entities
  const fetchContacts = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      const response = await apiClient.get('/crm/contacts');
      setContacts(response.data.contacts || response.data);
    } catch (error: any) {
      console.error('Failed to fetch contacts:', error);
    }
  }, [user?.company_id]);

  const fetchOpportunities = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      const response = await apiClient.get('/crm/opportunities');
      setOpportunities(response.data.opportunities || response.data);
    } catch (error: any) {
      console.error('Failed to fetch opportunities:', error);
    }
  }, [user?.company_id]);

  const fetchLeads = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      const response = await apiClient.get('/crm/leads');
      setLeads(response.data.leads || response.data);
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
    }
  }, [user?.company_id]);

  const fetchAccounts = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      const response = await apiClient.get('/crm/accounts');
      setAccounts(response.data.accounts || response.data);
    } catch (error: any) {
      console.error('Failed to fetch accounts:', error);
    }
  }, [user?.company_id]);

  const fetchAllRelatedEntities = useCallback(async () => {
    if (!user?.company_id) return;

    setIsLoadingRelated(true);
    try {
      await Promise.all([
        fetchContacts(),
        fetchOpportunities(),
        fetchLeads(),
        fetchAccounts()
      ]);
    } catch (error) {
      console.error('Failed to fetch related entities:', error);
    } finally {
      setIsLoadingRelated(false);
    }
  }, [user?.company_id, fetchContacts, fetchOpportunities, fetchLeads, fetchAccounts]);

  useEffect(() => {
    if (user?.company_id) {
      fetchActivities();
      fetchAllRelatedEntities();
    }
  }, [user?.company_id, fetchActivities, fetchAllRelatedEntities]);

  return {
    activities,
    isLoadingActivities,
    activitiesError,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    markActivityAsCompleted,
    // Related entities
    contacts,
    opportunities,
    leads,
    accounts,
    isLoadingRelated,
    fetchContacts,
    fetchOpportunities,
    fetchLeads,
    fetchAccounts,
    fetchAllRelatedEntities
  };
} 