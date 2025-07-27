import { useState, useCallback, useRef } from 'react';
import { api } from '@/apis';

// Define the missing types locally
interface BatchRequestConfig {
  concurrency?: number;
  timeout?: number;
  retries?: number;
}

interface BatchRequestResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  index: number;
}

interface UseBatchRequestsOptions {
  config?: BatchRequestConfig;
  onProgress?: (completed: number, total: number) => void;
}

interface BatchState<T> {
  loading: boolean;
  results: BatchRequestResult<T>[];
  error: Error | null;
  progress: { completed: number; total: number };
}

export const useBatchRequests = <T = any>(options: UseBatchRequestsOptions = {}) => {
  const [state, setState] = useState<BatchState<T>>({
    loading: false,
    results: [],
    error: null,
    progress: { completed: 0, total: 0 },
  });

  const executeBatch = useCallback(async (
    requests: (() => Promise<T>)[],
    customConfig?: BatchRequestConfig
  ) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      progress: { completed: 0, total: requests.length },
    }));

    try {
      const results: BatchRequestResult<T>[] = [];
      let completed = 0;

      for (let i = 0; i < requests.length; i++) {
        try {
          const data = await requests[i]();
          results.push({ success: true, data, index: i });
        } catch (error) {
          results.push({ 
            success: false, 
            error: error instanceof Error ? error : new Error(String(error)), 
            index: i 
          });
        }
        
        completed++;
        setState(prev => ({
          ...prev,
          progress: { completed, total: requests.length },
        }));
        options.onProgress?.(completed, requests.length);
      }

      setState(prev => ({
        ...prev,
        loading: false,
        results,
        progress: { completed: results.length, total: results.length },
      }));

      return results;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorObj,
      }));
      throw errorObj;
    }
  }, [options.onProgress]);

  const executeBatchGet = useCallback(async (
    endpoints: string[],
    config?: any,
    customConfig?: BatchRequestConfig
  ) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      progress: { completed: 0, total: endpoints.length },
    }));

    try {
      const results: BatchRequestResult<T>[] = [];
      let completed = 0;

      for (let i = 0; i < endpoints.length; i++) {
        try {
          const response = await api.get(endpoints[i], config);
          results.push({ success: true, data: response.data, index: i });
        } catch (error) {
          results.push({ 
            success: false, 
            error: error instanceof Error ? error : new Error(String(error)), 
            index: i 
          });
        }
        
        completed++;
        setState(prev => ({
          ...prev,
          progress: { completed, total: endpoints.length },
        }));
        options.onProgress?.(completed, endpoints.length);
      }

      setState(prev => ({
        ...prev,
        loading: false,
        results,
        progress: { completed: results.length, total: results.length },
      }));

      return results;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorObj,
      }));
      throw errorObj;
    }
  }, [options.onProgress]);

  const executeBatchPost = useCallback(async (
    requests: Array<{ endpoint: string; data?: any; config?: any }>,
    customConfig?: BatchRequestConfig
  ) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      progress: { completed: 0, total: requests.length },
    }));

    try {
      const results: BatchRequestResult<T>[] = [];
      let completed = 0;

      for (let i = 0; i < requests.length; i++) {
        try {
          const { endpoint, data, config } = requests[i];
          const response = await api.post(endpoint, data, config);
          results.push({ success: true, data: response.data, index: i });
        } catch (error) {
          results.push({ 
            success: false, 
            error: error instanceof Error ? error : new Error(String(error)), 
            index: i 
          });
        }
        
        completed++;
        setState(prev => ({
          ...prev,
          progress: { completed, total: requests.length },
        }));
        options.onProgress?.(completed, requests.length);
      }

      setState(prev => ({
        ...prev,
        loading: false,
        results,
        progress: { completed: results.length, total: results.length },
      }));

      return results;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorObj,
      }));
      throw errorObj;
    }
  }, [options.onProgress]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      results: [],
      error: null,
      progress: { completed: 0, total: 0 },
    });
  }, []);

  const getSuccessfulResults = useCallback(() => {
    return state.results.filter(result => result.success).map(result => result.data);
  }, [state.results]);

  const getFailedResults = useCallback(() => {
    return state.results.filter(result => !result.success);
  }, [state.results]);

  const getSuccessRate = useCallback(() => {
    if (state.results.length === 0) return 0;
    const successful = state.results.filter(result => result.success).length;
    return successful / state.results.length;
  }, [state.results]);

  return {
    // State
    loading: state.loading,
    results: state.results,
    error: state.error,
    progress: state.progress,
    
    // Actions
    executeBatch,
    executeBatchGet,
    executeBatchPost,
    reset,
    
    // Computed values
    getSuccessfulResults,
    getFailedResults,
    getSuccessRate,
    
    // Utilities
    successfulCount: state.results.filter(r => r.success).length,
    failedCount: state.results.filter(r => !r.success).length,
    totalCount: state.results.length,
  };
};

export default useBatchRequests; 