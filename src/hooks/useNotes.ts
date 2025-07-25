import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Note, CreateNoteData, UpdateNoteData, Contact, Opportunity, Lead, Account } from '@/apis/types';

export function useNotes() {
  const { user, apiClient } = useAuth() as any;
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  
  // Related entities state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  const fetchNotes = useCallback(async (params?: any) => {
    if (!user?.company_id) {
      setNotesError('No company ID available');
      return;
    }

    setIsLoadingNotes(true);
    setNotesError(null);
    
    try {
      const response = await apiClient.get('/crm/notes', { params });
      setNotes(response.data.notes || response.data);
    } catch (error: any) {
      console.error('Failed to fetch notes:', error);
      setNotesError(error.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setIsLoadingNotes(false);
    }
  }, [user?.company_id]);

  const createNote = useCallback(async (noteData: CreateNoteData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.post('/crm/notes', noteData);
    return response.data;
  }, [user?.company_id]);

  const updateNote = useCallback(async (noteId: string, noteData: UpdateNoteData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.patch(`/crm/notes/${noteId}`, noteData);
    return response.data;
  }, [user?.company_id]);

  const deleteNote = useCallback(async (noteId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/crm/notes/${noteId}`);
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
      fetchNotes();
      fetchAllRelatedEntities();
    }
  }, [user?.company_id, fetchNotes, fetchAllRelatedEntities]);

  return {
    notes,
    isLoadingNotes,
    notesError,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
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