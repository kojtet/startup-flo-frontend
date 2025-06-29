// CRM API endpoints
// Note: Based on backend analysis, these endpoints match the actual backend implementation
export const CRM_ENDPOINTS = {
  // Lead endpoints
  LEADS_LIST: "/crm/leads",                          // GET all leads, POST create lead
  LEAD_DETAIL: (leadId: string) => `/crm/leads/${leadId}`,    // GET, PATCH, DELETE lead by ID
  
  // Contact endpoints
  CONTACTS_LIST: "/crm/contacts",                    // GET all contacts, POST create contact
  CONTACT_DETAIL: (contactId: string) => `/crm/contacts/${contactId}`, // GET, PATCH, DELETE contact by ID
  
  // Account endpoints
  ACCOUNTS_LIST: "/crm/accounts",                    // GET all accounts, POST create account
  ACCOUNT_DETAIL: (accountId: string) => `/crm/accounts/${accountId}`, // GET, PATCH, DELETE account by ID
  
  // Pipeline endpoints
  PIPELINES_LIST: "/crm/pipelines",                  // GET all pipelines, POST create pipeline
  PIPELINE_DETAIL: (pipelineId: string) => `/crm/pipelines/${pipelineId}`, // GET, PATCH, DELETE pipeline by ID
  
  // Opportunity endpoints
  OPPORTUNITIES_LIST: "/crm/opportunities",          // GET all opportunities, POST create opportunity
  OPPORTUNITY_DETAIL: (opportunityId: string) => `/crm/opportunities/${opportunityId}`, // GET, PATCH, DELETE opportunity by ID
  OPPORTUNITY_STAGE: (opportunityId: string) => `/crm/opportunities/${opportunityId}/stage`, // POST move opportunity to stage
  
  // Stage endpoints
  STAGES_LIST: "/crm/stages",                        // GET all stages
  STAGE_NEXT: (stageId: string) => `/crm/stages/${stageId}/next`, // GET next stage
  STAGE_PREVIOUS: (stageId: string) => `/crm/stages/${stageId}/previous`, // GET previous stage
  
  // Activity endpoints
  ACTIVITIES_LIST: "/crm/activities",                // GET all activities, POST create activity
  ACTIVITY_DETAIL: (activityId: string) => `/crm/activities/${activityId}`, // GET, PATCH, DELETE activity by ID
  ACTIVITY_STATUS: (activityId: string) => `/crm/activities/${activityId}/status`, // PATCH update activity status
  
  // Note endpoints
  NOTES_LIST: "/crm/notes",                          // GET all notes, POST create note
  NOTE_DETAIL: (noteId: string) => `/crm/notes/${noteId}`, // GET, PATCH, DELETE note by ID
  
  // Future CRM endpoints (may be implemented later)
  CUSTOMERS: "/crm/customers",
  DEALS: "/crm/deals",
}; 