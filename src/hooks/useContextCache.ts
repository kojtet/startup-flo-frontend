import { useState, useCallback } from "react";
import { ApiError } from "@/apis/core/errors";

// ================================
// SHARED CACHE TYPES
// ================================

export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export interface CacheConfig {
  static: number;   // For relatively static data (10 minutes)
  dynamic: number;  // For frequently changing data (5 minutes)
  realtime: number; // For real-time data (1 minute)
}

// Simplified type definitions to avoid mapped type syntax issues
export type CacheState<T> = Record<keyof T, CacheItem<any> | null>;
export type LoadingState<T> = Record<string, boolean>;
export type ErrorState<T> = Record<string, string | null>;
export type DataState<T> = T;

// ================================
// CACHE DURATIONS
// ================================

export const DEFAULT_CACHE_DURATION: CacheConfig = {
  static: 10 * 60 * 1000,   // 10 minutes - categories, departments, etc.
  dynamic: 5 * 60 * 1000,   // 5 minutes - transactions, requests, etc.
  realtime: 1 * 60 * 1000,  // 1 minute - real-time data
};

// ================================
// SHARED CACHE HOOK
// ================================

export interface UseContextCacheOptions<T> {
  initialData: T;
  cacheConfig?: CacheConfig;
  dataTypeConfigs?: Partial<Record<keyof T, keyof CacheConfig>>;
}

export interface UseContextCacheReturn<T> {
  // Cache state
  cache: CacheState<T>;
  
  // Data state  
  data: DataState<T>;
  
  // Loading states
  loading: LoadingState<T>;
  
  // Error states
  errors: ErrorState<T>;
  
  // Cache utilities
  isCacheValid: <K extends keyof T>(key: K, customDuration?: number) => boolean;
  
  // Data fetching with cache
  fetchWithCache: <K extends keyof T>(
    key: K,
    fetcher: () => Promise<T[K]>,
    useCache?: boolean,
    customDuration?: number
  ) => Promise<T[K]>;
  
  // State setters
  setData: <K extends keyof T>(key: K, value: T[K]) => void;
  setLoading: <K extends keyof T>(key: K, loading: boolean) => void;
  setError: <K extends keyof T>(key: K, error: string | null) => void;
  
  // Cache management
  invalidateCache: (key?: keyof T) => void;
  clearCache: () => void;
  refreshData: (keys?: (keyof T)[]) => Promise<void>;
  
  // Batch operations
  setMultipleData: (updates: Partial<T>) => void;
  setMultipleLoading: (updates: Partial<LoadingState<T>>) => void;
  setMultipleErrors: (updates: Partial<ErrorState<T>>) => void;
}

export function useContextCache<T extends Record<string, any>>({
  initialData,
  cacheConfig = DEFAULT_CACHE_DURATION,
  dataTypeConfigs = {},
}: UseContextCacheOptions<T>): UseContextCacheReturn<T> {
  
  // ================================
  // STATE INITIALIZATION
  // ================================
  
  // Cache state
  const [cache, setCache] = useState<CacheState<T>>(() => {
    const initialCache = {} as CacheState<T>;
    Object.keys(initialData).forEach((key) => {
      initialCache[key as keyof T] = null;
    });
    return initialCache;
  });
  
  // Data state
  const [data, setDataState] = useState<DataState<T>>(initialData);
  
  // Loading states
  const [loading, setLoadingState] = useState<LoadingState<T>>(() => {
    const initialLoading = {} as LoadingState<T>;
    Object.keys(initialData).forEach((key) => {
      const loadingKey = `isLoading${key.charAt(0).toUpperCase() + key.slice(1)}`;
      initialLoading[loadingKey] = false;
    });
    return initialLoading;
  });
  
  // Error states
  const [errors, setErrorsState] = useState<ErrorState<T>>(() => {
    const initialErrors = {} as ErrorState<T>;
    Object.keys(initialData).forEach((key) => {
      const errorKey = `${key}Error`;
      initialErrors[errorKey] = null;
    });
    return initialErrors;
  });
  
  // ================================
  // CACHE UTILITIES
  // ================================
  
  const getCacheDuration = useCallback(<K extends keyof T>(key: K): number => {
    const configKey = dataTypeConfigs[key] || 'dynamic';
    return cacheConfig[configKey];
  }, [cacheConfig, dataTypeConfigs]);
  
  const isCacheValid = useCallback(<K extends keyof T>(
    key: K, 
    customDuration?: number
  ): boolean => {
    const cacheItem = cache[key];
    if (!cacheItem) return false;
    
    const duration = customDuration || getCacheDuration(key);
    return Date.now() - cacheItem.timestamp < duration;
  }, [cache, getCacheDuration]);
  
  // ================================
  // STATE SETTERS
  // ================================
  
  const setData = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setDataState(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const setLoading = useCallback(<K extends keyof T>(key: K, loading: boolean) => {
    const loadingKey = `isLoading${String(key).charAt(0).toUpperCase() + String(key).slice(1)}`;
    setLoadingState(prev => ({ ...prev, [loadingKey]: loading }));
  }, []);
  
  const setError = useCallback(<K extends keyof T>(key: K, error: string | null) => {
    const errorKey = `${String(key)}Error`;
    setErrorsState(prev => ({ ...prev, [errorKey]: error }));
  }, []);
  
  // ================================
  // FETCH WITH CACHE
  // ================================
  
  const fetchWithCache = useCallback(async <K extends keyof T>(
    key: K,
    fetcher: () => Promise<T[K]>,
    useCache: boolean = true,
    customDuration?: number
  ): Promise<T[K]> => {
    // Check cache first
    if (useCache && isCacheValid(key, customDuration)) {
      return cache[key]!.data;
    }
    
    // Start loading
    setLoading(key, true);
    setError(key, null);
    
    try {
      const result = await fetcher();
      
      // Update cache
      setCache(prev => ({
        ...prev,
        [key]: { data: result, timestamp: Date.now() }
      }));
      
      // Update data state
      setData(key, result);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : `Failed to load ${String(key)}`;
      setError(key, errorMessage);
      // Error will be propagated to calling context which has proper logging
      throw err;
    } finally {
      setLoading(key, false);
    }
  }, [cache, isCacheValid, setLoading, setError, setData]);
  
  // ================================
  // CACHE MANAGEMENT
  // ================================
  
  const invalidateCache = useCallback((key?: keyof T) => {
    if (key) {
      setCache(prev => ({ ...prev, [key]: null }));
    } else {
      const clearedCache = {} as CacheState<T>;
      Object.keys(cache).forEach((k) => {
        clearedCache[k as keyof T] = null;
      });
      setCache(clearedCache);
    }
  }, [cache]);
  
  const clearCache = useCallback(() => {
    invalidateCache();
  }, [invalidateCache]);
  
  const refreshData = useCallback(async (keys?: (keyof T)[]) => {
    const keysToRefresh = keys || Object.keys(data) as (keyof T)[];
    
    // Just invalidate cache - actual refresh will happen when data is next accessed
    keysToRefresh.forEach(key => {
      invalidateCache(key);
    });
  }, [data, invalidateCache]);
  
  // ================================
  // BATCH OPERATIONS
  // ================================
  
  const setMultipleData = useCallback((updates: Partial<T>) => {
    setDataState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const setMultipleLoading = useCallback((updates: Partial<LoadingState<T>>) => {
    setLoadingState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const setMultipleErrors = useCallback((updates: Partial<ErrorState<T>>) => {
    setErrorsState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // ================================
  // RETURN INTERFACE
  // ================================
  
  return {
    // State
    cache,
    data,
    loading,
    errors,
    
    // Utilities
    isCacheValid,
    fetchWithCache,
    
    // Setters
    setData,
    setLoading,
    setError,
    
    // Cache management
    invalidateCache,
    clearCache,
    refreshData,
    
    // Batch operations
    setMultipleData,
    setMultipleLoading,
    setMultipleErrors,
  };
}

// ================================
// UTILITY TYPES FOR CONTEXTS
// ================================

export type ContextCacheHook<T> = UseContextCacheReturn<T>;

// Helper to create optimized getter functions
export const createOptimizedGetter = <T extends Record<string, any>, K extends keyof T>(
  cache: ContextCacheHook<T>,
  key: K,
  fetcher: () => Promise<T[K]>
) => {
  return async (useCache: boolean = true): Promise<T[K]> => {
    return cache.fetchWithCache(key, fetcher, useCache);
  };
}; 