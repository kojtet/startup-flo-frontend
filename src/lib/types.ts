/**
 * @fileoverview Comprehensive TypeScript interfaces for the Fihankra Safety Sentinel application.
 * 
 * This file contains all the enhanced TypeScript interfaces used throughout the application,
 * including context states, service responses, form data, utility types, error handling,
 * caching, component props, and more.
 * 
 * @author Fihankra Safety Sentinel Team
 * @version 1.0.0
 * @since 2024
 */

import { ErrorSeverity } from '@/apis/core/errors';

// ================================
// CONTEXT STATE INTERFACES
// ================================

/**
 * Base context state interface that provides common state management properties
 * for all React contexts in the application.
 * 
 * @template T - The type of data stored in the context
 * 
 * @example
 * ```typescript
 * interface UserContextState extends BaseContextState<User> {
 *   // Additional user-specific properties
 *   permissions: string[];
 *   preferences: UserPreferences;
 * }
 * ```
 */
export interface BaseContextState<T = any> {
  /** The main data object stored in the context */
  data: T | null;
  /** Whether the context is currently loading data */
  loading: boolean;
  /** Any error that occurred during data fetching or operations */
  error: Error | null;
  /** ISO timestamp of when the data was last updated */
  lastUpdated: string | null;
}

/**
 * Extended context state interface for paginated data with sorting and filtering capabilities.
 * 
 * @template T - The type of individual items in the paginated array
 * 
 * @example
 * ```typescript
 * interface UserListContextState extends PaginatedContextState<User> {
 *   // Additional user list specific properties
 *   selectedUsers: string[];
 *   bulkActions: BulkAction[];
 * }
 * ```
 */
export interface PaginatedContextState<T> extends BaseContextState<T[]> {
  /** Pagination information for the current data set */
  pagination: {
    /** Current page number (1-based) */
    currentPage: number;
    /** Total number of pages available */
    totalPages: number;
    /** Number of items per page */
    perPage: number;
    /** Total number of items across all pages */
    totalItems: number;
    /** Whether there is a next page available */
    hasNextPage: boolean;
    /** Whether there is a previous page available */
    hasPrevPage: boolean;
  };
  /** Active filters applied to the data */
  filters: Record<string, any>;
  /** Field name used for sorting */
  sortBy: string | null;
  /** Sort direction ('asc' for ascending, 'desc' for descending) */
  sortOrder: 'asc' | 'desc' | null;
}

/**
 * Finance context state interface that manages all financial data and operations.
 * 
 * This interface extends BaseContextState to provide comprehensive financial data management
 * including invoices, expenses, payments, budgets, accounts, categories, and transactions.
 * 
 * @example
 * ```typescript
 * const financeContext = useFinance();
 * const { data, loading, selectedPeriod, currency } = financeContext.state;
 * ```
 */
export interface FinanceContextState extends BaseContextState<{
  /** Financial overview data including totals and summaries */
  overview: any;
  /** Array of invoice records */
  invoices: any[];
  /** Array of expense records */
  expenses: any[];
  /** Array of payment records */
  payments: any[];
  /** Array of budget records */
  budgets: any[];
  /** Array of financial account records */
  accounts: any[];
  /** Array of category records */
  categories: any[];
  /** Array of transaction records */
  transactions: any[];
}> {
  /** Currently selected date period for financial data */
  selectedPeriod: {
    /** Start date in ISO format */
    start: string;
    /** End date in ISO format */
    end: string;
  };
  /** Currently selected currency for financial calculations */
  currency: string;
  /** Auto-refresh interval in milliseconds (null if disabled) */
  refreshInterval: number | null;
}

export interface CRMContextState extends PaginatedContextState<any> {
  pipelines: any[];
  stages: any[];
  activities: any[];
  notes: any[];
  campaigns: any[];
  selectedPipeline: string | null;
  selectedStage: string | null;
  filters: {
    status?: string[];
    assignedTo?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    source?: string[];
  };
}

export interface HRContextState extends PaginatedContextState<any> {
  employees: any[];
  leaveRequests: any[];
  onboardings: any[];
  departments: any[];
  selectedDepartment: string | null;
  filters: {
    status?: string[];
    department?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

export interface AssetsContextState extends PaginatedContextState<any> {
  assets: any[];
  assignments: any[];
  maintenance: any[];
  checkouts: any[];
  categories: any[];
  locations: any[];
  vendors: any[];
  selectedCategory: string | null;
  selectedLocation: string | null;
  filters: {
    status?: string[];
    condition?: string[];
    category?: string[];
    location?: string[];
    assignedTo?: string[];
  };
}

// ================================
// SERVICE RESPONSE INTERFACES
// ================================

/**
 * Standard API response interface for all API endpoints.
 * 
 * This interface provides a consistent structure for API responses across the application,
 * including success status, data payload, optional messages, validation errors, and metadata.
 * 
 * @template T - The type of data returned by the API
 * 
 * @example
 * ```typescript
 * const response: ApiResponse<User[]> = await api.get('/users');
 * if (response.success) {
 *   const users = response.data;
 * } else {
 *   console.error(response.errors);
 * }
 * ```
 */
export interface ApiResponse<T = any> {
  /** Whether the API request was successful */
  success: boolean;
  /** The main data payload returned by the API */
  data: T;
  /** Optional success or error message */
  message?: string;
  /** Validation errors organized by field name */
  errors?: Record<string, string[]>;
  /** Additional metadata about the response */
  meta?: {
    /** ISO timestamp of when the response was generated */
    timestamp: string;
    /** API version that generated this response */
    version: string;
    /** Unique request identifier for tracking */
    requestId: string;
  };
}

/**
 * Extended API response interface for paginated data.
 * 
 * This interface extends ApiResponse to include pagination information and navigation links
 * for handling large datasets that are split across multiple pages.
 * 
 * @template T - The type of individual items in the paginated array
 * 
 * @example
 * ```typescript
 * const response: PaginatedApiResponse<User> = await api.get('/users?page=1&limit=20');
 * const { data, pagination, links } = response;
 * 
 * if (pagination.hasNextPage) {
 *   const nextPage = await api.get(links.next);
 * }
 * ```
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  /** Pagination information for the current response */
  pagination: {
    /** Current page number (1-based) */
    currentPage: number;
    /** Total number of pages available */
    totalPages: number;
    /** Number of items per page */
    perPage: number;
    /** Total number of items across all pages */
    totalItems: number;
    /** Whether there is a next page available */
    hasNextPage: boolean;
    /** Whether there is a previous page available */
    hasPrevPage: boolean;
  };
  /** Navigation links for pagination */
  links: {
    /** URL for the first page */
    first: string;
    /** URL for the last page */
    last: string;
    /** URL for the previous page (null if no previous page) */
    prev: string | null;
    /** URL for the next page (null if no next page) */
    next: string | null;
  };
}

export interface ServiceResponse<T = any> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  success: boolean;
  timestamp: string;
}

export interface BatchOperationResponse {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{
    id: string;
    message: string;
    field?: string;
  }>;
}

// ================================
// FORM DATA INTERFACES
// ================================

/**
 * Base interface for all form data objects.
 * 
 * This interface provides common properties that are typically present in form data,
 * such as unique identifier and timestamp fields.
 * 
 * @example
 * ```typescript
 * interface UserFormData extends BaseFormData {
 *   email: string;
 *   firstName: string;
 *   lastName: string;
 * }
 * ```
 */
export interface BaseFormData {
  /** Unique identifier for the form data (optional for new records) */
  id?: string;
  /** ISO timestamp when the record was created */
  created_at?: string;
  /** ISO timestamp when the record was last updated */
  updated_at?: string;
}

/**
 * Interface for form validation errors.
 * 
 * This interface defines the structure of validation errors that can occur
 * during form validation, including the field name, error message, and error type.
 * 
 * @example
 * ```typescript
 * const errors: FormValidationError[] = [
 *   { field: 'email', message: 'Email is required', type: 'required' },
 *   { field: 'email', message: 'Invalid email format', type: 'invalid' }
 * ];
 * ```
 */
export interface FormValidationError {
  /** The name of the form field that has the error */
  field: string;
  /** Human-readable error message */
  message: string;
  /** Type of validation error */
  type: 'required' | 'invalid' | 'custom';
}

export interface FormState<T extends BaseFormData> {
  data: Partial<T>;
  errors: FormValidationError[];
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  touched: Record<string, boolean>;
}

export interface FormConfig<T extends BaseFormData> {
  initialData: Partial<T>;
  validationSchema?: any; // Yup schema or similar
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
}

// ================================
// UTILITY TYPE INTERFACES
// ================================

/**
 * Common status types used throughout the application.
 * 
 * This type defines the standard status values that can be used for various
 * entities like users, orders, projects, etc.
 * 
 * @example
 * ```typescript
 * const userStatus: StatusType = 'active';
 * const orderStatus: StatusType = 'pending';
 * ```
 */
export type StatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'draft';

/**
 * Priority levels used for tasks, issues, and other prioritizable items.
 * 
 * @example
 * ```typescript
 * const taskPriority: PriorityType = 'high';
 * const bugPriority: PriorityType = 'critical';
 * ```
 */
export type PriorityType = 'low' | 'medium' | 'high' | 'critical';

/**
 * Sort order directions for data sorting operations.
 * 
 * @example
 * ```typescript
 * const sortOrder: SortOrder = 'asc';
 * const reverseSort: SortOrder = 'desc';
 * ```
 */
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike';
  value: any;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: SortConfig;
  filters?: FilterConfig[];
  search?: string;
  include?: string[];
  fields?: string[];
}

export interface DateRange {
  start: string;
  end: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T) => React.ReactNode;
  formatter?: (value: any) => string;
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  searchable?: boolean;
  rowKey?: string | ((record: T) => string);
}

// ================================
// ERROR HANDLING INTERFACES
// ================================

/**
 * Extended error interface for application-specific errors.
 * 
 * This interface extends the standard Error interface to include additional
 * properties useful for error handling, logging, and user feedback.
 * 
 * @example
 * ```typescript
 * const error: AppError = {
 *   name: 'ValidationError',
 *   message: 'Invalid input data',
 *   code: 'VALIDATION_FAILED',
 *   statusCode: 400,
 *   timestamp: new Date().toISOString(),
 *   severity: 'medium',
 *   userFriendlyMessage: 'Please check your input and try again'
 * };
 * ```
 */
export interface AppError extends Error {
  /** Unique error code for programmatic error handling */
  code: string;
  /** HTTP status code associated with the error */
  statusCode?: number;
  /** Additional context information about the error */
  context?: Record<string, any>;
  /** ISO timestamp when the error occurred */
  timestamp: string;
  /** Unique request identifier for error tracking */
  requestId?: string;
  /** User-friendly error message for display */
  userFriendlyMessage?: string;
  /** Whether the operation can be retried */
  retryable?: boolean;
  /** Error severity level for prioritization */
  severity: ErrorSeverity;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: React.ErrorInfo | null;
}

export interface ErrorHandlerConfig {
  onError?: (error: AppError) => void;
  onRetry?: () => void;
  showUserFriendlyMessage?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  rule?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ================================
// CACHE INTERFACES
// ================================

/**
 * Interface for cache entries stored in the application cache.
 * 
 * This interface defines the structure of individual cache entries,
 * including the cached data, metadata, and access statistics.
 * 
 * @template T - The type of data stored in the cache entry
 * 
 * @example
 * ```typescript
 * const cacheEntry: CacheEntry<User> = {
 *   key: 'user:123',
 *   data: { id: '123', name: 'John Doe' },
 *   timestamp: Date.now(),
 *   ttl: 300000, // 5 minutes
 *   accessCount: 5,
 *   lastAccessed: Date.now(),
 *   tags: ['user', 'profile']
 * };
 * ```
 */
export interface CacheEntry<T = any> {
  /** Unique key identifying the cache entry */
  key: string;
  /** The actual data stored in the cache */
  data: T;
  /** Unix timestamp when the entry was created */
  timestamp: number;
  /** Time-to-live in milliseconds */
  ttl: number;
  /** Number of times this entry has been accessed */
  accessCount: number;
  /** Unix timestamp of the last access */
  lastAccessed: number;
  /** Optional tags for categorizing and bulk operations */
  tags?: string[];
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enablePersistence: boolean;
  enableCompression: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
  evictions: number;
  lastCleanup: number;
}

export interface CacheOperation<T = any> {
  type: 'get' | 'set' | 'delete' | 'clear' | 'evict';
  key: string;
  data?: T;
  timestamp: number;
  success: boolean;
  duration: number;
}

// ================================
// COMPONENT PROPS INTERFACES
// ================================

/**
 * Props interface for modal components.
 * 
 * This interface defines the standard props for modal dialogs used throughout
 * the application, providing consistent behavior and styling options.
 * 
 * @example
 * ```typescript
 * const MyModal: React.FC<ModalProps> = ({ 
 *   isOpen, 
 *   onClose, 
 *   title, 
 *   children 
 * }) => {
 *   if (!isOpen) return null;
 *   
 *   return (
 *     <div className="modal">
 *       <h2>{title}</h2>
 *       {children}
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * };
 * ```
 */
export interface ModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback function to close the modal */
  onClose: () => void;
  /** Optional title displayed in the modal header */
  title?: string;
  /** Size variant for the modal */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether clicking the overlay should close the modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape should close the modal */
  closeOnEscape?: boolean;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Modal content */
  children: React.ReactNode;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: Error | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    perPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    sortBy: string | null;
    sortOrder: SortOrder | null;
    onSort: (field: string, order: SortOrder) => void;
  };
  selection?: {
    selectedRows: string[];
    onSelectionChange: (selectedRows: string[]) => void;
    selectable?: boolean;
  };
  search?: {
    value: string;
    onSearch: (value: string) => void;
    placeholder?: string;
  };
  filters?: {
    filters: FilterConfig[];
    onFiltersChange: (filters: FilterConfig[]) => void;
  };
  rowActions?: (record: T) => React.ReactNode;
  emptyState?: React.ReactNode;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

export interface InputFieldProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export interface SelectFieldProps extends FormFieldProps {
  options: SelectOption[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  onSearch?: (query: string) => void;
}

export interface DateFieldProps extends FormFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  format?: string;
  minDate?: string;
  maxDate?: string;
  showTime?: boolean;
  timeFormat?: string;
}

export interface FileUploadProps extends FormFieldProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  dragAndDrop?: boolean;
  preview?: boolean;
}

// ================================
// NOTIFICATION INTERFACES
// ================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  timestamp: number;
  read?: boolean;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationConfig {
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications: number;
  defaultDuration: number;
  enableSound: boolean;
  enableVibration: boolean;
}

// ================================
// THEME INTERFACES
// ================================

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    border: string;
    divider: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// ================================
// PERMISSION INTERFACES
// ================================

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPermissions {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

// ================================
// AUDIT INTERFACES
// ================================

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  resource?: string;
  dateRange?: DateRange;
  limit?: number;
}

// ================================
// EXPORT/IMPORT INTERFACES
// ================================

export interface ExportConfig {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  fields: string[];
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: SortOrder;
  includeHeaders?: boolean;
  dateFormat?: string;
}

export interface ImportConfig {
  format: 'csv' | 'xlsx' | 'json';
  mapping: Record<string, string>;
  skipHeader?: boolean;
  updateExisting?: boolean;
  validateData?: boolean;
  batchSize?: number;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  updatedRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value?: any;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

// ================================
// WEBSOCKET INTERFACES
// ================================

export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
  id?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

// ================================
// ANALYTICS INTERFACES
// ================================

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  context?: {
    page: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
  enableDebug?: boolean;
  respectPrivacy?: boolean;
}

// ================================
// INTERNATIONALIZATION INTERFACES
// ================================

export interface Locale {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
  };
}

export interface Translation {
  key: string;
  value: string;
  locale: string;
  namespace?: string;
  context?: Record<string, any>;
}

export interface I18nConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
  loadPath: string;
  debug: boolean;
  interpolation: {
    prefix: string;
    suffix: string;
  };
}

// ================================
// FEATURE FLAG INTERFACES
// ================================

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions?: {
    users?: string[];
    roles?: string[];
    companies?: string[];
    percentage?: number;
    dateRange?: DateRange;
  };
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagConfig {
  endpoint?: string;
  refreshInterval?: number;
  cacheEnabled?: boolean;
  fallbackValue?: boolean;
}

// ================================
// TYPE GUARDS AND UTILITIES
// ================================

/**
 * Type guard to check if an object is an AppError.
 * 
 * This function checks if the provided object has the required properties
 * of an AppError interface.
 * 
 * @param error - The object to check
 * @returns True if the object is an AppError, false otherwise
 * 
 * @example
 * ```typescript
 * const error = someFunction();
 * if (isAppError(error)) {
 *   console.log(error.code, error.severity);
 * }
 * ```
 */
export const isAppError = (error: any): error is AppError => {
  return error && typeof error === 'object' && 'code' in error && 'severity' in error;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error && typeof error === 'object' && 'field' in error && 'message' in error;
};

export const isDateRange = (obj: any): obj is DateRange => {
  return obj && typeof obj === 'object' && 'start' in obj && 'end' in obj;
};

export const isSelectOption = (obj: any): obj is SelectOption => {
  return obj && typeof obj === 'object' && 'value' in obj && 'label' in obj;
};

// ================================
// CONSTANTS
// ================================

/**
 * Predefined select options for status values.
 * 
 * This constant provides a standardized set of status options that can be used
 * in select dropdowns throughout the application.
 * 
 * @example
 * ```typescript
 * <Select options={STATUS_OPTIONS} value={status} onChange={setStatus} />
 * ```
 */
export const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'draft', label: 'Draft' },
];

export const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export const SORT_ORDER_OPTIONS: SelectOption[] = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];

// ================================
// RE-EXPORTS FROM MAIN TYPES
// ================================

// Re-export commonly used types from the main types file
export type {
  User,
  Company,
  Department,
  Employee,
  Project,
  ProjectTask,
  Lead,
  Contact,
  Account,
  Opportunity,
  Invoice,
  Expense,
  Payment,
  Budget,
  Asset,
  AssetAssignment,
  AssetMaintenance,
  AssetCheckout,
  AssetCategory,
  AssetLocation,
  Vendor,
  VendorCategory,
  Campaign,
  Activity,
  Note,
  Stage,
  Pipeline,
  FinancialAccount,
  Category,
  Transaction,
  BudgetCategory,
  BudgetAllocation,
  BudgetTransaction,
  LeaveRequest,
  Onboarding,
  OnboardingTask,
  Invitation,
  CompanyModule,
  TaxRecord,
  FinancialReport,
  AssetReport,
  AssetAuditLog,
} from '../apis/types'; 