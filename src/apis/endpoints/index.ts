
export { AUTH_ENDPOINTS } from "./auth";
export { USER_ENDPOINTS } from "./user";
export { COMPANY_ENDPOINTS } from "./company";
export { CRM_ENDPOINTS } from "./crm";
export { PROJECTS_ENDPOINTS } from "./projects";
export { HR_ENDPOINTS } from "./hr";
export { DEPARTMENTS_ENDPOINTS } from "./departments";
export { ONBOARDING_ENDPOINTS } from "./onboarding";
export { FINANCE_ENDPOINTS } from "./finance";
export { ASSETS_ENDPOINTS } from "./assets";
export { VENDOR_ENDPOINTS } from "./vendor";

// For convenience, you can also export a combined object
import { AUTH_ENDPOINTS } from "./auth";
import { USER_ENDPOINTS } from "./user";
import { COMPANY_ENDPOINTS } from "./company";
import { CRM_ENDPOINTS } from "./crm";
import { PROJECTS_ENDPOINTS } from "./projects";
import { HR_ENDPOINTS } from "./hr";
import { DEPARTMENTS_ENDPOINTS } from "./departments";
import { ONBOARDING_ENDPOINTS } from "./onboarding";
import { FINANCE_ENDPOINTS } from "./finance";
import { ASSETS_ENDPOINTS } from "./assets";
import { VENDOR_ENDPOINTS } from "./vendor";

export const ALL_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  COMPANY: COMPANY_ENDPOINTS,
  CRM: CRM_ENDPOINTS,
  PROJECTS: PROJECTS_ENDPOINTS,
  HR: HR_ENDPOINTS,
  DEPARTMENTS: DEPARTMENTS_ENDPOINTS,
  ONBOARDING: ONBOARDING_ENDPOINTS,
  FINANCE: FINANCE_ENDPOINTS,
  ASSETS: ASSETS_ENDPOINTS,
  VENDOR: VENDOR_ENDPOINTS,
};
