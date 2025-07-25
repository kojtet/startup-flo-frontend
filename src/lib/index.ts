/**
 * @fileoverview Main library exports for the Fihankra Safety Sentinel application.
 * 
 * This file serves as the central export point for all enhanced types, utilities,
 * constants, and configurations used throughout the application. It provides a
 * clean and organized way to import all necessary functionality from the lib module.
 * 
 * @author Fihankra Safety Sentinel Team
 * @version 1.0.0
 * @since 2024
 */

// ================================
// LIBRARY EXPORTS
// ================================

// Enhanced TypeScript interfaces
export * from './types';

// Utility functions
export * from './utils';

// Error handling utilities
export * from './errorHandling';

// Cache utilities
export * from './cache';

// Form utilities
export * from './formUtils';

// Validation utilities
export * from './validation';

// Date utilities
export * from './dateUtils';

// String utilities
export * from './stringUtils';

// Number utilities
export * from './numberUtils';

// Array utilities
export * from './arrayUtils';

// Object utilities
export * from './objectUtils';

// API utilities
export * from './apiUtils';

// Storage utilities
export * from './storageUtils';

// Theme utilities
export * from './themeUtils';

// Permission utilities
export * from './permissionUtils';

// Analytics utilities
export * from './analyticsUtils';

// Internationalization utilities
export * from './i18nUtils';

// Feature flag utilities
export * from './featureFlagUtils';

// WebSocket utilities
export * from './websocketUtils';

// Export/Import utilities
export * from './exportImportUtils';

// Audit utilities
export * from './auditUtils';

// Notification utilities
export * from './notificationUtils';

// ================================
// RE-EXPORTS FROM APIS
// ================================

// Re-export all types from the main types file
export * from '../apis/types';

// ================================
// COMMON EXPORTS
// ================================

// Common constants
export const APP_NAME = 'Fihankra Safety Sentinel';
export const APP_VERSION = '1.0.0';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000';

// Common configurations
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  maxLimit: 100,
};

export const DEFAULT_CACHE_CONFIG = {
  maxSize: 1000,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
  enablePersistence: true,
  enableCompression: false,
};

export const DEFAULT_ERROR_CONFIG = {
  showUserFriendlyMessage: true,
  logToConsole: true,
  reportToService: true,
  retryAttempts: 3,
  retryDelay: 1000,
};

export const DEFAULT_NOTIFICATION_CONFIG = {
  position: 'top-right' as const,
  maxNotifications: 5,
  defaultDuration: 5000,
  enableSound: true,
  enableVibration: false,
};

export const DEFAULT_THEME = {
  name: 'default',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    border: '#e2e8f0',
    divider: '#f1f5f9',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
};

// Common date formats
export const DATE_FORMATS = {
  short: 'MM/dd/yyyy',
  medium: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  full: 'EEEE, MMMM dd, yyyy',
  time: 'HH:mm:ss',
  datetime: 'MM/dd/yyyy HH:mm:ss',
  iso: 'yyyy-MM-dd',
  isoDateTime: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx',
} as const;

// Common currency formats
export const CURRENCY_FORMATS = {
  USD: {
    code: 'USD',
    symbol: '$',
    position: 'before' as const,
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    position: 'before' as const,
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    position: 'before' as const,
    decimals: 2,
  },
  GHS: {
    code: 'GHS',
    symbol: '₵',
    position: 'before' as const,
    decimals: 2,
  },
} as const;

// Common file types
export const FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  presentations: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
} as const;

// Common file size limits
export const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  spreadsheet: 10 * 1024 * 1024, // 10MB
  presentation: 20 * 1024 * 1024, // 20MB
  archive: 50 * 1024 * 1024, // 50MB
  video: 100 * 1024 * 1024, // 100MB
} as const;

// Common validation rules
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
} as const;

// Common status mappings
export const STATUS_MAPPINGS = {
  active: { label: 'Active', color: 'green', icon: 'check-circle' },
  inactive: { label: 'Inactive', color: 'gray', icon: 'x-circle' },
  pending: { label: 'Pending', color: 'yellow', icon: 'clock' },
  completed: { label: 'Completed', color: 'green', icon: 'check' },
  cancelled: { label: 'Cancelled', color: 'red', icon: 'x' },
  draft: { label: 'Draft', color: 'blue', icon: 'file-text' },
} as const;

// Common priority mappings
export const PRIORITY_MAPPINGS = {
  low: { label: 'Low', color: 'gray', icon: 'arrow-down' },
  medium: { label: 'Medium', color: 'yellow', icon: 'minus' },
  high: { label: 'High', color: 'orange', icon: 'arrow-up' },
  critical: { label: 'Critical', color: 'red', icon: 'alert-triangle' },
} as const;

// Common sort options
export const SORT_OPTIONS = {
  name: { label: 'Name', field: 'name' },
  date: { label: 'Date', field: 'created_at' },
  status: { label: 'Status', field: 'status' },
  priority: { label: 'Priority', field: 'priority' },
  amount: { label: 'Amount', field: 'amount' },
  updated: { label: 'Last Updated', field: 'updated_at' },
} as const;

// Common filter options
export const FILTER_OPTIONS = {
  status: {
    label: 'Status',
    type: 'select',
    options: Object.entries(STATUS_MAPPINGS).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  },
  priority: {
    label: 'Priority',
    type: 'select',
    options: Object.entries(PRIORITY_MAPPINGS).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  },
  dateRange: {
    label: 'Date Range',
    type: 'daterange',
  },
  assignedTo: {
    label: 'Assigned To',
    type: 'select',
    options: [], // Will be populated dynamically
  },
  category: {
    label: 'Category',
    type: 'select',
    options: [], // Will be populated dynamically
  },
} as const; 