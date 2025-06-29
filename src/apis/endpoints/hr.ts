
export const HR_ENDPOINTS = {
  // Employee endpoints
  EMPLOYEES_LIST: "/hr/employees",                          // GET all employees, POST create employee
  EMPLOYEE_DETAIL: (employeeId: string) => `/hr/employees/${employeeId}`, // GET, PUT, DELETE employee by ID
  
  // Leave Request endpoints
  LEAVE_REQUESTS: "/hr/leave-requests",                     // GET all leave requests, POST create leave request
  LEAVE_REQUEST_DETAIL: (requestId: string) => `/hr/leave-requests/${requestId}`, // GET leave request by ID
  LEAVE_REQUEST_APPROVE: (requestId: string) => `/hr/leave-requests/${requestId}/approve`, // PUT approve leave request
  LEAVE_REQUEST_REJECT: (requestId: string) => `/hr/leave-requests/${requestId}/reject`,   // PUT reject leave request
  LEAVE_REQUEST_CANCEL: (requestId: string) => `/hr/leave-requests/${requestId}/cancel`,   // PUT cancel leave request
  
  // Onboarding endpoints
  ONBOARDING: "/hr/onboarding",                             // GET all onboarding, POST create onboarding
  ONBOARDING_DETAIL: (onboardingId: string) => `/hr/onboarding/${onboardingId}`, // GET, PUT onboarding by ID
  ONBOARDING_CHECKLIST: (onboardingId: string) => `/hr/onboarding/${onboardingId}/checklist`, // PUT update checklist
  ONBOARDING_COMPLETE: (onboardingId: string) => `/hr/onboarding/${onboardingId}/complete`, // PUT complete onboarding
  
  // Other HR endpoints
  DEPARTMENTS: "/hr/departments", // Assuming this is different from general settings departments
  PAYROLL: "/hr/payroll",
  ATTENDANCE: "/hr/attendance",
};
