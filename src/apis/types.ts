export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  role: string; // e.g., "admin", "manager", "employee", "user"
  company_id?: string;
  department_id?: string;
  job_title?: string;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
  // Add any other fields that your user object might have
  email_verified_at?: string | null;
  last_login_at?: string | null;
  is_active?: boolean;
  timezone?: string;
  language?: string;
  // Department and team info if directly on user object
  department?: {
    id: string;
    name: string;
  } | null;
  team?: {
    id: string;
    name: string;
  } | null;
  // Permissions might be an array of strings or a more complex object
  permissions?: string[];
  // Custom fields specific to your application
  custom_fields?: Record<string, unknown>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  refreshTokenExpires: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
  provider?: string;
  token?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  country?: string;
  logo_url?: string;
  created_by: string;
  created_at: string;
  team_size?: number;
  founded_year?: number;
  company_size_category?: string;
  annual_revenue_range?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  timezone?: string;
  currency?: string;
  business_type?: string;
  description?: string;
  mission_statement?: string;
  is_verified: boolean;
  is_active: boolean;
  subscription_plan?: string;
  subscription_status?: string;
  trial_ends_at?: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  userId: string;
  companyId: string;
  role: string;
}

export interface CompanySettings {
  id: string;
  companyId: string;
  settingKey: string;
  settingValue: unknown;
  [key: string]: unknown;
}

export interface CreateCompanyMemberData {
  userId: string;
  role: string;
}

export interface UpdateCompanyData {
  name?: string;
  industry?: string;
  country?: string;
  logo_url?: string;
  team_size?: number;
  founded_year?: number;
  company_size_category?: string;
  annual_revenue_range?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  timezone?: string;
  currency?: string;
  business_type?: string;
  description?: string;
  mission_statement?: string;
}

export interface UpdateCompanyMemberRoleData {
  role: string;
}

export interface UpdateCompanySettingsData {
  settingKey: string;
  settingValue: unknown;
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  [key: string]: unknown;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  manager_id?: string | null;
  created_at: string;
  updated_at: string;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string; // camelCase for compatibility
  endDate?: string; // camelCase for compatibility
  start_date?: string; // snake_case from API
  end_date?: string; // snake_case from API
  expected_end?: string; // alternative date field from API
  status: "not_started" | "in_progress" | "completed" | "on_hold" | "cancelled";
  priority?: "low" | "medium" | "high";
  budget?: number;
  currentSpend?: number;
  client_id?: string;
  team_ids?: string[];
  created_at: string;
  updated_at: string;
  // Add other relevant fields
  owner_id?: string;
  team_lead?: string; // alternative team lead field from API
  progress?: number; // 0-100
  tags?: string[];
  workspace_id?: string; // If projects belong to a workspace
  company_id?: string; // If projects belong to a company
}

export interface CreateProjectData {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: "not_started" | "in_progress" | "completed" | "on_hold" | "cancelled";
  priority?: "low" | "medium" | "high";
  budget?: number;
  client_id?: string;
  team_ids?: string[];
  owner_id?: string;
  workspace_id?: string;
  company_id?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: "not_started" | "in_progress" | "completed" | "on_hold" | "cancelled";
  priority?: "low" | "medium" | "high";
  budget?: number;
  currentSpend?: number;
  client_id?: string;
  team_ids?: string[];
  owner_id?: string;
  progress?: number;
  tags?: string[];
  actual_hours?: number;
  parent_task_id?: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority?: "low" | "medium" | "high";
  assignee_id?: string;
  owner_id?: string; // Added from API response
  reporter_id?: string;
  due_date?: string;
  created_at: string;
  updated_at?: string;
  // Add other relevant fields
  estimated_hours?: number;
  actual_hours?: number;
  parent_task_id?: string;
  sprint_id?: string | null; // Added from API response
  tags?: string[];
}

export interface ProjectSprint {
  id: string;
  project_id: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  owner_id: string;
  created_at: string;
  updated_at?: string;
}

export interface ProjectMember {
  id: string; // This might be the user_id
  project_id: string;
  user_id: string;
  role: "owner" | "editor" | "viewer" | "contributor"; // Example roles
  name?: string; // User's name for display
  avatar_url?: string; // User's avatar for display
  email?: string; // User's email
  joined_at: string;
  [key: string]: unknown;
}

export interface CreateTaskData {
  projectId: string;
  title: string;
}

export interface UpdateTaskData {
  title?: string;
  status?: string;
  [key: string]: unknown;
}

export interface CreateSprintData {
  project_id: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  owner_id: string;
}

export interface UpdateSprintData {
  name?: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  owner_id?: string;
}

export interface SprintsResponse {
  sprints: ProjectSprint[];
}

export interface SprintResponse {
  sprint: ProjectSprint;
}

// Project Comment types
export interface ProjectComment {
  id: string;
  task_id: string;
  user_id: string;
  message: string;
  created_at: string;
  updated_at?: string;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CreateCommentData {
  task_id: string;
  user_id: string;
  message: string;
}

export interface UpdateCommentData {
  message?: string;
}

export interface CommentsResponse {
  comments: ProjectComment[];
}

export interface CommentResponse {
  comment: ProjectComment;
}

export interface UserProfile extends User {
  bio?: string;
  website?: string;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
  [key: string]: unknown;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  [key: string]: unknown;
}

export interface UpdateUserPreferencesData {
  theme?: "light" | "dark" | "system";
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
  [key: string]: unknown;
}

export interface ChangePasswordData {
  currentPassword?: string;
  newPassword?: string;
  token?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    perPage: number;
    totalItems: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface Employee {
  id: string;
  company_id: string;
  staff_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department_id?: string;
  departments?: { 
    id: string;
    name: string;
  };
  date_of_birth: string;
  date_hired: string;
  status: "active" | "inactive" | "terminated";
  avatar_url?: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface CreateEmployeeData {
  staff_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id?: string;
  position: string;
  date_of_birth: string;
  date_hired: string;
  status?: "active" | "inactive" | "terminated";
}

export interface UpdateEmployeeData {
  staff_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department_id?: string;
  position?: string;
  date_of_birth?: string;
  date_hired?: string;
  status?: "active" | "inactive" | "terminated";
  avatar_url?: string;
  is_active?: boolean;
}

export interface EmployeesResponse {
  employees: Employee[];
}

export interface EmployeeResponse {
  employee: Employee;
}

// HR Onboarding types
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
  completed?: boolean;
  created_at: string;
  updated_at?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    staff_id: string;
  };
}

export interface CreateOnboardingData {
  employee_id: string;
  start_date: string;
  status: "in_progress" | "completed" | "paused";
  checklist: OnboardingTask[];
}

export interface UpdateOnboardingData {
  employee_id?: string;
  start_date?: string;
  status?: "in_progress" | "completed" | "paused";
  checklist?: OnboardingTask[];
}

export interface UpdateOnboardingChecklistData {
  checklist: OnboardingTask[];
}

export interface OnboardingsResponse {
  onboardings: Onboarding[];
}

export interface OnboardingResponse {
  onboarding: Onboarding;
}

// HR Leave Request types
export interface LeaveRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  leave_type: string; // e.g., "annual", "sick", "personal", "maternity", etc.
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateLeaveRequestData {
  employee_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason?: string;
  status?: "pending";
}

export interface UpdateLeaveRequestData {
  employee_id?: string;
  start_date?: string;
  end_date?: string;
  leave_type?: string;
  reason?: string;
  status?: "pending" | "approved" | "rejected" | "cancelled";
}

export interface LeaveRequestsResponse {
  leave_requests: LeaveRequest[];
}

export interface LeaveRequestResponse {
  leave_request: LeaveRequest;
}

export interface Invoice {
  id: string;
  company_id: string;
  client_name: string;
  invoice_number: string;
  status: "draft" | "pending" | "sent" | "paid" | "overdue" | "cancelled";
  amount: number;
  due_date: string;
  issued_date: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  items?: InvoiceItem[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface SignupCredentials extends RegisterCredentials {
  confirmPassword?: string;
  // Adding fields from InviteTeamStep's prepareSignupPayload
  company_name?: string;
  first_name?: string; // Alias for firstName
  last_name?: string; // Alias for lastName
  job_title?: string;
  department?: string;
  user_phone?: string;
  industry?: string;
  country?: string;
  website?: string;
  company_size_category?: string;
  team_size?: number;
  founded_year?: number;
  annual_revenue_range?: string;
  business_type?: string;
  timezone?: string;
  currency?: string;
  phone?: string; // Company phone
  address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  description?: string; // Company description
  mission_statement?: string; // Company mission
}

export interface ForgotPasswordCredentials { // Added for AuthContext
  email: string;
}

export interface ResetPasswordCredentials { // Added for AuthContext
  token: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileData { // Added for AuthContext & settings/index.tsx
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  avatar_url?: string;
  // Add other updatable profile fields
}

export interface CreateUserData { // Added for settings/index.tsx and UserContext
  email: string;
  password?: string; // Optional for initial creation if inviting
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
  company_id: string;
  job_title?: string;
  department_id?: string;
  avatar_url?: string;
  // Add other fields for creating a user
}

export interface UpdateUserData { // Added for settings/index.tsx and UserContext
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  job_title?: string;
  department_id?: string;
  avatar_url?: string;
  is_active?: boolean;
  // Add other updatable user fields
}

export interface CreateDepartmentData {
  name: string;
  company_id: string;
  manager_id?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  manager_id?: string;
}

export interface DepartmentsResponse {
  success: boolean;
  data: Department[];
}

// CRM types
export interface Lead {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status?: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  assigned_to?: string;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  assigned_to?: string;
}

export interface LeadsResponse {
  leads: Lead[];
}

export interface LeadResponse {
  lead: Lead;
}

// Contact types
export interface Contact {
  id: string;
  company_id: string;
  lead_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  account_id?: string;
  created_at: string;
  updated_at?: string;
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

export interface UpdateContactData {
  lead_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  account_id?: string;
}

export interface ContactsResponse {
  contacts: Contact[];
}

export interface ContactResponse {
  contact: Contact;
}

// Account types (CRM)
export interface Account {
  id: string;
  company_id: string;
  name: string;
  industry?: string;
  website?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateAccountData {
  name: string;
  industry?: string;
  website?: string;
  notes?: string;
}

export interface UpdateAccountData {
  name?: string;
  industry?: string;
  website?: string;
  notes?: string;
}

export interface AccountsResponse {
  accounts: Account[];
}

export interface AccountResponse {
  account: Account;
}

// Pipeline types
export interface Pipeline {
  id: string;
  company_id: string;
  name: string;
  created_by: string;
  created_at: string;
  stages: any[]; // Array of pipeline stages (can be expanded later)
  updated_at?: string;
}

export interface CreatePipelineData {
  name: string;
}

export interface UpdatePipelineData {
  name?: string;
}

export interface PipelinesResponse {
  pipelines: Pipeline[];
}

export interface PipelineResponse {
  pipeline: Pipeline;
}

// Stage types
export interface Stage {
  id: string;
  name: string;
  description: string;
  order_index: number;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface StagesResponse {
  stages: Stage[];
}

export interface StageResponse {
  stage: Stage;
}

// Opportunity types
export interface Opportunity {
  id: string;
  company_id: string;
  account_id: string;
  contact_id: string;
  name: string;
  amount: number;
  stage_id: string;
  owner_id: string;
  status: "open" | "closed_won" | "closed_lost";
  expected_close: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateOpportunityData {
  account_id: string;
  contact_id: string;
  name: string;
  amount: number;
  stage_id: string;
  owner_id: string;
  status: "open" | "closed_won" | "closed_lost";
  expected_close: string;
}

export interface UpdateOpportunityData {
  account_id?: string;
  contact_id?: string;
  name?: string;
  amount?: number;
  stage_id?: string;
  owner_id?: string;
  status?: "open" | "closed_won" | "closed_lost";
  expected_close?: string;
}

export interface MoveOpportunityStageData {
  stage_id: string;
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
}

export interface OpportunityResponse {
  opportunity: Opportunity;
}

// Activity types
export interface Activity {
  id: string;
  company_id: string;
  type: string;
  title: string;
  description?: string;
  due_date: string;
  priority: "low" | "medium" | "high";
  status?: string | null;
  start_time?: string;
  end_time?: string;
  location?: string;
  lead_id?: string;
  contact_id?: string;
  account_id?: string;
  opportunity_id?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityData {
  type: string;
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

export interface UpdateActivityData {
  type?: string;
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  due_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  lead_id?: string;
  contact_id?: string;
  account_id?: string;
  opportunity_id?: string;
  assigned_to?: string;
  status?: string;
}

export interface ActivitiesResponse {
  activities: Activity[];
}

export interface ActivityResponse {
  activity: Activity;
}

export interface UpdateActivityStatusData {
  status: string;
}

// Note types
export interface Note {
  id: string;
  type: string;
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
  updated_at: string;
}

export interface CreateNoteData {
  type: string;
  content: string;
  entity_type: "opportunity" | "lead" | "contact" | "account";
  entity_id: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
}

export interface UpdateNoteData {
  type?: string;
  content?: string;
  entity_type?: "opportunity" | "lead" | "contact" | "account";
  entity_id?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
}

export interface NotesResponse {
  notes: Note[];
}

export interface NoteResponse {
  note: Note;
}

// ================================
// FINANCE TYPES
// ================================

// Finance Overview types
export interface FinanceOverview {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  outstanding_invoices: number;
  pending_expenses: number;
  cash_flow: number;
  monthly_revenue: number[];
  monthly_expenses: number[];
}

// Invoice types
export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface CreateInvoiceData {
  client_name: string;
  amount: number;
  due_date: string;
  description?: string;
  status?: "draft" | "pending" | "sent";
  invoice_number?: string;
  items?: InvoiceItem[];
}

export interface UpdateInvoiceData {
  client_name?: string;
  amount?: number;
  due_date?: string;
  description?: string;
  status?: Invoice['status'];
  invoice_number?: string;
  items?: InvoiceItem[];
}

export interface UpdateInvoiceStatusData {
  status: Invoice['status'];
}

export interface RecordPaymentData {
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference?: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
}

export interface InvoiceResponse {
  invoice: Invoice;
}

// Expense types
export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "paid";
  expense_date: string;
  receipt_url?: string;
  merchant?: string;
  payment_method?: string;
  reimbursable: boolean;
  submitted_by: string;
  approved_by?: string;
  approved_at?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  category: string;
  expense_date: string;
  receipt_url?: string;
  merchant?: string;
  payment_method?: string;
  reimbursable?: boolean;
}

export interface UpdateExpenseData {
  title?: string;
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  status?: Expense['status'];
  expense_date?: string;
  receipt_url?: string;
  merchant?: string;
  payment_method?: string;
  reimbursable?: boolean;
}

export interface UpdateExpenseStatusData {
  status: Expense['status'];
  notes?: string;
}

export interface ExpensesResponse {
  expenses: Expense[];
}

export interface ExpenseResponse {
  expense: Expense;
}

// Payment types
export interface Payment {
  id: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  description: string;
  payment_method: string;
  reference?: string;
  payment_date: string;
  status: "pending" | "completed" | "failed";
  invoice_id?: string;
  expense_id?: string;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  type: "income" | "expense";
  amount: number;
  currency?: string;
  description: string;
  payment_method: string;
  reference?: string;
  payment_date: string;
  invoice_id?: string;
  expense_id?: string;
}

export interface UpdatePaymentData {
  type?: "income" | "expense";
  amount?: number;
  currency?: string;
  description?: string;
  payment_method?: string;
  reference?: string;
  payment_date?: string;
  status?: Payment['status'];
  invoice_id?: string;
  expense_id?: string;
}

export interface PaymentsResponse {
  payments: Payment[];
}

export interface PaymentResponse {
  payment: Payment;
}

// Budget Category types
export interface BudgetCategory {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateBudgetCategoryData {
  name: string;
  description?: string;
}

export interface UpdateBudgetCategoryData {
  name?: string;
  description?: string;
}

export interface BudgetCategoriesResponse {
  budget_categories: BudgetCategory[];
}

export interface BudgetCategoryResponse {
  budget_category: BudgetCategory;
}

// Budget types
export interface BudgetOwner {
  id: string;
  email: string;
}

export interface BudgetAllocation {
  id: string;
  budget_id: string;
  category_id: string;
  amount_allocated: number;
  created_at: string;
  updated_at?: string;
  category: BudgetCategory;
}

export interface Budget {
  id: string;
  company_id: string;
  name: string;
  scope_type: "department" | "project" | "company" | "user";
  scope_ref?: string;
  period_start: string;
  period_end: string;
  owner_id: string;
  total_amount: number;
  status: "active" | "inactive" | "completed" | "cancelled";
  created_at: string;
  updated_at?: string;
  owner: BudgetOwner;
  allocations: BudgetAllocation[];
}

export interface CreateBudgetData {
  name: string;
  scope_type: "department" | "project" | "company" | "user";
  scope_ref?: string;
  period_start: string;
  period_end: string;
  owner_id: string;
  total_amount?: number;
  status?: "active" | "inactive";
}

export interface UpdateBudgetData {
  name?: string;
  scope_type?: "department" | "project" | "company" | "user";
  scope_ref?: string;
  period_start?: string;
  period_end?: string;
  owner_id?: string;
  total_amount?: number;
  status?: Budget['status'];
}

export interface BudgetsResponse {
  budgets: Budget[];
}

export interface BudgetResponse {
  budget: Budget;
}

// Budget Transaction types
export interface BudgetTransaction {
  id: string;
  budget_id: string;
  type: "allocation" | "expense" | "transfer" | "adjustment";
  amount: number;
  currency: string;
  description: string;
  category_id?: string;
  reference_id?: string;
  reference_type?: "expense" | "invoice" | "payment";
  created_by: string;
  created_at: string;
  category?: BudgetCategory;
}

export interface BudgetTransactionsResponse {
  transactions: BudgetTransaction[];
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
  category_breakdown: {
    category_id: string;
    category_name: string;
    allocated: number;
    spent: number;
    remaining: number;
  }[];
  created_at: string;
}

export interface BudgetSnapshotsResponse {
  snapshots: BudgetSnapshot[];
}

// Budget Summary types
export interface BudgetSummary {
  budget_id: string;
  budget_name: string;
  total_allocated: number;
  total_spent: number;
  total_remaining: number;
  utilization_percentage: number;
  status: string;
  period_start: string;
  period_end: string;
  days_remaining: number;
  category_summary: {
    category_id: string;
    category_name: string;
    allocated: number;
    spent: number;
    remaining: number;
    utilization_percentage: number;
  }[];
  recent_transactions: BudgetTransaction[];
  spending_trend: {
    date: string;
    daily_spent: number;
    cumulative_spent: number;
  }[];
}

export interface BudgetSummaryResponse {
  summary: BudgetSummary;
}

// Budget Allocation types
export interface CreateAllocationData {
  category_id: string;
  amount_allocated: number;
}

export interface UpdateAllocationData {
  category_id?: string;
  amount_allocated?: number;
}

export interface AllocationSummary {
  allocation_id: string;
  budget_id: string;
  budget_name: string;
  category_id: string;
  category_name: string;
  amount_allocated: number;
  amount_spent: number;
  amount_remaining: number;
  utilization_percentage: number;
  period_start: string;
  period_end: string;
  days_remaining: number;
  spending_trend: {
    date: string;
    daily_spent: number;
    cumulative_spent: number;
  }[];
  recent_transactions: BudgetTransaction[];
  status: string;
}

export interface AllocationSummaryResponse {
  summary: AllocationSummary;
}

export interface BudgetAllocationsResponse {
  allocations: BudgetAllocation[];
}

export interface AllocationResponse {
  allocation: BudgetAllocation;
}

// Financial Account types
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
  is_primary?: boolean;
  balance?: number;
  description?: string;
}

export interface UpdateFinancialAccountData {
  name?: string;
  type?: "bank" | "credit_card" | "cash" | "investment" | "loan" | "other";
  balance?: number;
  currency?: string;
  is_primary?: boolean;
  description?: string;
}

export interface FinancialAccountsResponse {
  accounts: FinancialAccount[];
}

export interface FinancialAccountResponse {
  account: FinancialAccount;
}

// Category types
export interface Category {
  id: string;
  company_id: string;
  name: string;
  type: "income" | "expense";
  description?: string;
  color?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateCategoryData {
  name: string;
  type: "income" | "expense";
  description?: string;
  color?: string;
}

export interface UpdateCategoryData {
  name?: string;
  type?: "income" | "expense";
  description?: string;
  color?: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryResponse {
  category: Category;
}

// Transaction types
export interface Transaction {
  id: string;
  company_id: string;
  account_id: string;
  category_id: string;
  budget_allocation_id?: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  transaction_date: string;
  reference?: string;
  tags?: string[];
  recorded_by: string;
  created_at: string;
  updated_at?: string;
  account: FinancialAccount;
  category: Category;
  budget_allocation?: BudgetAllocation;
}

export interface CreateTransactionData {
  account_id: string;
  category_id: string;
  budget_allocation_id?: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  transaction_date: string;
  reference?: string;
  tags?: string[];
}

export interface UpdateTransactionData {
  account_id?: string;
  category_id?: string;
  budget_allocation_id?: string;
  type?: "income" | "expense";
  amount?: number;
  description?: string;
  transaction_date?: string;
  reference?: string;
  tags?: string[];
}

export interface TransactionsResponse {
  transactions: Transaction[];
}

export interface TransactionResponse {
  transaction: Transaction;
}

// Report types
export interface FinancialReport {
  id: string;
  type: "revenue" | "expenses" | "profit_loss" | "cash_flow";
  title: string;
  period_start: string;
  period_end: string;
  data: any; // Report-specific data structure
  generated_at: string;
  company_id: string;
}

export interface RevenueReport {
  total_revenue: number;
  monthly_breakdown: {
    month: string;
    revenue: number;
    invoices_count: number;
  }[];
  top_clients: {
    client_name: string;
    revenue: number;
  }[];
}

export interface ExpenseReport {
  total_expenses: number;
  monthly_breakdown: {
    month: string;
    expenses: number;
    count: number;
  }[];
  by_category: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface ProfitLossReport {
  revenue: number;
  expenses: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
  monthly_comparison: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
}

export interface CashFlowReport {
  opening_balance: number;
  closing_balance: number;
  cash_inflow: number;
  cash_outflow: number;
  net_cash_flow: number;
  monthly_flow: {
    month: string;
    inflow: number;
    outflow: number;
    net_flow: number;
  }[];
}

export interface ReportsResponse {
  reports: FinancialReport[];
}

// Tax types
export interface TaxRecord {
  id: string;
  type: "income" | "expense" | "vat" | "sales_tax";
  amount: number;
  tax_rate: number;
  tax_amount: number;
  description: string;
  transaction_date: string;
  invoice_id?: string;
  expense_id?: string;
  company_id: string;
  created_at: string;
}

export interface TaxCalculation {
  period_start: string;
  period_end: string;
  total_income: number;
  total_expenses: number;
  taxable_income: number;
  tax_owed: number;
  tax_rate: number;
  deductions: {
    description: string;
    amount: number;
  }[];
}

export interface CompanyModule {
  id: string;
  company_id: string;
  module_id: string;
  enabled: boolean;
  created_at: string;
}

export interface CompanyModulesResponse {
  modules: CompanyModule[];
}

export interface CompanyResponse {
  company: Company;
}

// Invitation types
export interface Invitation {
  id: string;
  email: string;
  company_id: string;
  role: "admin" | "manager" | "employee";
  invited_by: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  token: string;
  expires_at: string;
  created_at: string;
}

export interface InvitationWithCompany {
  invite: Invitation;
  company: {
    id: string;
    name: string;
  };
}

export interface InvitationsResponse {
  invites: Invitation[];
}

export interface SendInvitationData {
  email: string;
  role: "admin" | "manager" | "employee";
  companyId: string;
}

export interface AcceptInvitationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// ================================
// ASSETS TYPES
// ================================

// Asset types
export interface Asset {
  id: string;
  company_id: string;
  category_id: string;
  name: string;
  asset_tag: string;
  serial_number?: string;
  purchase_date: string;
  purchase_cost: number;
  depreciation_start?: string;
  current_value: number;
  status: "active" | "in_stock" | "assigned" | "maintenance" | "retired" | "lost" | "damaged";
  condition?: "excellent" | "good" | "fair" | "poor" | "critical";
  location?: string;
  notes?: string;
  description?: string;
  warranty_expiry?: string;
  depreciation_method?: "straight_line" | "declining_balance";
  useful_life_years?: number;
  created_at: string;
  updated_at?: string;
  category?: {
    name: string;
  };
  assignee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    staff_id: string;
  };
  maintenance_history?: AssetMaintenance[];
}

export interface CreateAssetData {
  name: string;
  category_id: string;
  serial_number?: string;
  purchase_date: string;
  purchase_cost: number;
  status?: Asset['status'];
  location?: string;
  description?: string;
  warranty_expiry?: string;
  depreciation_method?: "straight_line" | "declining_balance";
  useful_life_years?: number;
  asset_tag: string;
  depreciation_start?: string;
}

export interface UpdateAssetData {
  asset_tag?: string;
  name?: string;
  description?: string;
  category_id?: string;
  location_id?: string;
  status?: Asset['status'];
  condition?: Asset['condition'];
  purchase_date?: string;
  purchase_cost?: number;
  current_value?: number;
  depreciation_rate?: number;
  warranty_expires?: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  notes?: string;
  image_url?: string;
}

export interface AssetsResponse {
  assets: Asset[];
}

export interface AssetResponse {
  asset: Asset;
}

// Asset assignment types
export interface AssetAssignment {
  id: string;
  asset_id: string;
  employee_id: string;
  assigned_date: string;
  expected_return_date?: string;
  return_condition?: string | null;
  is_active: boolean;
  created_at: string;
  notes?: string;
  asset?: Asset;
  employee?: {
    email: string;
    last_name: string;
    first_name: string;
  };
}

export interface AssignAssetData {
  employee_id: string;
  assignment_date: string;
  expected_return_date?: string;
  notes?: string;
}

export interface UnassignAssetData {
  return_date: string;
  return_condition: string;
  notes?: string;
}

export interface TransferAssetData {
  from_employee_id: string;
  to_employee_id: string;
  notes?: string;
}

export interface AssetAssignmentsResponse {
  assignments: AssetAssignment[];
}

export interface AssetAssignmentResponse {
  assignment: AssetAssignment;
}

// Asset maintenance types
export interface AssetMaintenance {
  id: string;
  asset_id: string;
  type: "preventive" | "corrective" | "emergency" | "upgrade";
  title: string;
  description?: string;
  scheduled_date: string;
  completed_date?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  cost?: number;
  performed_by?: string;
  vendor?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  asset?: Asset;
  performer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateMaintenanceData {
  asset_id: string;
  type: AssetMaintenance['type'];
  title: string;
  description?: string;
  scheduled_date: string;
  cost?: number;
  performed_by?: string;
  vendor?: string;
  notes?: string;
}

export interface UpdateMaintenanceData {
  type?: AssetMaintenance['type'];
  title?: string;
  description?: string;
  scheduled_date?: string;
  completed_date?: string;
  status?: AssetMaintenance['status'];
  cost?: number;
  performed_by?: string;
  vendor?: string;
  notes?: string;
}

export interface CompleteMaintenanceData {
  completed_date: string;
  cost?: number;
  notes?: string;
  asset_condition?: Asset['condition'];
}

export interface AssetMaintenanceResponse {
  maintenance: AssetMaintenance[];
}

export interface MaintenanceResponse {
  maintenance: AssetMaintenance;
}

// Asset checkout/checkin types
export interface AssetCheckout {
  id: string;
  asset_id: string;
  employee_id: string;
  checkout_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  checkout_condition: Asset['condition'];
  return_condition?: Asset['condition'];
  status: "checked_out" | "returned" | "overdue";
  notes?: string;
  checked_out_by: string;
  checked_in_by?: string;
  created_at: string;
  updated_at?: string;
  asset?: Asset;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    staff_id: string;
  };
}

export interface CheckoutAssetData {
  employee_id: string;
  expected_return_date?: string;
  checkout_condition: Asset['condition'];
  notes?: string;
}

export interface CheckinAssetData {
  return_condition: Asset['condition'];
  notes?: string;
}

export interface AssetCheckoutsResponse {
  checkouts: AssetCheckout[];
}

export interface AssetCheckoutResponse {
  checkout: AssetCheckout;
}

// Asset category types
export interface AssetCategory {
  id: string;
  company_id: string;
  name: string;
  depreciation_method?: "straight_line" | "declining_balance";
  useful_life_months?: number;
  salvage_percentage?: number;
  created_at: string;
  description?: string;
  salvage_value_percentage?: number | null;
}

export interface CreateAssetCategoryData {
  name: string;
  description?: string;
  depreciation_rate?: number;
  depreciation_method?: "straight_line" | "declining_balance";
  useful_life_months?: number;
}

export interface UpdateAssetCategoryData {
  name?: string;
  description?: string;
  depreciation_rate?: number;
  color?: string;
  icon?: string;
}

export interface AssetCategoriesResponse {
  categories: AssetCategory[];
}

export interface AssetCategoryResponse {
  category: AssetCategory;
}

// Asset location types
export interface AssetLocation {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  address?: string;
  building?: string;
  floor?: string;
  room?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at?: string;
}

export interface CreateAssetLocationData {
  name: string;
  description?: string;
  address?: string;
  building?: string;
  floor?: string;
  room?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UpdateAssetLocationData {
  name?: string;
  description?: string;
  address?: string;
  building?: string;
  floor?: string;
  room?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AssetLocationsResponse {
  locations: AssetLocation[];
}

export interface AssetLocationResponse {
  location: AssetLocation;
}

// Asset status update types
export interface UpdateAssetStatusData {
  status: Asset['status'];
  condition?: Asset['condition'];
  notes?: string;
}

export interface DepreciateAssetData {
  depreciation_method?: "straight_line" | "declining_balance" | "units_of_production";
  useful_life_years?: number;
  salvage_value?: number;
}

export interface AssetDepreciationResponse {
  asset: Asset;
  depreciation_details: {
    method: string;
    annual_depreciation: number;
    accumulated_depreciation: number;
    book_value: number;
    remaining_useful_life: number;
  };
}

// Asset reports types
export interface AssetReport {
  id: string;
  type: "summary" | "depreciation" | "maintenance" | "utilization" | "audit";
  title: string;
  period_start?: string;
  period_end?: string;
  data: any; // Report-specific data structure
  generated_at: string;
  generated_by: string;
  company_id: string;
}

export interface AssetSummaryReport {
  total_assets: number;
  total_value: number;
  by_status: {
    status: Asset['status'];
    count: number;
    value: number;
  }[];
  by_category: {
    category_id: string;
    category_name: string;
    count: number;
    value: number;
  }[];
  by_location: {
    location_id: string;
    location_name: string;
    count: number;
    value: number;
  }[];
  by_condition: {
    condition: Asset['condition'];
    count: number;
    value: number;
  }[];
}

export interface AssetDepreciationReport {
  total_original_cost: number;
  total_current_value: number;
  total_depreciation: number;
  assets: {
    asset_id: string;
    asset_name: string;
    original_cost: number;
    current_value: number;
    depreciation_amount: number;
    depreciation_percentage: number;
  }[];
}

export interface AssetMaintenanceReport {
  total_maintenance_cost: number;
  scheduled_maintenance: number;
  completed_maintenance: number;
  overdue_maintenance: number;
  by_type: {
    type: AssetMaintenance['type'];
    count: number;
    cost: number;
  }[];
  upcoming_maintenance: AssetMaintenance[];
}

export interface AssetUtilizationReport {
  total_assets: number;
  assigned_assets: number;
  available_assets: number;
  utilization_rate: number;
  by_employee: {
    employee_id: string;
    employee_name: string;
    assigned_count: number;
    total_value: number;
  }[];
  by_department: {
    department_id: string;
    department_name: string;
    assigned_count: number;
    total_value: number;
  }[];
}

export interface AssetReportsResponse {
  reports: AssetReport[];
}

export interface AssetReportResponse {
  report: AssetReport;
}

// Asset audit types
export interface AssetAuditLog {
  id: string;
  asset_id: string;
  action: "created" | "updated" | "assigned" | "unassigned" | "transferred" | "maintenance_scheduled" | "maintenance_completed" | "status_changed" | "deleted";
  description: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  performed_by: string;
  performed_at: string;
  ip_address?: string;
  user_agent?: string;
  asset?: Asset;
  performer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface AssetAuditResponse {
  audit_logs: AssetAuditLog[];
}

export interface AssetAuditTrailResponse {
  audit_trail: AssetAuditLog[];
}

// Asset import/export types
export interface AssetImportData {
  file: File | string; // File object or base64 string
  file_type: "csv" | "xlsx" | "json";
  mapping?: Record<string, string>; // Field mapping
  options?: {
    skip_header?: boolean;
    update_existing?: boolean;
    create_categories?: boolean;
    create_locations?: boolean;
  };
}

export interface AssetImportResponse {
  success: boolean;
  imported_count: number;
  updated_count: number;
  failed_count: number;
  errors?: {
    row: number;
    field: string;
    message: string;
  }[];
  created_categories?: AssetCategory[];
  created_locations?: AssetLocation[];
}

export interface AssetExportData {
  format: "csv" | "xlsx" | "json" | "pdf";
  filters?: {
    status?: Asset['status'][];
    category_ids?: string[];
    location_ids?: string[];
    date_range?: {
      start: string;
      end: string;
    };
  };
  fields?: string[]; // Specific fields to export
}

export interface AssetExportResponse {
  file_url: string;
  file_name: string;
  expires_at: string;
}

export interface AssetBulkUpdateData {
  asset_ids: string[];
  updates: {
    status?: Asset['status'];
    condition?: Asset['condition'];
    location_id?: string;
    category_id?: string;
    notes?: string;
  };
}

export interface AssetBulkUpdateResponse {
  success: boolean;
  updated_count: number;
  failed_count: number;
  errors?: {
    asset_id: string;
    message: string;
  }[];
}

// Asset QR/Barcode types
export interface AssetQRCodeResponse {
  qr_code_url: string;
  qr_code_data: string;
}

export interface AssetBarcodeResponse {
  barcode_url: string;
  barcode_data: string;
  barcode_type: "CODE128" | "CODE39" | "EAN13" | "UPC";
}

export interface AssetScanData {
  scan_data: string;
  scan_type: "qr_code" | "barcode";
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface AssetScanResponse {
  asset: Asset;
  scan_successful: boolean;
  message?: string;
}

// ================================
// VENDOR TYPES
// ================================

export interface Vendor {
  id: string;
  company_id: string;
  name: string;
  category_id?: string;
  tax_number?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  contact_person?: string;
  payment_terms?: string;
  credit_limit?: number;
  status: "active" | "inactive" | "suspended";
  notes?: string;
  created_at: string;
  updated_at?: string;
  category?: VendorCategory;
}

export interface CreateVendorData {
  name: string;
  category_id?: string;
  tax_number?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  contact_person?: string;
  payment_terms?: string;
  credit_limit?: number;
  status?: "active" | "inactive" | "suspended";
  notes?: string;
}

export interface UpdateVendorData {
  name?: string;
  category_id?: string;
  tax_number?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  contact_person?: string;
  payment_terms?: string;
  credit_limit?: number;
  status?: "active" | "inactive" | "suspended";
  notes?: string;
}

export interface VendorsResponse {
  vendors: Vendor[];
}

export interface VendorResponse {
  vendor: Vendor;
}

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

export interface UpdateVendorCategoryData {
  name?: string;
  description?: string;
}

export interface VendorCategoriesResponse {
  categories: VendorCategory[];
}

export interface VendorCategoryResponse {
  category: VendorCategory;
}
