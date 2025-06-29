// Department API endpoints
// Note: Based on backend analysis, these endpoints match the actual backend implementation
export const DEPARTMENTS_ENDPOINTS = {
  // Implemented endpoints (match backend routes)
  CREATE: "/departments",                    // POST create department
  LIST_BY_COMPANY: (companyId: string) => `/departments/company/${companyId}`, // GET company departments
  
  // These endpoints may need to be implemented or use different patterns
  DETAIL: (departmentId: string) => `/departments/${departmentId}`,
  UPDATE: (departmentId: string) => `/departments/${departmentId}`,
  DELETE: (departmentId: string) => `/departments/${departmentId}`,
};
