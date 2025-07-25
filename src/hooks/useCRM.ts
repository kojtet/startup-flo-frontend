import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Lead, CreateLeadData, UpdateLeadData, Category, CreateCategoryData, UpdateCategoryData, Contact, CreateContactData, UpdateContactData, Account, CreateAccountData, UpdateAccountData, Opportunity, CreateOpportunityData, UpdateOpportunityData, Stage, CreateStageData, UpdateStageData } from '@/apis';

export function useCRM() {
  const { user, apiClient } = useAuth() as any;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  const [stagesError, setStagesError] = useState<string | null>(null);

  const fetchLeads = useCallback(async (params?: any) => {
    if (!user?.company_id) {
      setLeadsError('No company ID available');
      return;
    }

    setIsLoadingLeads(true);
    setLeadsError(null);
    
    try {
      const response = await apiClient.get('/crm/leads', { params });
      console.log('Leads API response:', response.data);
      // Handle potential nested structure: response.data.leads or response.data
      setLeads(response.data.leads || response.data);
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
      setLeadsError(error.response?.data?.message || 'Failed to fetch leads');
    } finally {
      setIsLoadingLeads(false);
    }
  }, [user?.company_id, apiClient]);

  const createLead = useCallback(async (leadData: CreateLeadData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const leadPayload = {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone || null,
      source: leadData.source || null,
      company: leadData.company || null,
      title: leadData.title || null,
      category_id: leadData.category_id || null,
      company_id: user.company_id,
      created_by: user.id,
      status: 'new'
    };

    console.log('Creating lead with payload:', leadPayload);
    try {
      const response = await apiClient.post('/crm/leads', leadPayload);
      return response.data;
    } catch (error: any) {
      console.error('Lead creation error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }, [user?.company_id, user?.id, apiClient]);

  const updateLead = useCallback(async (leadId: string, leadData: UpdateLeadData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.patch(`/crm/leads/${leadId}`, leadData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteLead = useCallback(async (leadId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/crm/leads/${leadId}`);
  }, [user?.company_id, apiClient]);

  const getLeadById = useCallback(async (leadId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.get(`/crm/leads/${leadId}`);
    return response.data;
  }, [user?.company_id, apiClient]);

  // Category functions
  const fetchCategories = useCallback(async () => {
    if (!user?.company_id) {
      setCategoriesError('No company ID available');
      return;
    }

    setIsLoadingCategories(true);
    setCategoriesError(null);
    
    try {
      const response = await apiClient.get('/crm/categories');
      console.log('Categories API response:', response.data);
      // Handle the nested structure: response.data.categories
      setCategories(response.data.categories || response.data);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      setCategoriesError(error.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setIsLoadingCategories(false);
    }
  }, [user?.company_id, apiClient]);

  const createCategory = useCallback(async (categoryData: CreateCategoryData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const categoryPayload = {
      ...categoryData,
      company_id: user.company_id
    };

    const response = await apiClient.post('/crm/categories', categoryPayload);
    return response.data;
  }, [user?.company_id, apiClient]);

  const updateCategory = useCallback(async (categoryId: string, categoryData: UpdateCategoryData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.patch(`/crm/categories/${categoryId}`, categoryData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/crm/categories/${categoryId}`);
  }, [user?.company_id, apiClient]);

  // Contact functions
  const fetchContacts = useCallback(async (params?: any) => {
    if (!user?.company_id) {
      setContactsError('No company ID available');
      return;
    }

    setIsLoadingContacts(true);
    setContactsError(null);
    
    try {
      const response = await apiClient.get('/crm/contacts', { params });
      console.log('Contacts API response:', response.data);
      // Handle potential nested structure: response.data.contacts or response.data
      setContacts(response.data.contacts || response.data);
    } catch (error: any) {
      console.error('Failed to fetch contacts:', error);
      setContactsError(error.response?.data?.message || 'Failed to fetch contacts');
    } finally {
      setIsLoadingContacts(false);
    }
  }, [user?.company_id, apiClient]);

  const createContact = useCallback(async (contactData: CreateContactData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const contactPayload = {
      lead_id: contactData.lead_id || null,
      first_name: contactData.first_name,
      last_name: contactData.last_name,
      email: contactData.email,
      phone: contactData.phone || null,
      position: contactData.position || null,
      account_id: contactData.account_id || null
    };

    console.log('Creating contact with payload:', contactPayload);
    try {
      const response = await apiClient.post('/crm/contacts', contactPayload);
      return response.data;
    } catch (error: any) {
      console.error('Contact creation error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }, [user?.company_id, apiClient]);

  const updateContact = useCallback(async (contactId: string, contactData: UpdateContactData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.patch(`/crm/contacts/${contactId}`, contactData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteContact = useCallback(async (contactId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/crm/contacts/${contactId}`);
  }, [user?.company_id, apiClient]);

  const getContactById = useCallback(async (contactId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.get(`/crm/contacts/${contactId}`);
    return response.data;
  }, [user?.company_id, apiClient]);

  // Account functions
  const fetchAccounts = useCallback(async (params?: any) => {
    if (!user?.company_id) {
      setAccountsError('No company ID available');
      return;
    }

    setIsLoadingAccounts(true);
    setAccountsError(null);
    
    try {
      const response = await apiClient.get('/crm/accounts', { params });
      console.log('Accounts API response:', response.data);
      // Handle potential nested structure: response.data.accounts or response.data
      setAccounts(response.data.accounts || response.data);
    } catch (error: any) {
      console.error('Failed to fetch accounts:', error);
      setAccountsError(error.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [user?.company_id, apiClient]);

  const createAccount = useCallback(async (accountData: CreateAccountData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const accountPayload = {
      name: accountData.name,
      industry: accountData.industry || null,
      website: accountData.website || null,
      notes: accountData.notes || null
    };

    console.log('Creating account with payload:', accountPayload);
    try {
      const response = await apiClient.post('/crm/accounts', accountPayload);
      return response.data;
    } catch (error: any) {
      console.error('Account creation error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }, [user?.company_id, apiClient]);

  const updateAccount = useCallback(async (accountId: string, accountData: UpdateAccountData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/crm/accounts/${accountId}`, accountData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteAccount = useCallback(async (accountId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/crm/accounts/${accountId}`);
  }, [user?.company_id, apiClient]);

  const getAccountById = useCallback(async (accountId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.get(`/crm/accounts/${accountId}`);
    return response.data;
  }, [user?.company_id, apiClient]);

  // Opportunity functions
  const fetchOpportunities = useCallback(async (params?: any) => {
    if (!user?.company_id) {
      setOpportunitiesError('No company ID available');
      return;
    }

    setIsLoadingOpportunities(true);
    setOpportunitiesError(null);
    
    try {
      const response = await apiClient.get('/crm/opportunities', { params });
      console.log('Opportunities API response:', response.data);
      // Handle potential nested structure: response.data.opportunities or response.data
      setOpportunities(response.data.opportunities || response.data);
    } catch (error: any) {
      console.error('Failed to fetch opportunities:', error);
      setOpportunitiesError(error.response?.data?.message || 'Failed to fetch opportunities');
    } finally {
      setIsLoadingOpportunities(false);
    }
  }, [user?.company_id, apiClient]);

  const createOpportunity = useCallback(async (opportunityData: CreateOpportunityData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const opportunityPayload = {
      account_id: opportunityData.account_id,
      contact_id: opportunityData.contact_id,
      name: opportunityData.name,
      amount: opportunityData.amount,
      stage_id: opportunityData.stage_id,
      owner_id: opportunityData.owner_id || user.id,
      status: opportunityData.status,
      expected_close: opportunityData.expected_close
    };

    console.log('Creating opportunity with payload:', opportunityPayload);
    try {
      const response = await apiClient.post('/crm/opportunities', opportunityPayload);
      return response.data;
    } catch (error: any) {
      console.error('Opportunity creation error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }, [user?.company_id, user?.id, apiClient]);

  const updateOpportunity = useCallback(async (opportunityId: string, opportunityData: UpdateOpportunityData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/crm/opportunities/${opportunityId}`, opportunityData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteOpportunity = useCallback(async (opportunityId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/crm/opportunities/${opportunityId}`);
  }, [user?.company_id, apiClient]);

  const getOpportunityById = useCallback(async (opportunityId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.get(`/crm/opportunities/${opportunityId}`);
    return response.data;
  }, [user?.company_id, apiClient]);

  const moveOpportunityToStage = useCallback(async (opportunityId: string, data: { stage_id: string }) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.patch(`/crm/opportunities/${opportunityId}/stage`, data);
    return response.data;
  }, [user?.company_id, apiClient]);

  // Convert lead to opportunity
  const convertLeadToOpportunity = useCallback(async (leadId: string, opportunityData: {
    name: string;
    amount: number;
    account_id: string;
    contact_id: string;
    stage_id: string;
    expected_close: string;
  }) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    try {
      // Validate required fields
      if (!leadId) {
        throw new Error('Lead ID is required');
      }
      if (!opportunityData.account_id || !opportunityData.contact_id || !opportunityData.stage_id) {
        throw new Error('Missing required fields: account_id, contact_id, or stage_id');
      }

      // Create the opportunity with the full payload
      const opportunityPayload = {
        account_id: opportunityData.account_id,
        contact_id: opportunityData.contact_id,
        name: opportunityData.name,
        amount: Number(opportunityData.amount), // Ensure it's a number
        stage_id: opportunityData.stage_id,
        owner_id: user.id,
        status: 'open' as const,
        expected_close: opportunityData.expected_close
      };

      console.log('Creating opportunity with payload:', opportunityPayload);
      const opportunityResponse = await apiClient.post('/crm/opportunities', opportunityPayload);
      console.log('Opportunity created successfully:', opportunityResponse.data);

      // Try to update the lead status, but don't fail if it doesn't work
      try {
        console.log('Updating lead status to contacted for lead ID:', leadId);
        await apiClient.patch(`/crm/leads/${leadId}`, { status: 'contacted' });
        console.log('Lead status updated successfully');
      } catch (statusError: any) {
        console.warn('Failed to update lead status, but opportunity was created successfully:', {
          status: statusError.response?.status,
          data: statusError.response?.data,
          message: statusError.message
        });
        // Don't throw the error since the opportunity was created successfully
      }

      return {
        opportunity: opportunityResponse.data
      };
    } catch (error: any) {
      console.error('Lead conversion error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        opportunityPayload: opportunityData,
        leadId
      });
      throw error;
    }
  }, [user?.company_id, user?.id, apiClient]);

  // Stage functions
  const fetchStages = useCallback(async () => {
    if (!user?.company_id) {
      setStagesError('No company ID available');
      return;
    }

    setIsLoadingStages(true);
    setStagesError(null);
    
    try {
      const response = await apiClient.get('/crm/stages');
      console.log('Stages API response:', response.data);
      // Handle potential nested structure: response.data.stages or response.data
      setStages(response.data.stages || response.data);
    } catch (error: any) {
      console.error('Failed to fetch stages:', error);
      setStagesError(error.response?.data?.message || 'Failed to fetch stages');
    } finally {
      setIsLoadingStages(false);
    }
  }, [user?.company_id, apiClient]);

  const createStage = useCallback(async (stageData: CreateStageData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const stagePayload = {
      ...stageData,
      company_id: user.company_id,
      created_by: user.id
    };

    const response = await apiClient.post('/crm/stages', stagePayload);
    return response.data;
  }, [user?.company_id, user?.id, apiClient]);

  const updateStage = useCallback(async (stageId: string, stageData: UpdateStageData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/crm/stages/${stageId}`, stageData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteStage = useCallback(async (stageId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/crm/stages/${stageId}`);
  }, [user?.company_id, apiClient]);

  const getStageById = useCallback(async (stageId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.get(`/crm/stages/${stageId}`);
    return response.data;
  }, [user?.company_id, apiClient]);

  useEffect(() => {
    if (user?.company_id) {
      fetchLeads();
      fetchCategories();
      fetchContacts();
      fetchAccounts();
      fetchOpportunities();
      fetchStages();
    }
  }, [user?.company_id, fetchLeads, fetchCategories, fetchContacts, fetchAccounts, fetchOpportunities, fetchStages]);

  return {
    // Leads
    leads,
    isLoadingLeads,
    leadsError,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    getLeadById,
    
    // Categories
    categories,
    isLoadingCategories,
    categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Contacts
    contacts,
    isLoadingContacts,
    contactsError,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    getContactById,
    
    // Accounts
    accounts,
    isLoadingAccounts,
    accountsError,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    
    // Opportunities
    opportunities,
    isLoadingOpportunities,
    opportunitiesError,
    fetchOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    getOpportunityById,
    moveOpportunityToStage,
    convertLeadToOpportunity,
    
    // Stages
    stages,
    isLoadingStages,
    stagesError,
    fetchStages,
    createStage,
    updateStage,
    deleteStage,
    getStageById,
  };
} 