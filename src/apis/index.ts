
import { ApiClient, apiClient as coreApiClientInstance } from "./core/client";

// Import services
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import { CompanyService } from "./services/company.service";
import { InvitationService } from "./services/invitation.service";
import { CRMService } from "./services/crm.service";
import { ProjectsService } from "./services/projects.service";
import { HRService } from "./services/hr.service";
import { DepartmentsService } from "./services/departments.service";
import { OnboardingService } from "./services/onboarding.service";
import { FinanceService } from "./services/finance.service";
import { AssetsService } from "./services/assets.service";
import { VendorService } from "./services/vendor.service";

// Import endpoint objects directly
import { AUTH_ENDPOINTS } from "./endpoints/auth";
import { USER_ENDPOINTS } from "./endpoints/user";
import { COMPANY_ENDPOINTS, INVITATION_ENDPOINTS } from "./endpoints/company";
import { CRM_ENDPOINTS } from "./endpoints/crm";
import { PROJECTS_ENDPOINTS } from "./endpoints/projects";
import { HR_ENDPOINTS } from "./endpoints/hr";
import { DEPARTMENTS_ENDPOINTS } from "./endpoints/departments";
import { ONBOARDING_ENDPOINTS } from "./endpoints/onboarding";
import { FINANCE_ENDPOINTS } from "./endpoints/finance";
import { ASSETS_ENDPOINTS } from "./endpoints/assets";
import { VENDOR_ENDPOINTS } from "./endpoints/vendor";

// Export the core apiClient instance directly
export const apiClient = coreApiClientInstance;

// Instantiate services with the core API client instance
const authService = new AuthService(apiClient);
const userService = new UserService(apiClient);
const companyService = new CompanyService(apiClient);
const invitationService = new InvitationService(apiClient);
const crmService = new CRMService(apiClient);
const projectsService = new ProjectsService(apiClient);
const hrService = new HRService(apiClient);
const departmentsService = new DepartmentsService(apiClient);
const onboardingService = new OnboardingService(apiClient);
const financeService = new FinanceService(apiClient);
const assetsService = new AssetsService(apiClient);
const vendorService = new VendorService(apiClient);

// Export instantiated services under a single 'api' object
export const api = {
  auth: authService,
  user: userService,
  company: companyService,
  invitations: invitationService,
  crm: crmService,
  projects: projectsService,
  hr: hrService,
  departments: departmentsService,
  onboarding: onboardingService,
  finance: financeService,
  assets: assetsService,
  vendor: vendorService,
};

// Define and export API_ENDPOINTS with a clear structure
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  COMPANY: COMPANY_ENDPOINTS,
  INVITATIONS: INVITATION_ENDPOINTS,
  CRM: CRM_ENDPOINTS,
  PROJECTS: PROJECTS_ENDPOINTS,
  HR: HR_ENDPOINTS,
  DEPARTMENTS: DEPARTMENTS_ENDPOINTS,
  ONBOARDING: ONBOARDING_ENDPOINTS,
  FINANCE: FINANCE_ENDPOINTS,
  ASSETS: ASSETS_ENDPOINTS,
  VENDOR: VENDOR_ENDPOINTS,
};

// Re-export STORAGE_KEYS from config
export { STORAGE_KEYS } from "./core/config";

// Utility function to set auth token on the main client instance
export const setAuthToken = (token: string | null) => {
  apiClient.setAuthToken(token);
};

// Utility function to clear auth token
export const clearAuthToken = () => {
  apiClient.setAuthToken(null);
};

export type { ApiClient };
