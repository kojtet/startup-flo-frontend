import type { CacheConfig } from '@/lib/types';

// Cache duration constants (in milliseconds)
export const CACHE_DURATIONS = {
  // Static data - rarely changes
  STATIC: 30 * 60 * 1000,        // 30 minutes - categories, configurations, lookup data
  SEMI_STATIC: 15 * 60 * 1000,   // 15 minutes - employee data, asset categories
  
  // Dynamic data - changes frequently
  DYNAMIC: 5 * 60 * 1000,        // 5 minutes - transactions, activities, assignments
  REAL_TIME: 2 * 60 * 1000,      // 2 minutes - real-time data like notifications
  
  // User-specific data
  USER_SESSION: 60 * 60 * 1000,  // 1 hour - user preferences, settings
} as const;

// Cache size limits (in MB)
export const CACHE_SIZES = {
  SMALL: 5,    // 5MB - for small datasets
  MEDIUM: 10,  // 10MB - for medium datasets
  LARGE: 25,   // 25MB - for large datasets
  XLARGE: 50,  // 50MB - for very large datasets
} as const;

// Standard cache configurations for different data types
export const CACHE_CONFIGS = {
  // Finance data
  FINANCE: {
    budgets: {
      maxSize: CACHE_SIZES.MEDIUM,
      defaultTTL: CACHE_DURATIONS.SEMI_STATIC,
      cleanupInterval: 60 * 1000,
      enablePersistence: true,
      enableCompression: false,
    },
    transactions: {
      maxSize: CACHE_SIZES.LARGE,
      maxAge: CACHE_DURATIONS.DYNAMIC,
      persistToStorage: true,
      storageKey: 'finance_transactions',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.7,
    },
    invoices: {
      maxSize: CACHE_SIZES.MEDIUM,
      maxAge: CACHE_DURATIONS.DYNAMIC,
      persistToStorage: true,
      storageKey: 'finance_invoices',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.7,
    },
    expenses: {
      maxSize: CACHE_SIZES.MEDIUM,
      maxAge: CACHE_DURATIONS.DYNAMIC,
      persistToStorage: true,
      storageKey: 'finance_expenses',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.7,
    },
    categories: {
      maxSize: CACHE_SIZES.SMALL,
      maxAge: CACHE_DURATIONS.STATIC,
      persistToStorage: true,
      storageKey: 'finance_categories',
      backgroundRefresh: false,
    },
  },

  // CRM data
  CRM: {
    leads: {
      maxSize: CACHE_SIZES.MEDIUM,
      maxAge: CACHE_DURATIONS.DYNAMIC,
      persistToStorage: true,
      storageKey: 'crm_leads',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.7,
    },
    contacts: {
      maxSize: CACHE_SIZES.MEDIUM,
      maxAge: CACHE_DURATIONS.SEMI_STATIC,
      persistToStorage: true,
      storageKey: 'crm_contacts',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.8,
    },
    accounts: {
      maxSize: CACHE_SIZES.MEDIUM,
      maxAge: CACHE_DURATIONS.SEMI_STATIC,
      persistToStorage: true,
      storageKey: 'crm_accounts',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.8,
    },
    opportunities: {
      maxSize: CACHE_SIZES.MEDIUM,
      maxAge: CACHE_DURATIONS.DYNAMIC,
      persistToStorage: true,
      storageKey: 'crm_opportunities',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.7,
    },
    activities: {
      maxSize: CACHE_SIZES.LARGE,
      maxAge: CACHE_DURATIONS.DYNAMIC,
      persistToStorage: true,
      storageKey: 'crm_activities',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.6,
    },
    pipelines: {
      maxSize: CACHE_SIZES.SMALL,
      maxAge: CACHE_DURATIONS.STATIC,
      persistToStorage: true,
      storageKey: 'crm_pipelines',
      backgroundRefresh: false,
    },
    stages: {
      maxSize: CACHE_SIZES.SMALL,
      maxAge: CACHE_DURATIONS.STATIC,
      persistToStorage: true,
      storageKey: 'crm_stages',
      backgroundRefresh: false,
    },
  },

  // HR data
  HR: {
    employees: {
      maxSize: CACHE_SIZES.MEDIUM,
      maxAge: CACHE_DURATIONS.SEMI_STATIC,
      persistToStorage: true,
      storageKey: 'hr_employees',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.8,
    },
    leaveRequests: {
      maxSize: CACHE_SIZES.MEDIUM,
      maxAge: CACHE_DURATIONS.DYNAMIC,
      persistToStorage: true,
      storageKey: 'hr_leave_requests',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.7,
    },
    onboardings: {
      maxSize: CACHE_SIZES.MEDIUM,
      maxAge: CACHE_DURATIONS.DYNAMIC,
      persistToStorage: true,
      storageKey: 'hr_onboardings',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.7,
    },
  },

  // Assets data
  ASSETS: {
    assets: {
      maxSize: CACHE_SIZES.LARGE,
      maxAge: CACHE_DURATIONS.SEMI_STATIC,
      persistToStorage: true,
      storageKey: 'assets_list',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.8,
    },
    categories: {
      maxSize: CACHE_SIZES.SMALL,
      maxAge: CACHE_DURATIONS.STATIC,
      persistToStorage: true,
      storageKey: 'assets_categories',
      backgroundRefresh: false,
    },
    assignments: {
      maxSize: CACHE_SIZES.MEDIUM,
      maxAge: CACHE_DURATIONS.DYNAMIC,
      persistToStorage: true,
      storageKey: 'assets_assignments',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.7,
    },
    maintenance: {
      maxSize: CACHE_SIZES.MEDIUM,
      maxAge: CACHE_DURATIONS.DYNAMIC,
      persistToStorage: true,
      storageKey: 'assets_maintenance',
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.7,
    },
  },

  // User preferences and settings
  USER: {
    preferences: {
      maxSize: CACHE_SIZES.SMALL,
      maxAge: CACHE_DURATIONS.USER_SESSION,
      persistToStorage: true,
      storageKey: 'user_preferences',
      backgroundRefresh: false,
    },
    settings: {
      maxSize: CACHE_SIZES.SMALL,
      maxAge: CACHE_DURATIONS.USER_SESSION,
      persistToStorage: true,
      storageKey: 'user_settings',
      backgroundRefresh: false,
    },
  },

  // Notifications and real-time data
  REAL_TIME: {
    notifications: {
      maxSize: CACHE_SIZES.SMALL,
      maxAge: CACHE_DURATIONS.REAL_TIME,
      persistToStorage: false,
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.5,
    },
    alerts: {
      maxSize: CACHE_SIZES.SMALL,
      maxAge: CACHE_DURATIONS.REAL_TIME,
      persistToStorage: false,
      backgroundRefresh: true,
      backgroundRefreshThreshold: 0.5,
    },
  },
} as const;

// Helper function to get cache config for a specific data type
export function getCacheConfig(
  module: keyof typeof CACHE_CONFIGS,
  dataType: string
): CacheConfig {
  const moduleConfig = CACHE_CONFIGS[module];
  const config = moduleConfig[dataType as keyof typeof moduleConfig];
  
  if (!config) {
    // Default fallback configuration
    return {
      maxSize: CACHE_SIZES.MEDIUM,
      defaultTTL: CACHE_DURATIONS.DYNAMIC,
      cleanupInterval: 60 * 1000,
      enablePersistence: true,
      enableCompression: false,
    };
  }
  
  return config;
}

// Helper function to create cache key with namespace
export function createCacheKey(module: string, dataType: string, identifier?: string): string {
  const baseKey = `${module}:${dataType}`;
  return identifier ? `${baseKey}:${identifier}` : baseKey;
}

// Helper function to invalidate related caches
export function getRelatedCacheKeys(module: string, dataType: string): string[] {
  const patterns = [
    `${module}:${dataType}*`,
    `${module}:*${dataType}*`,
  ];
  
  // Add module-specific related keys
  switch (module) {
    case 'finance':
      if (dataType === 'transactions') {
        patterns.push('finance:budgets*', 'finance:expenses*');
      }
      break;
    case 'crm':
      if (dataType === 'opportunities') {
        patterns.push('crm:activities*', 'crm:leads*');
      }
      break;
    case 'hr':
      if (dataType === 'employees') {
        patterns.push('hr:leave_requests*', 'hr:onboardings*');
      }
      break;
    case 'assets':
      if (dataType === 'assets') {
        patterns.push('assets:assignments*', 'assets:maintenance*');
      }
      break;
  }
  
  return patterns;
}

// Cache warming configurations for different modules
export const CACHE_WARMING_CONFIGS = {
  finance: [
    { key: 'finance:categories', priority: 'high' },
    { key: 'finance:budgets', priority: 'high' },
    { key: 'finance:transactions', priority: 'medium' },
  ],
  crm: [
    { key: 'crm:pipelines', priority: 'high' },
    { key: 'crm:stages', priority: 'high' },
    { key: 'crm:leads', priority: 'medium' },
    { key: 'crm:contacts', priority: 'medium' },
  ],
  hr: [
    { key: 'hr:employees', priority: 'high' },
    { key: 'hr:leave_requests', priority: 'medium' },
  ],
  assets: [
    { key: 'assets:categories', priority: 'high' },
    { key: 'assets:assets', priority: 'medium' },
  ],
} as const;

// Performance monitoring configuration
export const CACHE_MONITORING = {
  // Enable performance monitoring
  enabled: process.env.NODE_ENV === 'development',
  
  // Log cache statistics every N seconds
  statsInterval: 30000, // 30 seconds
  
  // Alert thresholds
  thresholds: {
    hitRate: 0.7,        // Alert if hit rate drops below 70%
    memoryUsage: 0.8,    // Alert if memory usage exceeds 80%
    responseTime: 1000,  // Alert if average response time exceeds 1 second
  },
  
  // Performance metrics to track
  metrics: [
    'hit_rate',
    'memory_usage',
    'response_time',
    'eviction_rate',
    'background_refresh_success_rate',
  ],
} as const; 