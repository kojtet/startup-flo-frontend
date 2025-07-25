import { useState, useCallback, useRef } from 'react';
import { 
  createBatchRequestManager, 
  type BatchRequestConfig, 
  type BatchRequestResult,
  type BatchRequestManager 
} from '@/apis';

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

  const managerRef = useRef<BatchRequestManager | null>(null);

  const executeBatch = useCallback(async (
    requests: (() => Promise<T>)[],
    customConfig?: BatchRequestConfig
  ) => {
    if (!managerRef.current) {
      managerRef.current = createBatchRequestManager(
        // We'll need to import the apiClient instance
        (await import('@/apis')).apiClient,
        { ...options.config, ...customConfig }
      );
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      progress: { completed: 0, total: requests.length },
    }));

    try {
      const handleProgress = (completed: number, total: number) => {
        setState(prev => ({
          ...prev,
          progress: { completed, total },
        }));
        options.onProgress?.(completed, total);
      };

      const results = await managerRef.current.executeBatch(requests, handleProgress);

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
  }, [options.config, options.onProgress]);

  const executeBatchGet = useCallback(async (
    endpoints: string[],
    config?: any,
    customConfig?: BatchRequestConfig
  ) => {
    if (!managerRef.current) {
      managerRef.current = createBatchRequestManager(
        (await import('@/apis')).apiClient,
        { ...options.config, ...customConfig }
      );
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      progress: { completed: 0, total: endpoints.length },
    }));

    try {
      const handleProgress = (completed: number, total: number) => {
        setState(prev => ({
          ...prev,
          progress: { completed, total },
        }));
        options.onProgress?.(completed, total);
      };

      const results = await managerRef.current.batchGet<T>(endpoints, config, handleProgress);

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
  }, [options.config, options.onProgress]);

  const executeBatchPost = useCallback(async (
    requests: Array<{ endpoint: string; data?: any; config?: any }>,
    customConfig?: BatchRequestConfig
  ) => {
    if (!managerRef.current) {
      managerRef.current = createBatchRequestManager(
        (await import('@/apis')).apiClient,
        { ...options.config, ...customConfig }
      );
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      progress: { completed: 0, total: requests.length },
    }));

    try {
      const handleProgress = (completed: number, total: number) => {
        setState(prev => ({
          ...prev,
          progress: { completed, total },
        }));
        options.onProgress?.(completed, total);
      };

      const results = await managerRef.current.batchPost<T>(requests, handleProgress);

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
  }, [options.config, options.onProgress]);

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