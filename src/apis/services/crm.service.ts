import { ApiClient, type ApiConfigOverride } from "../core/client";
import { CRM_ENDPOINTS } from "../endpoints/crm";
import { handleApiError } from "../core/errors";
import type {
  Lead,
  CreateLeadData,
  UpdateLeadData,
  LeadsResponse,
  LeadResponse,
  Contact,
  CreateContactData,
  UpdateContactData,
  ContactsResponse,
  ContactResponse,
  Account,
  CreateAccountData,
  UpdateAccountData,
  AccountsResponse,
  AccountResponse,
  Pipeline,
  CreatePipelineData,
  UpdatePipelineData,
  PipelinesResponse,
  PipelineResponse,
  Stage,
  StagesResponse,
  StageResponse,
  Opportunity,
  CreateOpportunityData,
  UpdateOpportunityData,
  MoveOpportunityStageData,
  OpportunitiesResponse,
  OpportunityResponse,
  Activity,
  CreateActivityData,
  UpdateActivityData,
  UpdateActivityStatusData,
  ActivitiesResponse,
  ActivityResponse,
  Note,
  CreateNoteData,
  UpdateNoteData,
  NotesResponse,
  NoteResponse,
} from "../types";

export class CRMService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ================================
  // LEAD MANAGEMENT
  // ================================

  /**
   * Get all leads
   * GET /crm/leads
   * Response: { leads: Lead[] }
   */
  async getLeads(params?: { page?: number; limit?: number; status?: string; assigned_to?: string }, config?: ApiConfigOverride): Promise<Lead[]> {
    try {
      const response = await this.apiClient.get<LeadsResponse>(CRM_ENDPOINTS.LEADS_LIST, { ...config, params });
      return response.data.leads;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new lead
   * POST /crm/leads
   * Body: {
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "phone": "+1234567890",
   *   "source": "Website",
   *   "status": "new",
   *   "assigned_to": "user-id"
   * }
   * Response: Lead
   */
  async createLead(data: CreateLeadData, config?: ApiConfigOverride): Promise<Lead> {
    try {
      const response = await this.apiClient.post<Lead>(CRM_ENDPOINTS.LEADS_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single lead by ID
   * GET /crm/leads/:id
   * Response: { lead: Lead }
   */
  async getLeadById(leadId: string, config?: ApiConfigOverride): Promise<Lead> {
    try {
      const response = await this.apiClient.get<LeadResponse>(CRM_ENDPOINTS.LEAD_DETAIL(leadId), config);
      return response.data.lead;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update lead
   * PATCH /crm/leads/:id
   * Body: {
   *   "name"?: "John Doe",
   *   "email"?: "john@example.com",
   *   "phone"?: "+1234567890",
   *   "source"?: "Website",
   *   "status"?: "contacted",
   *   "assigned_to"?: "user-id"
   * }
   * Response: Lead
   */
  async updateLead(leadId: string, data: UpdateLeadData, config?: ApiConfigOverride): Promise<Lead> {
    try {
      const response = await this.apiClient.patch<Lead>(CRM_ENDPOINTS.LEAD_DETAIL(leadId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete lead
   * DELETE /crm/leads/:id
   * Response: void
   */
  async deleteLead(leadId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(CRM_ENDPOINTS.LEAD_DETAIL(leadId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // CONTACT MANAGEMENT
  // ================================

  /**
   * Get all contacts
   * GET /crm/contacts
   * Response: { contacts: Contact[] }
   */
  async getContacts(params?: { page?: number; limit?: number; lead_id?: string; account_id?: string }, config?: ApiConfigOverride): Promise<Contact[]> {
    try {
      const response = await this.apiClient.get<ContactsResponse>(CRM_ENDPOINTS.CONTACTS_LIST, { ...config, params });
      return response.data.contacts;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new contact
   * POST /crm/contacts
   * Body: {
   *   "lead_id": "lead-id",
   *   "first_name": "John",
   *   "last_name": "Doe",
   *   "email": "john@example.com",
   *   "phone": "+1234567890",
   *   "position": "CEO",
   *   "account_id": "account-id"
   * }
   * Response: Contact
   */
  async createContact(data: CreateContactData, config?: ApiConfigOverride): Promise<Contact> {
    try {
      const response = await this.apiClient.post<Contact>(CRM_ENDPOINTS.CONTACTS_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single contact by ID
   * GET /crm/contacts/:id
   * Response: { contact: Contact }
   */
  async getContactById(contactId: string, config?: ApiConfigOverride): Promise<Contact> {
    try {
      const response = await this.apiClient.get<ContactResponse>(CRM_ENDPOINTS.CONTACT_DETAIL(contactId), config);
      return response.data.contact;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update contact
   * PATCH /crm/contacts/:id
   * Body: {
   *   "lead_id"?: "lead-id",
   *   "first_name"?: "John",
   *   "last_name"?: "Doe",
   *   "email"?: "john@example.com",
   *   "phone"?: "+1234567890",
   *   "position"?: "CEO",
   *   "account_id"?: "account-id"
   * }
   * Response: Contact
   */
  async updateContact(contactId: string, data: UpdateContactData, config?: ApiConfigOverride): Promise<Contact> {
    try {
      const response = await this.apiClient.patch<Contact>(CRM_ENDPOINTS.CONTACT_DETAIL(contactId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete contact
   * DELETE /crm/contacts/:id
   * Response: void
   */
  async deleteContact(contactId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(CRM_ENDPOINTS.CONTACT_DETAIL(contactId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ACCOUNT MANAGEMENT
  // ================================

  /**
   * Get all accounts
   * GET /crm/accounts
   * Response: { accounts: Account[] }
   */
  async getAccounts(params?: { page?: number; limit?: number; industry?: string }, config?: ApiConfigOverride): Promise<Account[]> {
    try {
      const response = await this.apiClient.get<AccountsResponse>(CRM_ENDPOINTS.ACCOUNTS_LIST, { ...config, params });
      return response.data.accounts;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new account
   * POST /crm/accounts
   * Body: {
   *   "name": "Acme Corp",
   *   "industry": "Technology",
   *   "website": "https://acme.com",
   *   "notes": "Key account"
   * }
   * Response: Account
   */
  async createAccount(data: CreateAccountData, config?: ApiConfigOverride): Promise<Account> {
    try {
      const response = await this.apiClient.post<Account>(CRM_ENDPOINTS.ACCOUNTS_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single account by ID
   * GET /crm/accounts/:id
   * Response: { account: Account }
   */
  async getAccountById(accountId: string, config?: ApiConfigOverride): Promise<Account> {
    try {
      const response = await this.apiClient.get<AccountResponse>(CRM_ENDPOINTS.ACCOUNT_DETAIL(accountId), config);
      return response.data.account;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update account
   * PATCH /crm/accounts/:id
   * Body: {
   *   "name"?: "Acme Corp",
   *   "industry"?: "Technology",
   *   "website"?: "https://acme.com",
   *   "notes"?: "Key account"
   * }
   * Response: Account
   */
  async updateAccount(accountId: string, data: UpdateAccountData, config?: ApiConfigOverride): Promise<Account> {
    try {
      const response = await this.apiClient.patch<Account>(CRM_ENDPOINTS.ACCOUNT_DETAIL(accountId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete account
   * DELETE /crm/accounts/:id
   * Response: void
   */
  async deleteAccount(accountId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(CRM_ENDPOINTS.ACCOUNT_DETAIL(accountId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // PIPELINE MANAGEMENT
  // ================================

  /**
   * Get all pipelines
   * GET /crm/pipelines
   * Response: { pipelines: Pipeline[] }
   */
  async getPipelines(params?: { page?: number; limit?: number }, config?: ApiConfigOverride): Promise<Pipeline[]> {
    try {
      const response = await this.apiClient.get<PipelinesResponse>(CRM_ENDPOINTS.PIPELINES_LIST, { ...config, params });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new pipeline
   * POST /crm/pipelines
   * Body: {
   *   "name": "Sales Pipeline"
   * }
   * Response: Pipeline
   */
  async createPipeline(data: CreatePipelineData, config?: ApiConfigOverride): Promise<Pipeline> {
    try {
      const response = await this.apiClient.post<Pipeline>(CRM_ENDPOINTS.PIPELINES_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single pipeline by ID
   * GET /crm/pipelines/:id
   * Response: { pipeline: Pipeline }
   */
  async getPipelineById(pipelineId: string, config?: ApiConfigOverride): Promise<Pipeline> {
    try {
      const response = await this.apiClient.get<PipelineResponse>(CRM_ENDPOINTS.PIPELINE_DETAIL(pipelineId), config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update pipeline
   * PATCH /crm/pipelines/:id
   * Body: {
   *   "name"?: "Updated Pipeline Name"
   * }
   * Response: Pipeline
   */
  async updatePipeline(pipelineId: string, data: UpdatePipelineData, config?: ApiConfigOverride): Promise<Pipeline> {
    try {
      const response = await this.apiClient.patch<Pipeline>(CRM_ENDPOINTS.PIPELINE_DETAIL(pipelineId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete pipeline
   * DELETE /crm/pipelines/:id
   * Response: void
   */
  async deletePipeline(pipelineId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(CRM_ENDPOINTS.PIPELINE_DETAIL(pipelineId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // STAGE MANAGEMENT
  // ================================

  /**
   * Get all opportunity stages
   * GET /crm/stages
   * Response: { stages: Stage[] }
   */
  async getStages(config?: ApiConfigOverride): Promise<Stage[]> {
    try {
      const response = await this.apiClient.get<StagesResponse>(CRM_ENDPOINTS.STAGES_LIST, config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get next stage in pipeline
   * GET /crm/stages/:stageId/next
   * Response: { stage: Stage }
   */
  async getNextStage(stageId: string, config?: ApiConfigOverride): Promise<Stage> {
    try {
      const response = await this.apiClient.get<StageResponse>(CRM_ENDPOINTS.STAGE_NEXT(stageId), config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get previous stage in pipeline
   * GET /crm/stages/:stageId/previous
   * Response: { stage: Stage }
   */
  async getPreviousStage(stageId: string, config?: ApiConfigOverride): Promise<Stage> {
    try {
      const response = await this.apiClient.get<StageResponse>(CRM_ENDPOINTS.STAGE_PREVIOUS(stageId), config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // OPPORTUNITY MANAGEMENT
  // ================================

  /**
   * Get all opportunities
   * GET /crm/opportunities
   * Response: { opportunities: Opportunity[] }
   */
  async getOpportunities(params?: { page?: number; limit?: number; stage_id?: string; owner_id?: string; status?: string }, config?: ApiConfigOverride): Promise<Opportunity[]> {
    try {
      const response = await this.apiClient.get<OpportunitiesResponse>(CRM_ENDPOINTS.OPPORTUNITIES_LIST, { ...config, params });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new opportunity
   * POST /crm/opportunities
   * Body: {
   *   "account_id": "account-id",
   *   "contact_id": "contact-id",
   *   "name": "Enterprise Deal",
   *   "amount": 50000,
   *   "stage_id": "stage-id",
   *   "owner_id": "owner-id",
   *   "status": "open",
   *   "expected_close": "2024-12-31"
   * }
   * Response: Opportunity
   */
  async createOpportunity(data: CreateOpportunityData, config?: ApiConfigOverride): Promise<Opportunity> {
    try {
      const response = await this.apiClient.post<Opportunity>(CRM_ENDPOINTS.OPPORTUNITIES_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single opportunity by ID
   * GET /crm/opportunities/:id
   * Response: { opportunity: Opportunity }
   */
  async getOpportunityById(opportunityId: string, config?: ApiConfigOverride): Promise<Opportunity> {
    try {
      const response = await this.apiClient.get<OpportunityResponse>(CRM_ENDPOINTS.OPPORTUNITY_DETAIL(opportunityId), config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update opportunity
   * PATCH /crm/opportunities/:id
   * Body: {
   *   "account_id"?: "account-id",
   *   "contact_id"?: "contact-id",
   *   "name"?: "Enterprise Deal",
   *   "amount"?: 50000,
   *   "stage_id"?: "stage-id",
   *   "owner_id"?: "owner-id",
   *   "status"?: "open",
   *   "expected_close"?: "2024-12-31"
   * }
   * Response: Opportunity
   */
  async updateOpportunity(opportunityId: string, data: UpdateOpportunityData, config?: ApiConfigOverride): Promise<Opportunity> {
    try {
      const response = await this.apiClient.patch<Opportunity>(CRM_ENDPOINTS.OPPORTUNITY_DETAIL(opportunityId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete opportunity
   * DELETE /crm/opportunities/:id
   * Response: void
   */
  async deleteOpportunity(opportunityId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(CRM_ENDPOINTS.OPPORTUNITY_DETAIL(opportunityId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Move opportunity to a different stage
   * POST /crm/opportunities/:id/stage
   * Body: {
   *   "stage_id": "new-stage-id"
   * }
   * Response: Opportunity
   */
  async moveOpportunityToStage(opportunityId: string, data: MoveOpportunityStageData, config?: ApiConfigOverride): Promise<Opportunity> {
    try {
      const response = await this.apiClient.post<Opportunity>(CRM_ENDPOINTS.OPPORTUNITY_STAGE(opportunityId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ACTIVITY MANAGEMENT
  // ================================

  /**
   * Get all activities
   * GET /crm/activities
   * Response: { activities: Activity[] }
   */
  async getActivities(params?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    priority?: string; 
    status?: string;
    lead_id?: string;
    contact_id?: string;
    account_id?: string;
    opportunity_id?: string;
    assigned_to?: string;
  }, config?: ApiConfigOverride): Promise<Activity[]> {
    try {
      const response = await this.apiClient.get<ActivitiesResponse>(CRM_ENDPOINTS.ACTIVITIES_LIST, { ...config, params });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new activity
   * POST /crm/activities
   * Body: {
   *   "type": "meeting",
   *   "title": "Enterprise Deal - Initial Discovery Meeting",
   *   "description": "Initial meeting with the client to discuss their requirements and explore potential solutions for the enterprise deal",
   *   "priority": "high",
   *   "due_date": "2024-03-20",
   *   "start_time": "2024-03-20T10:00:00Z",
   *   "end_time": "2024-03-20T11:00:00Z",
   *   "location": "Conference Room A",
   *   "lead_id": "lead-id",
   *   "contact_id": "contact-id",
   *   "account_id": "account-id",
   *   "opportunity_id": "opportunity-id",
   *   "assigned_to": "user-id"
   * }
   * Response: Activity
   */
  async createActivity(data: CreateActivityData, config?: ApiConfigOverride): Promise<Activity> {
    try {
      const response = await this.apiClient.post<Activity>(CRM_ENDPOINTS.ACTIVITIES_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single activity by ID
   * GET /crm/activities/:id
   * Response: { activity: Activity }
   */
  async getActivityById(activityId: string, config?: ApiConfigOverride): Promise<Activity> {
    try {
      const response = await this.apiClient.get<ActivityResponse>(CRM_ENDPOINTS.ACTIVITY_DETAIL(activityId), config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update activity
   * PATCH /crm/activities/:id
   * Body: {
   *   "type"?: "meeting",
   *   "title"?: "Updated Meeting Title",
   *   "description"?: "Updated description",
   *   "priority"?: "medium",
   *   "due_date"?: "2024-03-21",
   *   "start_time"?: "2024-03-21T10:00:00Z",
   *   "end_time"?: "2024-03-21T11:00:00Z",
   *   "location"?: "Conference Room B",
   *   "lead_id"?: "lead-id",
   *   "contact_id"?: "contact-id",
   *   "account_id"?: "account-id",
   *   "opportunity_id"?: "opportunity-id",
   *   "assigned_to"?: "user-id",
   *   "status"?: "completed"
   * }
   * Response: Activity
   */
  async updateActivity(activityId: string, data: UpdateActivityData, config?: ApiConfigOverride): Promise<Activity> {
    try {
      const response = await this.apiClient.patch<Activity>(CRM_ENDPOINTS.ACTIVITY_DETAIL(activityId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete activity
   * DELETE /crm/activities/:id
   * Response: void
   */
  async deleteActivity(activityId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(CRM_ENDPOINTS.ACTIVITY_DETAIL(activityId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update activity status
   * PATCH /crm/activities/:id/status
   * Body: {
   *   "status": "completed"
   * }
   * Response: Activity
   */
  async updateActivityStatus(activityId: string, data: UpdateActivityStatusData, config?: ApiConfigOverride): Promise<Activity> {
    try {
      const response = await this.apiClient.patch<Activity>(CRM_ENDPOINTS.ACTIVITY_STATUS(activityId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // NOTE MANAGEMENT
  // ================================

  /**
   * Get all notes
   * GET /crm/notes
   * Response: { notes: Note[] }
   */
  async getNotes(params?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    entity_type?: string; 
    entity_id?: string;
    created_by?: string;
  }, config?: ApiConfigOverride): Promise<Note[]> {
    try {
      const response = await this.apiClient.get<NotesResponse>(CRM_ENDPOINTS.NOTES_LIST, { ...config, params });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new note
   * POST /crm/notes
   * Body: {
   *   "type": "attachment",
   *   "content": "Meeting notes from client call",
   *   "entity_type": "opportunity",
   *   "entity_id": "opportunity-id",
   *   "file_url": "https://example.com/file.pdf",
   *   "file_name": "meeting_notes.pdf",
   *   "file_type": "application/pdf",
   *   "file_size": 1024
   * }
   * Response: Note
   */
  async createNote(data: CreateNoteData, config?: ApiConfigOverride): Promise<Note> {
    try {
      const response = await this.apiClient.post<Note>(CRM_ENDPOINTS.NOTES_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single note by ID
   * GET /crm/notes/:id
   * Response: { note: Note }
   */
  async getNoteById(noteId: string, config?: ApiConfigOverride): Promise<Note> {
    try {
      const response = await this.apiClient.get<NoteResponse>(CRM_ENDPOINTS.NOTE_DETAIL(noteId), config);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update note
   * PATCH /crm/notes/:id
   * Body: {
   *   "type"?: "attachment",
   *   "content"?: "Updated meeting notes",
   *   "entity_type"?: "opportunity",
   *   "entity_id"?: "opportunity-id",
   *   "file_url"?: "https://example.com/updated-file.pdf",
   *   "file_name"?: "updated_notes.pdf",
   *   "file_type"?: "application/pdf",
   *   "file_size"?: 2048
   * }
   * Response: Note
   */
  async updateNote(noteId: string, data: UpdateNoteData, config?: ApiConfigOverride): Promise<Note> {
    try {
      const response = await this.apiClient.patch<Note>(CRM_ENDPOINTS.NOTE_DETAIL(noteId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete note
   * DELETE /crm/notes/:id
   * Response: void
   */
  async deleteNote(noteId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(CRM_ENDPOINTS.NOTE_DETAIL(noteId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  // Lead utility methods
  async getLeadsByStatus(status: string, config?: ApiConfigOverride): Promise<Lead[]> {
    return this.getLeads({ status }, config);
  }

  async getLeadsByAssignee(userId: string, config?: ApiConfigOverride): Promise<Lead[]> {
    return this.getLeads({ assigned_to: userId }, config);
  }

  async updateLeadStatus(leadId: string, status: Lead['status'], config?: ApiConfigOverride): Promise<Lead> {
    return this.updateLead(leadId, { status }, config);
  }

  async assignLead(leadId: string, userId: string, config?: ApiConfigOverride): Promise<Lead> {
    return this.updateLead(leadId, { status: 'contacted' } as UpdateLeadData, config);
  }

  // Contact utility methods
  async getContactsByLead(leadId: string, config?: ApiConfigOverride): Promise<Contact[]> {
    return this.getContacts({ lead_id: leadId }, config);
  }

  async getContactsByAccount(accountId: string, config?: ApiConfigOverride): Promise<Contact[]> {
    return this.getContacts({ account_id: accountId }, config);
  }

  async createContactFromLead(leadId: string, contactData: Omit<CreateContactData, 'lead_id'>, config?: ApiConfigOverride): Promise<Contact> {
    return this.createContact({ ...contactData, lead_id: leadId }, config);
  }

  // Account utility methods
  async getAccountsByIndustry(industry: string, config?: ApiConfigOverride): Promise<Account[]> {
    return this.getAccounts({ industry }, config);
  }

  // Pipeline utility methods
  async getPipelineByName(name: string, config?: ApiConfigOverride): Promise<Pipeline | null> {
    const pipelines = await this.getPipelines({}, config);
    return pipelines.find(pipeline => pipeline.name === name) || null;
  }

  // Stage utility methods
  async getStagesByOrder(config?: ApiConfigOverride): Promise<Stage[]> {
    const stages = await this.getStages(config);
    return stages.sort((a, b) => a.order_index - b.order_index);
  }

  async getActiveStages(config?: ApiConfigOverride): Promise<Stage[]> {
    const stages = await this.getStages(config);
    return stages.filter(stage => stage.is_active);
  }

  async getStageByName(name: string, config?: ApiConfigOverride): Promise<Stage | null> {
    const stages = await this.getStages(config);
    return stages.find(stage => stage.name === name) || null;
  }

  // Opportunity utility methods
  async getOpportunitiesByStage(stageId: string, config?: ApiConfigOverride): Promise<Opportunity[]> {
    return this.getOpportunities({ stage_id: stageId }, config);
  }

  async getOpportunitiesByOwner(ownerId: string, config?: ApiConfigOverride): Promise<Opportunity[]> {
    return this.getOpportunities({ owner_id: ownerId }, config);
  }

  async getOpportunitiesByStatus(status: Opportunity['status'], config?: ApiConfigOverride): Promise<Opportunity[]> {
    return this.getOpportunities({ status }, config);
  }

  async getOpportunitiesByAccount(accountId: string, config?: ApiConfigOverride): Promise<Opportunity[]> {
    const opportunities = await this.getOpportunities({}, config);
    return opportunities.filter(opp => opp.account_id === accountId);
  }

  async getOpportunitiesByContact(contactId: string, config?: ApiConfigOverride): Promise<Opportunity[]> {
    const opportunities = await this.getOpportunities({}, config);
    return opportunities.filter(opp => opp.contact_id === contactId);
  }

  async moveOpportunityToNextStage(opportunityId: string, config?: ApiConfigOverride): Promise<Opportunity> {
    const opportunity = await this.getOpportunityById(opportunityId, config);
    const nextStage = await this.getNextStage(opportunity.stage_id, config);
    return this.moveOpportunityToStage(opportunityId, { stage_id: nextStage.id }, config);
  }

  async moveOpportunityToPreviousStage(opportunityId: string, config?: ApiConfigOverride): Promise<Opportunity> {
    const opportunity = await this.getOpportunityById(opportunityId, config);
    const previousStage = await this.getPreviousStage(opportunity.stage_id, config);
    return this.moveOpportunityToStage(opportunityId, { stage_id: previousStage.id }, config);
  }

  async getTotalOpportunityValue(config?: ApiConfigOverride): Promise<number> {
    const opportunities = await this.getOpportunities({}, config);
    return opportunities.reduce((total, opp) => total + opp.amount, 0);
  }

  async getTotalOpportunityValueByStage(stageId: string, config?: ApiConfigOverride): Promise<number> {
    const opportunities = await this.getOpportunitiesByStage(stageId, config);
    return opportunities.reduce((total, opp) => total + opp.amount, 0);
  }

  // Activity utility methods
  async getActivitiesByLead(leadId: string, config?: ApiConfigOverride): Promise<Activity[]> {
    return this.getActivities({ lead_id: leadId }, config);
  }

  async getActivitiesByContact(contactId: string, config?: ApiConfigOverride): Promise<Activity[]> {
    return this.getActivities({ contact_id: contactId }, config);
  }

  async getActivitiesByAccount(accountId: string, config?: ApiConfigOverride): Promise<Activity[]> {
    return this.getActivities({ account_id: accountId }, config);
  }

  async getActivitiesByOpportunity(opportunityId: string, config?: ApiConfigOverride): Promise<Activity[]> {
    return this.getActivities({ opportunity_id: opportunityId }, config);
  }

  async getActivitiesByAssignee(userId: string, config?: ApiConfigOverride): Promise<Activity[]> {
    return this.getActivities({ assigned_to: userId }, config);
  }

  async getActivitiesByType(type: string, config?: ApiConfigOverride): Promise<Activity[]> {
    return this.getActivities({ type }, config);
  }

  async getActivitiesByPriority(priority: "low" | "medium" | "high", config?: ApiConfigOverride): Promise<Activity[]> {
    return this.getActivities({ priority }, config);
  }

  async getActivitiesByStatus(status: string, config?: ApiConfigOverride): Promise<Activity[]> {
    return this.getActivities({ status }, config);
  }

  async getPendingActivities(config?: ApiConfigOverride): Promise<Activity[]> {
    const activities = await this.getActivities({}, config);
    return activities.filter(activity => !activity.status || activity.status === 'pending');
  }

  async getCompletedActivities(config?: ApiConfigOverride): Promise<Activity[]> {
    return this.getActivitiesByStatus('completed', config);
  }

  async getOverdueActivities(config?: ApiConfigOverride): Promise<Activity[]> {
    const activities = await this.getActivities({}, config);
    const now = new Date();
    return activities.filter(activity => {
      const dueDate = new Date(activity.due_date);
      return dueDate < now && (!activity.status || activity.status !== 'completed');
    });
  }

  async getTodaysActivities(config?: ApiConfigOverride): Promise<Activity[]> {
    const activities = await this.getActivities({}, config);
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.due_date).toISOString().split('T')[0];
      return activityDate === todayString;
    });
  }

  async getUpcomingActivities(days: number = 7, config?: ApiConfigOverride): Promise<Activity[]> {
    const activities = await this.getActivities({}, config);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return activities.filter(activity => {
      const dueDate = new Date(activity.due_date);
      return dueDate >= now && dueDate <= futureDate;
    });
  }

  async getHighPriorityActivities(config?: ApiConfigOverride): Promise<Activity[]> {
    return this.getActivitiesByPriority('high', config);
  }

  async createMeetingActivity(data: Omit<CreateActivityData, 'type'>, config?: ApiConfigOverride): Promise<Activity> {
    return this.createActivity({ ...data, type: 'meeting' }, config);
  }

  async createCallActivity(data: Omit<CreateActivityData, 'type'>, config?: ApiConfigOverride): Promise<Activity> {
    return this.createActivity({ ...data, type: 'call' }, config);
  }

  async createEmailActivity(data: Omit<CreateActivityData, 'type'>, config?: ApiConfigOverride): Promise<Activity> {
    return this.createActivity({ ...data, type: 'email' }, config);
  }

  async createTaskActivity(data: Omit<CreateActivityData, 'type'>, config?: ApiConfigOverride): Promise<Activity> {
    return this.createActivity({ ...data, type: 'task' }, config);
  }

  async markActivityAsCompleted(activityId: string, config?: ApiConfigOverride): Promise<Activity> {
    return this.updateActivityStatus(activityId, { status: 'completed' }, config);
  }

  async assignActivity(activityId: string, userId: string, config?: ApiConfigOverride): Promise<Activity> {
    return this.updateActivity(activityId, { assigned_to: userId }, config);
  }

  async rescheduleActivity(activityId: string, newDueDate: string, config?: ApiConfigOverride): Promise<Activity> {
    return this.updateActivity(activityId, { due_date: newDueDate }, config);
  }

  // Activity analytics
  async getTotalActivitiesForUser(userId: string, config?: ApiConfigOverride): Promise<number> {
    const activities = await this.getActivitiesByAssignee(userId, config);
    return activities.length;
  }

  async getActivitiesCompletionRate(config?: ApiConfigOverride): Promise<number> {
    const activities = await this.getActivities({}, config);
    if (activities.length === 0) return 0;
    
    const completed = activities.filter(activity => activity.status === 'completed').length;
    return Math.round((completed / activities.length) * 100);
  }

  // ================================
  // NOTE UTILITY METHODS
  // ================================

  // Notes filtering methods
  async getNotesByOpportunity(opportunityId: string, config?: ApiConfigOverride): Promise<Note[]> {
    return this.getNotes({ entity_type: 'opportunity', entity_id: opportunityId }, config);
  }

  async getNotesByLead(leadId: string, config?: ApiConfigOverride): Promise<Note[]> {
    return this.getNotes({ entity_type: 'lead', entity_id: leadId }, config);
  }

  async getNotesByContact(contactId: string, config?: ApiConfigOverride): Promise<Note[]> {
    return this.getNotes({ entity_type: 'contact', entity_id: contactId }, config);
  }

  async getNotesByAccount(accountId: string, config?: ApiConfigOverride): Promise<Note[]> {
    return this.getNotes({ entity_type: 'account', entity_id: accountId }, config);
  }

  async getNotesByType(type: string, config?: ApiConfigOverride): Promise<Note[]> {
    return this.getNotes({ type }, config);
  }

  async getNotesByCreator(createdBy: string, config?: ApiConfigOverride): Promise<Note[]> {
    return this.getNotes({ created_by: createdBy }, config);
  }

  async getAttachmentNotes(config?: ApiConfigOverride): Promise<Note[]> {
    return this.getNotes({ type: 'attachment' }, config);
  }

  async getTextNotes(config?: ApiConfigOverride): Promise<Note[]> {
    return this.getNotes({ type: 'text' }, config);
  }

  // Note creation convenience methods
  async createOpportunityNote(opportunityId: string, content: string, type: "text" | "attachment" = 'text', config?: ApiConfigOverride): Promise<Note> {
    const noteData: CreateNoteData = {
      type,
      content,
      entity_type: 'opportunity',
      entity_id: opportunityId
    };
    return this.createNote(noteData, config);
  }

  async createLeadNote(leadId: string, content: string, type: "text" | "attachment" = 'text', config?: ApiConfigOverride): Promise<Note> {
    const noteData: CreateNoteData = {
      type,
      content,
      entity_type: 'lead',
      entity_id: leadId
    };
    return this.createNote(noteData, config);
  }

  async createContactNote(contactId: string, content: string, type: "text" | "attachment" = 'text', config?: ApiConfigOverride): Promise<Note> {
    const noteData: CreateNoteData = {
      type,
      content,
      entity_type: 'contact',
      entity_id: contactId
    };
    return this.createNote(noteData, config);
  }

  async createAccountNote(accountId: string, content: string, type: "text" | "attachment" = 'text', config?: ApiConfigOverride): Promise<Note> {
    const noteData: CreateNoteData = {
      type,
      content,
      entity_type: 'account',
      entity_id: accountId
    };
    return this.createNote(noteData, config);
  }

  async addAttachmentNote(
    entityType: 'opportunity' | 'lead' | 'contact' | 'account',
    entityId: string,
    content: string,
    fileUrl: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    config?: ApiConfigOverride
  ): Promise<Note> {
    const noteData: CreateNoteData = {
      type: 'attachment',
      content,
      entity_type: entityType,
      entity_id: entityId,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize
    };
    return this.createNote(noteData, config);
  }
}

// Remove default instance export from here, it's handled in src/apis/index.ts
// export const crmService = new CRMService();
// export default crmService; 