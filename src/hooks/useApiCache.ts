import { useCallback } from 'react';
import { clearApiCache, getPerformanceMetrics, PerformanceMetrics } from '@/apis';

export const useApiCache = () => {
  const clearCache = useCallback(() => {
    clearApiCache();
  }, []);

  const getMetrics = useCallback((): PerformanceMetrics => {
    return getPerformanceMetrics();
  }, []);

  const getCacheStats = useCallback(() => {
    const metrics = getPerformanceMetrics();
    return {
      hitRate: metrics.cacheHitRate,
      hitCount: metrics.cacheHitCount,
      missCount: metrics.cacheMissCount,
      totalRequests: metrics.cacheHitCount + metrics.cacheMissCount,
    };
  }, []);

  const isCacheEffective = useCallback((threshold: number = 0.3) => {
    const metrics = getPerformanceMetrics();
    return metrics.cacheHitRate >= threshold;
  }, []);

  return {
    clearCache,
    getMetrics,
    getCacheStats,
    isCacheEffective,
  };
};

export default useApiCache; 