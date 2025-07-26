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

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  // All fields are optional since this extends Partial<CreateEmployeeData>
  // This interface is intentionally empty to provide a clear type for updates
}

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

export interface UpdateProjectData extends Partial<CreateProjectData> {
  // All fields are optional since this extends Partial<CreateProjectData>
  // This interface is intentionally empty to provide a clear type for updates
}

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

export interface UpdateProjectTaskData extends Partial<CreateProjectTaskData> {
  // All fields are optional since this extends Partial<CreateProjectTaskData>
}

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

export interface UpdateProjectDeliverableData extends Partial<CreateProjectDeliverableData> {
  // All fields are optional since this extends Partial<CreateProjectDeliverableData>
}

export interface ProjectSprint {
  id: string;
  project_id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: "planning" | "active" | "completed" | "cancelled";
  capacity: number;
  created_at: string;
}

export interface CreateProjectSprintData {
  project_id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: "planning" | "active" | "completed" | "cancelled";
  capacity: number;
}

export interface UpdateProjectSprintData extends Partial<CreateProjectSprintData> {
  // All fields are optional since this extends Partial<CreateProjectSprintData>
}

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

export interface UpdateOnboardingData extends Partial<CreateOnboardingData> {
  // All fields are optional since this extends Partial<CreateOnboardingData>
  // This interface is intentionally empty to provide a clear type for updates
}

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

export interface UpdateLeadData extends Partial<CreateLeadData> {
  // All fields are optional since this extends Partial<CreateLeadData>
  // This interface is intentionally empty to provide a clear type for updates
}

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

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  // All fields are optional since this extends Partial<CreateCategoryData>
  // This interface is intentionally empty to provide a clear type for updates
}

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

export interface UpdateContactData extends Partial<CreateContactData> {
  // All fields are optional since this extends Partial<CreateContactData>
  // This interface is intentionally empty to provide a clear type for updates
}

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

export interface UpdateActivityData extends Partial<CreateActivityData> {
  // All fields are optional since this extends Partial<CreateActivityData>
  // This interface is intentionally empty to provide a clear type for updates
}

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

export interface UpdateNoteData extends Partial<CreateNoteData> {
  // All fields are optional since this extends Partial<CreateNoteData>
  // This interface is intentionally empty to provide a clear type for updates
}

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

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  // All fields are optional since this extends Partial<CreateCampaignData>
  // This interface is intentionally empty to provide a clear type for updates
}

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

export interface UpdateFinancialAccountData extends Partial<CreateFinancialAccountData> {
  // All fields are optional since this extends Partial<CreateFinancialAccountData>
  // This interface is intentionally empty to provide a clear type for updates
}

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

export interface UpdateFinanceCategoryData extends Partial<CreateFinanceCategoryData> {
  // All fields are optional since this extends Partial<CreateFinanceCategoryData>
  // This interface is intentionally empty to provide a clear type for updates
}

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

export interface UpdateBudgetData extends Partial<CreateBudgetData> {
  // All fields are optional since this extends Partial<CreateBudgetData>
  // This interface is intentionally empty to provide a clear type for updates
} 

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

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  // All fields are optional for updates
} 

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
  status: "active" | "in_stock" | "assigned" | "maintenance" | "retired";
  location: string;
  notes: string | null;
  created_at: string;
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
  status: "active" | "in_stock" | "assigned" | "maintenance" | "retired";
  location: string;
  notes?: string;
}

export interface UpdateAssetData extends Partial<CreateAssetData> {
  // All fields are optional since this extends Partial<CreateAssetData>
}

export interface CreateAssetCategoryData {
  name: string;
  description: string;
  depreciation_rate: number;
  depreciation_method: "straight_line" | "declining_balance" | "sum_of_years";
  useful_life_months: number;
}

export interface UpdateAssetCategoryData extends Partial<CreateAssetCategoryData> {
  // All fields are optional since this extends Partial<CreateAssetCategoryData>
}