// User API endpoints
// Note: Based on backend analysis, only profile-related endpoints are fully implemented
export const USER_ENDPOINTS = {
  // Implemented endpoints
  PROFILE: "/users/me",           // GET current user profile
  GET_USER: "/users",            // GET user by ID (requires /:id)
  UPDATE_PROFILE: "/users",      // PUT user profile (requires /:id)
  COMPANY_USERS: "/users/company", // GET users by company (requires /:companyId)
  
  // These endpoints may not be fully implemented yet on the backend
  PREFERENCES: "/users/preferences",  // User preferences (not implemented)
  ACTIVITY: "/users/activity",        // User activity logs (not implemented)
  
  // Password change is available through auth routes
  CHANGE_PASSWORD: "/auth/reset-password", // Password reset via email
};
