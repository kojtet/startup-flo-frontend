// Company API endpoints
// Note: Based on backend analysis, these endpoints match the actual backend implementation
export const COMPANY_ENDPOINTS = {
  // Implemented endpoints (match backend routes)
  LIST: "/companies",                        // GET all companies
  DETAILS: (companyId: string) => `/companies/${companyId}`,     // GET company by ID
  CREATE: "/companies",                      // POST create company
  UPDATE: (companyId: string) => `/companies/${companyId}`,      // PATCH update company
  MODULES: (companyId: string) => `/companies/${companyId}/modules`, // GET company modules
  
  // These endpoints may not be fully implemented yet on the backend
  MEMBERS: "/companies/members",             // Company members (not implemented)
  ADD_MEMBER: "/companies/members/add",      // Add member (not implemented)
  REMOVE_MEMBER: (memberId: string) => `/companies/members/${memberId}/remove`,
  UPDATE_MEMBER_ROLE: (memberId: string) => `/companies/members/${memberId}/role`,
  SETTINGS: "/companies/settings",           // Company settings (not implemented)
  UPDATE_SETTINGS: "/companies/settings/update",
};

// Company Invitation endpoints
export const INVITATION_ENDPOINTS = {
  // Send invitation
  SEND: "/invites",                          // POST send company invite
  
  // List company invites
  LIST_BY_COMPANY: (companyId: string) => `/invites/company/${companyId}`, // GET company invites
  
  // Get invite info by token
  GET_BY_TOKEN: (inviteToken: string) => `/invites/${inviteToken}`, // GET invite info
  
  // Accept invitation
  ACCEPT: (inviteToken: string) => `/invites/${inviteToken}/accept`, // POST accept invite
  
  // Expire/disable invitation
  EXPIRE: (inviteId: string) => `/invites/${inviteId}/expire`, // POST expire invite
  
  // Delete invitation
  DELETE: (inviteId: string) => `/company/invites/${inviteId}`, // DELETE invite
};
