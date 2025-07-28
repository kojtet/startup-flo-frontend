export interface Employee {
  id: string;
  company_id: string;
  staff_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string | null;
  position: string;
  date_of_birth: string;
  date_hired: string;
  status: "active" | "inactive" | "terminated";
  created_at: string;
  department_id: string;
  departments: {
    id: string;
    name: string;
  } | null;
}

export interface CreateEmployeeData {
  staff_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: string;
  position: string;
  date_of_birth: string;
  date_hired: string;
  status: "active" | "inactive" | "terminated";
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type UpdateEmployeeData = Partial<CreateEmployeeData>;

export interface Department {
  id: string;
  name: string;
}

export enum EmployeeStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  TERMINATED = "terminated"
}

// User interface for project components
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

// Project types
export interface Project {
  id: string;
  company_id: string;
  name: string;
  description: string;
  start_date: string;
  expected_end: string;
  created_by: string | null;
  team_lead: string | null;
  status: "active" | "not_started" | "in_progress" | "completed" | "on_hold" | "cancelled";
  created_at: string;
  progress?: number;
  budget?: number;
}

export interface CreateProjectData {
  company_id: string;
  name: string;
  description: string;
  start_date: string;
  expected_end: string;
  team_lead?: string;
  status: "active" | "not_started" | "in_progress" | "completed" | "on_hold" | "cancelled";
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type UpdateProjectData = Partial<CreateProjectData>;

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in-progress" | "review" | "done";
  owner_id: string | null;
  due_date: string | null;
  sprint_id: string | null;
  parent_task_id: string | null;
  created_at: string;
}

export interface CreateProjectTaskData {
  project_id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in-progress" | "review" | "done";
  owner_id?: string;
  due_date?: string;
  sprint_id?: string;
  parent_task_id?: string;
}

export type UpdateProjectTaskData = Partial<CreateProjectTaskData>;

export interface ProjectDeliverable {
  id: string;
  project_id: string;
  name: string;
  description: string;
  expected_date: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "planning" | "in_progress" | "review" | "completed" | "blocked";
  owner_id: string | null;
  progress: number;
  requirements: string;
  created_at: string;
}

export interface CreateProjectDeliverableData {
  project_id: string;
  name: string;
  description: string;
  expected_date: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "planning" | "in_progress" | "review" | "completed" | "blocked";
  owner_id?: string;
  progress: number;
  requirements: string;
}

export type UpdateProjectDeliverableData = Partial<CreateProjectDeliverableData>;

export interface ProjectSprint {
  id: string;
  project_id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  owner_id?: string;
  created_at: string;
}

export interface CreateProjectSprintData {
  project_id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  owner_id?: string;
}

export type UpdateProjectSprintData = Partial<CreateProjectSprintData>;

// Onboarding types
export interface OnboardingTask {
  task: string;
  completed: boolean;
}

export interface Onboarding {
  id: string;
  employee_id: string;
  start_date: string;
  status: "in_progress" | "completed" | "paused";
  checklist: OnboardingTask[];
  created_at: string;
  updated_at: string;
}

export interface CreateOnboardingData {
  employee_id: string;
  start_date: string;
  status: "in_progress" | "completed" | "paused";
  checklist: OnboardingTask[];
}

export type UpdateOnboardingData = Partial<CreateOnboardingData>;

// CRM Lead types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  assigned_to?: string;
  company?: string;
  title?: string;
  category_id?: string;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  category?: Category;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  company?: string;
  title?: string;
  category_id?: string;
}

export type UpdateLeadData = Partial<CreateLeadData>;

// CRM Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color: string;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

// CRM Contact types
export interface Contact {
  id: string;
  lead_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  account_id?: string;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  lead?: Lead;
  account?: Account;
}

export interface CreateContactData {
  lead_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  account_id?: string;
}

export type UpdateContactData = Partial<CreateContactData>;

// CRM Account types (for contacts)
export interface Account {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  notes?: string;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateAccountData {
  name: string;
  industry?: string;
  website?: string;
  notes?: string;
}

export type UpdateAccountData = Partial<CreateAccountData>;

// CRM Stage types (for opportunities)
export interface Stage {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  color?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateStageData {
  name: string;
  description?: string;
  order_index: number;
  color?: string;
  is_active?: boolean;
}

export type UpdateStageData = Partial<CreateStageData>;

// CRM Opportunity types
export interface Opportunity {
  id: string;
  account_id: string;
  contact_id: string;
  name: string;
  description?: string;
  amount: number;
  stage_id: string;
  owner_id: string;
  status: "open" | "closed_won" | "closed_lost";
  expected_close: string;
  actual_close?: string;
  probability: number;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  account?: Account;
  contact?: Contact;
  stage?: Stage;
}

export interface CreateOpportunityData {
  account_id: string;
  contact_id: string;
  name: string;
  description?: string;
  amount: number;
  stage_id: string;
  owner_id: string;
  status: "open" | "closed_won" | "closed_lost";
  expected_close: string;
  probability?: number;
}

export type UpdateOpportunityData = Partial<CreateOpportunityData>;

// CRM Activity types
export interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "task";
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  due_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  lead_id?: string;
  contact_id?: string;
  account_id?: string;
  opportunity_id?: string;
  assigned_to?: string;
  status?: "pending" | "completed" | "overdue";
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  lead?: Lead;
  contact?: Contact;
  account?: Account;
  opportunity?: Opportunity;
}

export interface CreateActivityData {
  type: "call" | "email" | "meeting" | "task";
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  due_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  lead_id?: string;
  contact_id?: string;
  account_id?: string;
  opportunity_id?: string;
  assigned_to?: string;
}

export type UpdateActivityData = Partial<CreateActivityData>;

// CRM Note types
export interface Note {
  id: string;
  type: "text" | "attachment";
  content: string;
  entity_type: "opportunity" | "lead" | "contact" | "account";
  entity_id: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateNoteData {
  type: "text" | "attachment";
  content: string;
  entity_type: "opportunity" | "lead" | "contact" | "account";
  entity_id: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
}

export type UpdateNoteData = Partial<CreateNoteData>;

// CRM Campaign types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: "email" | "social" | "display" | "search";
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  start_date: string;
  end_date: string;
  budget: number;
  target_audience?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spend?: number;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  // Enhanced fields
  end_goals?: CampaignGoal[];
  current_progress?: CampaignProgress;
  kpis?: CampaignKPI[];
  tags?: string[];
  priority?: "low" | "medium" | "high" | "urgent";
  assigned_to?: string;
  notes?: string;
}

export interface CampaignGoal {
  id: string;
  name: string;
  target_value: number;
  current_value: number;
  unit: string; // e.g., "leads", "sales", "signups", "clicks"
  type: "conversion" | "engagement" | "revenue" | "awareness";
  deadline?: string;
  is_completed: boolean;
}

export interface CampaignProgress {
  overall_progress: number; // 0-100
  goals_completed: number;
  total_goals: number;
  days_remaining: number;
  budget_utilized: number;
  budget_remaining: number;
  performance_score: number; // 0-100
}

export interface CampaignKPI {
  id: string;
  name: string;
  current_value: number;
  target_value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change_percentage: number;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  type: "email" | "social" | "display" | "search";
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  start_date: string;
  end_date: string;
  budget: number;
  target_audience?: string;
  end_goals?: Omit<CampaignGoal, 'id' | 'current_value' | 'is_completed'>[];
  tags?: string[];
  priority?: "low" | "medium" | "high" | "urgent";
  assigned_to?: string;
  notes?: string;
}

export type UpdateCampaignData = Partial<CreateCampaignData>;

// Finance types
export interface FinancialAccount {
  id: string;
  company_id: string;
  name: string;
  type: "bank" | "credit_card" | "cash" | "investment" | "loan" | "other";
  balance: number;
  currency: string;
  is_primary: boolean;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateFinancialAccountData {
  name: string;
  type: "bank" | "credit_card" | "cash" | "investment" | "loan" | "other";
  currency: string;
  is_primary: boolean;
  balance: number;
  description?: string;
}

export type UpdateFinancialAccountData = Partial<CreateFinancialAccountData>;

// Finance Category types
export interface FinanceCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  description?: string;
  color: string;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateFinanceCategoryData {
  name: string;
  type: "income" | "expense";
  description?: string;
  color: string;
}

export type UpdateFinanceCategoryData = Partial<CreateFinanceCategoryData>;

// Finance Budget types
export interface BudgetAllocation {
  id: string;
  budget_id: string;
  category_id: string;
  amount_allocated: number;
  created_at: string;
  category: {
    id: string;
    name: string;
    company_id: string;
    created_at: string;
    description: string;
  };
}

export interface Budget {
  id: string;
  company_id: string;
  name: string;
  scope_type: "company" | "department" | "project" | "user";
  scope_ref?: string | null;
  period_start: string;
  period_end: string;
  owner_id: string;
  total_amount: number;
  status: "active" | "inactive" | "completed" | "cancelled";
  created_at: string;
  owner: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  allocations: BudgetAllocation[];
}

export interface CreateBudgetData {
  name: string;
  scope_type: "company" | "department" | "project" | "user";
  scope_ref?: string;
  period_start: string;
  period_end: string;
  owner_id: string;
  total_amount: number;
  status?: "active" | "inactive" | "completed" | "cancelled";
}

export type UpdateBudgetData = Partial<CreateBudgetData>; 

// Finance Transaction types
export interface Transaction {
  id: string;
  account_id: string;
  category_id: string;
  budget_allocation_id?: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  transaction_date: string;
  reference?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  account?: FinancialAccount;
  category?: FinanceCategory;
  budget_allocation?: BudgetAllocation;
}

export interface CreateTransactionData {
  account_id: string;
  category_id: string;
  budget_allocation_id?: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  transaction_date: string;
  reference?: string;
  tags?: string[];
}

export type UpdateTransactionData = Partial<CreateTransactionData>; 

// Asset types
export interface Asset {
  id: string;
  company_id: string;
  category_id: string;
  name: string;
  asset_tag: string;
  serial_number: string;
  purchase_date: string;
  purchase_cost: number;
  depreciation_start: string;
  current_value: number;
  status: "active" | "available" | "assigned" | "maintenance" | "retired" | "disposed";
  location: string;
  notes: string | null;
  created_at: string;
  warranty_expiry?: string;
  condition?: string;
  category: {
    name: string;
  };
}

export interface AssetCategory {
  id: string;
  company_id: string;
  name: string;
  depreciation_method: "straight_line" | "declining_balance" | "sum_of_years";
  useful_life_months: number;
  salvage_percentage: number;
  created_at: string;
  description: string;
  salvage_value_percentage: number | null;
}

export interface CreateAssetData {
  category_id: string;
  name: string;
  asset_tag: string;
  serial_number: string;
  purchase_date: string;
  purchase_cost: number;
  depreciation_start: string;
  status: "active" | "available" | "assigned" | "maintenance" | "retired" | "disposed";
  location: string;
  notes?: string;
}

export type UpdateAssetData = Partial<CreateAssetData>;

export interface CreateAssetCategoryData {
  name: string;
  description: string;
  depreciation_rate: number;
  depreciation_method: "straight_line" | "declining_balance" | "sum_of_years";
  useful_life_months: number;
}

export type UpdateAssetCategoryData = Partial<CreateAssetCategoryData>;

// Asset Response types
export interface AssetsResponse {
  data: Asset[];
  total: number;
  page: number;
  limit: number;
}

export interface AssetResponse {
  data: Asset;
}

// Asset Assignment types
export interface AssetAssignment {
  id: string;
  asset_id: string;
  employee_id: string;
  assigned_date: string;
  return_date?: string;
  notes?: string;
  created_at: string;
  asset?: Asset;
  employee?: Employee;
}

export interface AssignAssetData {
  employee_id: string;
  assigned_date: string;
  return_date?: string;
  notes?: string;
}

export interface UnassignAssetData {
  return_date: string;
  notes?: string;
}

export interface TransferAssetData {
  new_employee_id: string;
  transfer_date: string;
  notes?: string;
}

export interface AssetAssignmentsResponse {
  data: AssetAssignment[];
  total: number;
}

export interface AssetAssignmentResponse {
  data: AssetAssignment;
}

// Asset Maintenance types
export interface AssetMaintenance {
  id: string;
  asset_id: string;
  type: "preventive" | "corrective" | "emergency";
  description: string;
  scheduled_date: string;
  completed_date?: string;
  cost: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  technician?: string;
  notes?: string;
  created_at: string;
  asset?: Asset;
}

export interface CreateMaintenanceData {
  asset_id: string;
  type: "preventive" | "corrective" | "emergency";
  description: string;
  scheduled_date: string;
  cost: number;
  technician?: string;
  notes?: string;
}

export interface UpdateMaintenanceData {
  type?: "preventive" | "corrective" | "emergency";
  description?: string;
  scheduled_date?: string;
  cost?: number;
  technician?: string;
  notes?: string;
}

export interface CompleteMaintenanceData {
  completed_date: string;
  actual_cost?: number;
  notes?: string;
}

export interface AssetMaintenanceResponse {
  data: AssetMaintenance;
}

export interface MaintenanceResponse {
  data: AssetMaintenance[];
  total: number;
}

// Asset Checkout types
export interface AssetCheckout {
  id: string;
  asset_id: string;
  employee_id: string;
  checkout_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  checkout_notes?: string;
  return_notes?: string;
  status: "checked_out" | "returned" | "overdue";
  created_at: string;
  asset?: Asset;
  employee?: Employee;
}

export interface CheckoutAssetData {
  employee_id: string;
  checkout_date: string;
  expected_return_date: string;
  checkout_notes?: string;
}

export interface CheckinAssetData {
  actual_return_date: string;
  return_notes?: string;
}

export interface AssetCheckoutsResponse {
  data: AssetCheckout[];
  total: number;
}

export interface AssetCheckoutResponse {
  data: AssetCheckout;
}

// Asset Location types
export interface AssetLocation {
  id: string;
  company_id: string;
  name: string;
  address?: string;
  description?: string;
  created_at: string;
}

export interface CreateAssetLocationData {
  name: string;
  address?: string;
  description?: string;
}

export interface UpdateAssetLocationData {
  name?: string;
  address?: string;
  description?: string;
}

export interface AssetLocationsResponse {
  data: AssetLocation[];
  total: number;
}

export interface AssetLocationResponse {
  data: AssetLocation;
}

// Asset Status and Depreciation types
export interface UpdateAssetStatusData {
  status: Asset['status'];
  notes?: string;
}

export interface DepreciateAssetData {
  depreciation_date: string;
  new_value: number;
  notes?: string;
}

export interface AssetDepreciationResponse {
  data: {
    asset_id: string;
    depreciation_date: string;
    previous_value: number;
    new_value: number;
    depreciation_amount: number;
    notes?: string;
  };
}

// Asset Report types
export interface AssetReport {
  id: string;
  type: "summary" | "depreciation" | "maintenance" | "utilization";
  generated_date: string;
  data: any;
}

export interface AssetSummaryReport {
  total_assets: number;
  active_assets: number;
  retired_assets: number;
  total_value: number;
  depreciated_value: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
}

export interface AssetDepreciationReport {
  total_depreciation: number;
  monthly_depreciation: number;
  assets_depreciating: number;
  depreciation_by_category: Record<string, number>;
}

export interface AssetMaintenanceReport {
  total_maintenance_cost: number;
  scheduled_maintenance: number;
  completed_maintenance: number;
  maintenance_by_type: Record<string, number>;
}

export interface AssetUtilizationReport {
  total_utilization_rate: number;
  assets_in_use: number;
  assets_available: number;
  utilization_by_category: Record<string, number>;
}

export interface AssetReportsResponse {
  data: AssetReport[];
  total: number;
}

export interface AssetReportResponse {
  data: AssetReport;
}

// Asset Audit types
export interface AssetAuditLog {
  id: string;
  asset_id: string;
  action: string;
  user_id: string;
  timestamp: string;
  details: any;
  asset?: Asset;
  user?: Employee;
}

export interface AssetAuditResponse {
  data: AssetAuditLog;
}

export interface AssetAuditTrailResponse {
  data: AssetAuditLog[];
  total: number;
}

// Asset Import/Export types
export interface AssetImportData {
  file: File;
  import_type: "csv" | "excel";
  options?: {
    skip_duplicates?: boolean;
    update_existing?: boolean;
  };
}

export interface AssetImportResponse {
  success: boolean;
  imported_count: number;
  errors: string[];
}

export interface AssetExportData {
  format: "csv" | "excel" | "pdf";
  filters?: {
    status?: Asset['status'];
    category_id?: string;
    location?: string;
  };
}

export interface AssetExportResponse {
  download_url: string;
  expires_at: string;
}

// Asset Bulk Update types
export interface AssetBulkUpdateData {
  asset_ids: string[];
  updates: Partial<UpdateAssetData>;
}

export interface AssetBulkUpdateResponse {
  success: boolean;
  updated_count: number;
  errors: string[];
}

// Asset QR Code and Barcode types
export interface AssetQRCodeResponse {
  qr_code_url: string;
  qr_code_data: string;
}

export interface AssetBarcodeResponse {
  barcode_url: string;
  barcode_data: string;
}

// Asset Scan types
export interface AssetScanData {
  scan_type: "qr" | "barcode";
  scan_data: string;
  location?: string;
}

export interface AssetScanResponse {
  asset?: Asset;
  found: boolean;
  message: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface AssetCategoryResponse {
  data: AssetCategory;
}

export interface AssetCategoriesResponse {
  data: AssetCategory[];
  total: number;
}

// Vendor types
export interface Vendor {
  id: string;
  company_id: string;
  name: string;
  category_id?: string;
  tax_number?: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  contact_person?: string;
  payment_terms?: string;
  credit_limit?: number;
  notes?: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at?: string;
  category?: VendorCategory;
}

export interface CreateVendorData {
  name: string;
  category_id?: string;
  tax_number?: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  contact_person?: string;
  payment_terms?: string;
  credit_limit?: number;
  notes?: string;
  status?: "active" | "inactive" | "suspended";
}

export type UpdateVendorData = Partial<CreateVendorData>;

export interface VendorCategory {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateVendorCategoryData {
  name: string;
  description?: string;
}

export type UpdateVendorCategoryData = Partial<CreateVendorCategoryData>;

export interface VendorsResponse {
  data: Vendor[];
  total: number;
}

export interface VendorResponse {
  data: Vendor;
}

export interface VendorCategoriesResponse {
  data: VendorCategory[];
  total: number;
}

export interface VendorCategoryResponse {
  data: VendorCategory;
}

// User Profile types
export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  job_title?: string;
  department?: string;
  location?: string;
  timezone?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at?: string;
}

export interface UpdateUserProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  job_title?: string;
  department?: string;
  location?: string;
  timezone?: string;
  date_of_birth?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: "light" | "dark" | "auto";
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profile_visibility: "public" | "private" | "company_only";
    activity_visibility: "public" | "private" | "company_only";
  };
  created_at: string;
  updated_at?: string;
}

export interface UpdateUserPreferencesData {
  theme?: "light" | "dark" | "auto";
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profile_visibility?: "public" | "private" | "company_only";
    activity_visibility?: "public" | "private" | "company_only";
  };
}

export interface UserActivity {
  id: string;
  user_id: string;
  type: "login" | "logout" | "profile_update" | "password_change" | "preference_update" | "action";
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Project Member types
export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: "owner" | "member" | "viewer";
  joined_at: string;
  user?: User;
}

// Project Comment types
export interface ProjectComment {
  id: string;
  task_id: string;
  user_id: string;
  message: string;
  created_at: string;
  updated_at?: string;
  user?: User;
}

export interface CreateCommentData {
  task_id: string;
  user_id: string;
  message: string;
}

export type UpdateCommentData = Partial<CreateCommentData>;

// Project Task types (aliases for existing types)
export type CreateTaskData = CreateProjectTaskData;
export type UpdateTaskData = UpdateProjectTaskData;

// Project Sprint types (aliases for existing types)
export type CreateSprintData = CreateProjectSprintData;
export type UpdateSprintData = UpdateProjectSprintData;

// Project Response types
export interface SprintsResponse {
  data: ProjectSprint[];
  total: number;
}

export interface SprintResponse {
  data: ProjectSprint;
}

export interface CommentsResponse {
  data: ProjectComment[];
  total: number;
}

export interface CommentResponse {
  data: ProjectComment;
}

// Onboarding Step types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  order: number;
  is_required: boolean;
  is_completed: boolean;
  step_type: "form" | "video" | "document" | "quiz" | "action";
  content?: any;
  created_at: string;
  updated_at?: string;
}

// Invitation types
export interface Invitation {
  id: string;
  company_id: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  invite_token: string;
  expires_at: string;
  created_at: string;
  updated_at?: string;
}

export interface InvitationWithCompany extends Invitation {
  company: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

export interface SendInvitationData {
  email: string;
  role: string;
  company_id: string;
}

export interface AcceptInvitationData {
  first_name: string;
  last_name: string;
  password: string;
  password_confirmation: string;
}

export interface InvitationsResponse {
  invites: Invitation[];
  total: number;
}

// Company types
export interface Company {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  size?: string;
  founded_year?: number;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at?: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "inactive" | "pending";
  joined_at: string;
  user?: User;
}

export interface CompanySettings {
  id: string;
  company_id: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface CompanyModule {
  id: string;
  company_id: string;
  module_name: string;
  is_enabled: boolean;
  settings?: Record<string, any>;
  created_at: string;
}

export interface CompanyModulesResponse {
  modules: CompanyModule[];
  total: number;
}

export interface CompanyResponse {
  company: Company;
}

export interface CreateCompanyMemberData {
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
}

export interface UpdateCompanyData {
  name?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  size?: string;
  founded_year?: number;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateCompanyMemberRoleData {
  role: "owner" | "admin" | "member" | "viewer";
}

export interface UpdateCompanySettingsData {
  settings: Record<string, any>;
}

// Department types
export interface CreateDepartmentData {
  name: string;
  description?: string;
  manager_id?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  manager_id?: string;
}

export interface DepartmentsResponse {
  data: Department[];
  total: number;
}

// Team types
export interface Team {
  id: string;
  department_id: string;
  name: string;
  description?: string;
  created_at: string;
}

// HR Response types
export interface EmployeesResponse {
  data: Employee[];
  total: number;
}

export interface EmployeeResponse {
  data: Employee;
}

// Leave Request types
export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at?: string;
  employee?: Employee;
}

export interface CreateLeaveRequestData {
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface UpdateLeaveRequestData {
  leave_type?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
  status?: "pending" | "approved" | "rejected" | "cancelled";
}

export interface LeaveRequestsResponse {
  data: LeaveRequest[];
  total: number;
}

export interface LeaveRequestResponse {
  data: LeaveRequest;
}

// Onboarding Response types
export interface OnboardingsResponse {
  data: Onboarding[];
  total: number;
}

export interface OnboardingResponse {
  data: Onboarding;
}

export interface UpdateOnboardingChecklistData {
  checklist: OnboardingTask[];
}

// Finance types
export interface FinanceOverview {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  outstanding_invoices: number;
  pending_expenses: number;
  budget_utilization: number;
}

// Invoice types
export interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issue_date: string;
  due_date: string;
  paid_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateInvoiceData {
  client_name: string;
  invoice_number: string;
  amount: number;
  issue_date: string;
  due_date: string;
  items?: InvoiceItem[];
}

export interface UpdateInvoiceData {
  client_name?: string;
  invoice_number?: string;
  amount?: number;
  issue_date?: string;
  due_date?: string;
  items?: InvoiceItem[];
}

export interface UpdateInvoiceStatusData {
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface RecordPaymentData {
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
}

export interface InvoicesResponse {
  data: Invoice[];
  total: number;
}

export interface InvoiceResponse {
  data: Invoice;
}

// Expense types
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  submitted_by: string;
  status: "pending" | "approved" | "rejected" | "paid";
  submitted_date: string;
  approved_date?: string;
  paid_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  category: string;
  submitted_date: string;
  receipt_url?: string;
}

export interface UpdateExpenseData {
  description?: string;
  amount?: number;
  category?: string;
  receipt_url?: string;
}

export interface UpdateExpenseStatusData {
  status: "pending" | "approved" | "rejected" | "paid";
}

export interface ExpensesResponse {
  data: Expense[];
  total: number;
}

export interface ExpenseResponse {
  data: Expense;
}

// Payment types
export interface Payment {
  id: string;
  type: "income" | "expense";
  amount: number;
  payment_method: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  payment_date: string;
  reference?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreatePaymentData {
  type: "income" | "expense";
  amount: number;
  payment_method: string;
  payment_date: string;
  reference?: string;
}

export interface UpdatePaymentData {
  type?: "income" | "expense";
  amount?: number;
  payment_method?: string;
  status?: "pending" | "completed" | "failed" | "cancelled";
  payment_date?: string;
  reference?: string;
}

export interface PaymentsResponse {
  data: Payment[];
  total: number;
}

export interface PaymentResponse {
  data: Payment;
}

// Budget Category types
export interface BudgetCategory {
  id: string;
  name: string;
  description?: string;
  budget_limit: number;
  spent_amount: number;
  remaining_amount: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateBudgetCategoryData {
  name: string;
  description?: string;
  budget_limit: number;
}

export interface UpdateBudgetCategoryData {
  name?: string;
  description?: string;
  budget_limit?: number;
}

export interface BudgetCategoriesResponse {
  data: BudgetCategory[];
  total: number;
}

export interface BudgetCategoryResponse {
  data: BudgetCategory;
}

// Budget Transaction types
export interface BudgetTransaction {
  id: string;
  budget_id: string;
  type: "expense" | "allocation";
  amount: number;
  description: string;
  transaction_date: string;
  category_id?: string;
  created_at: string;
}

export interface BudgetTransactionsResponse {
  data: BudgetTransaction[];
  total: number;
}

// Budget Snapshot types
export interface BudgetSnapshot {
  id: string;
  budget_id: string;
  snapshot_date: string;
  total_allocated: number;
  total_spent: number;
  remaining_amount: number;
  utilization_percentage: number;
  created_at: string;
}

export interface BudgetSnapshotsResponse {
  data: BudgetSnapshot[];
  total: number;
}

// Budget Summary types
export interface BudgetSummary {
  budget_id: string;
  total_allocated: number;
  total_spent: number;
  remaining_amount: number;
  utilization_percentage: number;
  spending_trend: "increasing" | "decreasing" | "stable";
  category_summary: Record<string, number>;
  days_remaining: number;
}

export interface BudgetSummaryResponse {
  data: BudgetSummary;
}

// Allocation types
export interface CreateAllocationData {
  category_id: string;
  amount_allocated: number;
}

export interface UpdateAllocationData {
  amount_allocated?: number;
}

export interface AllocationSummary {
  allocation_id: string;
  category_name: string;
  amount_allocated: number;
  amount_spent: number;
  remaining_amount: number;
  utilization_percentage: number;
  spending_trend: "increasing" | "decreasing" | "stable";
  recent_transactions: BudgetTransaction[];
}

export interface AllocationSummaryResponse {
  data: AllocationSummary;
}

export interface AllocationResponse {
  data: BudgetAllocation;
}

export interface BudgetAllocationsResponse {
  data: BudgetAllocation[];
  total: number;
}

// Financial Account Response types
export interface FinancialAccountsResponse {
  data: FinancialAccount[];
  total: number;
}

export interface FinancialAccountResponse {
  data: FinancialAccount;
}

// Finance Category Response types
export interface CategoriesResponse {
  data: Category[];
  total: number;
}

export interface CategoryResponse {
  data: Category;
}

// Transaction Response types
export interface TransactionsResponse {
  data: Transaction[];
  total: number;
}

export interface TransactionResponse {
  data: Transaction;
}

// Financial Report types
export interface FinancialReport {
  id: string;
  type: "revenue" | "expense" | "profit_loss" | "cash_flow";
  period_start: string;
  period_end: string;
  data: any;
  generated_at: string;
}

export interface RevenueReport {
  total_revenue: number;
  revenue_by_month: Record<string, number>;
  top_revenue_sources: Array<{ source: string; amount: number }>;
  growth_rate: number;
}

export interface ExpenseReport {
  total_expenses: number;
  expenses_by_month: Record<string, number>;
  top_expense_categories: Array<{ category: string; amount: number }>;
  growth_rate: number;
}

export interface ProfitLossReport {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  monthly_breakdown: Record<string, { revenue: number; expenses: number; profit: number }>;
}

export interface CashFlowReport {
  opening_balance: number;
  closing_balance: number;
  net_cash_flow: number;
  cash_inflows: number;
  cash_outflows: number;
  monthly_breakdown: Record<string, { inflows: number; outflows: number; net_flow: number }>;
}

export interface ReportsResponse {
  data: FinancialReport[];
  total: number;
}

// Tax types
export interface TaxRecord {
  id: string;
  type: "income_tax" | "sales_tax" | "property_tax" | "other";
  amount: number;
  period_start: string;
  period_end: string;
  due_date: string;
  status: "pending" | "paid" | "overdue";
  created_at: string;
}

export interface TaxCalculation {
  total_tax_liability: number;
  tax_breakdown: Record<string, number>;
  effective_tax_rate: number;
  period_start: string;
  period_end: string;
}

// CRM Response types
export interface LeadsResponse {
  leads: Lead[];
  total: number;
}

export interface LeadResponse {
  lead: Lead;
}

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
}

export interface ContactResponse {
  contact: Contact;
}

export interface AccountsResponse {
  accounts: Account[];
  total: number;
}

export interface AccountResponse {
  account: Account;
}

// Pipeline types
export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreatePipelineData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdatePipelineData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface PipelinesResponse {
  data: Pipeline[];
  total: number;
}

export interface PipelineResponse {
  data: Pipeline;
}

// Stage Response types
export interface StagesResponse {
  data: Stage[];
  total: number;
}

export interface StageResponse {
  data: Stage;
}

// Opportunity Response types
export interface OpportunitiesResponse {
  data: Opportunity[];
  total: number;
}

export interface OpportunityResponse {
  data: Opportunity;
}

export interface MoveOpportunityStageData {
  stage_id: string;
  notes?: string;
}

// Activity Response types
export interface ActivitiesResponse {
  data: Activity[];
  total: number;
}

export interface ActivityResponse {
  data: Activity;
}

export interface UpdateActivityStatusData {
  status: "pending" | "completed" | "overdue";
}

// Note Response types
export interface NotesResponse {
  data: Note[];
  total: number;
}

export interface NoteResponse {
  data: Note;
}