/**
 * Comprehensive Monitoring and Analytics System
 * 
 * This module provides real-time monitoring, analytics, and performance tracking
 * for the application's contexts, caching systems, and error handling.
 */

import { AppError, CacheStats, StatusType } from './types';

// ================================
// TYPES AND INTERFACES
// ================================

export interface PerformanceMetric {
  operation: string;
  context: string;
  duration: number;
  timestamp: number;
  success: boolean;
  cacheHit?: boolean;
  errorType?: string;
  dataSize?: number;
}

export interface ErrorMetric {
  error: AppError;
  context: string;
  operation: string;
  timestamp: number;
  userAgent: string;
  retryCount: number;
  resolved: boolean;
}

export interface CacheMetric {
  namespace: string;
  operation: 'get' | 'set' | 'delete' | 'clear' | 'invalidate';
  key: string;
  hit: boolean;
  duration: number;
  size: number;
  timestamp: number;
}

export interface UserInteractionMetric {
  action: string;
  context: string;
  component: string;
  timestamp: number;
  duration?: number;
  success: boolean;
  data?: any;
}

export interface ContextMetrics {
  context: string;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  lastActivity: number;
  activeUsers: number;
}

export interface AnalyticsData {
  performance: PerformanceMetric[];
  errors: ErrorMetric[];
  cache: CacheMetric[];
  interactions: UserInteractionMetric[];
  contexts: Record<string, ContextMetrics>;
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
    activeUsers: number;
    uptime: number;
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of events to track
  maxStorageSize: number; // Maximum number of events to store
  flushInterval: number; // How often to flush data to storage
  enableRealTime: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableCacheTracking: boolean;
  enableInteractionTracking: boolean;
  enableContextTracking: boolean;
}

// ================================
// MONITORING CLASS
// ================================

export class MonitoringSystem {
  private config: MonitoringConfig;
  private performanceMetrics: PerformanceMetric[] = [];
  private errorMetrics: ErrorMetric[] = [];
  private cacheMetrics: CacheMetric[] = [];
  private interactionMetrics: UserInteractionMetric[] = [];
  private contextMetrics: Record<string, ContextMetrics> = {};
  private startTime: number = Date.now();
  private activeUsers: Set<string> = new Set();
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      maxStorageSize: 10000,
      flushInterval: 30000, // 30 seconds
      enableRealTime: true,
      enablePerformanceTracking: true,
      enableErrorTracking: true,
      enableCacheTracking: true,
      enableInteractionTracking: true,
      enableContextTracking: true,
      ...config
    };

    this.initializeContextMetrics();
    this.startFlushTimer();
  }

  // ================================
  // PERFORMANCE MONITORING
  // ================================

  trackPerformance(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    if (!this.config.enabled || !this.config.enablePerformanceTracking) return;
    if (Math.random() > this.config.sampleRate) return;

    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.performanceMetrics.push(fullMetric);
    this.updateContextMetrics(metric.context, {
      totalOperations: 1,
      successfulOperations: metric.success ? 1 : 0,
      failedOperations: metric.success ? 0 : 1,
      averageResponseTime: metric.duration
    });

    this.trimMetrics();
  }

  measureOperation<T>(
    operation: string,
    context: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    return fn()
      .then(result => {
        const duration = performance.now() - startTime;
        this.trackPerformance({
          operation,
          context,
          duration,
          timestamp: Date.now(),
          success: true,
          dataSize: this.estimateDataSize(result)
        });
        return result;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        this.trackPerformance({
          operation,
          context,
          duration,
          timestamp: Date.now(),
          success: false,
          errorType: error.constructor.name,
          dataSize: 0
        });
        throw error;
      });
  }

  // ================================
  // ERROR MONITORING
  // ================================

  trackError(error: AppError, context: string, operation: string, retryCount: number = 0): void {
    if (!this.config.enabled || !this.config.enableErrorTracking) return;
    if (Math.random() > this.config.sampleRate) return;

    const errorMetric: ErrorMetric = {
      error,
      context,
      operation,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      retryCount,
      resolved: false
    };

    this.errorMetrics.push(errorMetric);
    this.updateContextMetrics(context, {
      failedOperations: 1
    });

    this.trimMetrics();
  }

  markErrorResolved(errorId: string): void {
    const error = this.errorMetrics.find(e => e.error.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  // ================================
  // CACHE MONITORING
  // ================================

  trackCacheOperation(metric: Omit<CacheMetric, 'timestamp'>): void {
    if (!this.config.enabled || !this.config.enableCacheTracking) return;
    if (Math.random() > this.config.sampleRate) return;

    const fullMetric: CacheMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.cacheMetrics.push(fullMetric);
    this.trimMetrics();
  }

  // ================================
  // USER INTERACTION MONITORING
  // ================================

  trackInteraction(metric: Omit<UserInteractionMetric, 'timestamp'>): void {
    if (!this.config.enabled || !this.config.enableInteractionTracking) return;
    if (Math.random() > this.config.sampleRate) return;

    const fullMetric: UserInteractionMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.interactionMetrics.push(fullMetric);
    this.trimMetrics();
  }

  trackUserActivity(userId: string): void {
    if (!this.config.enabled || !this.config.enableContextTracking) return;
    
    this.activeUsers.add(userId);
    
    // Remove user after 30 minutes of inactivity
    setTimeout(() => {
      this.activeUsers.delete(userId);
    }, 30 * 60 * 1000);
  }

  // ================================
  // CONTEXT MONITORING
  // ================================

  private initializeContextMetrics(): void {
    const contexts = ['finance', 'crm', 'hr', 'assets'];
    contexts.forEach(context => {
      this.contextMetrics[context] = {
        context,
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
        lastActivity: 0,
        activeUsers: 0
      };
    });
  }

  private updateContextMetrics(context: string, updates: Partial<ContextMetrics>): void {
    if (!this.contextMetrics[context]) {
      this.contextMetrics[context] = {
        context,
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
        lastActivity: 0,
        activeUsers: 0
      };
    }

    const current = this.contextMetrics[context];
    
    // Update basic metrics
    if (updates.totalOperations) current.totalOperations += updates.totalOperations;
    if (updates.successfulOperations) current.successfulOperations += updates.successfulOperations;
    if (updates.failedOperations) current.failedOperations += updates.failedOperations;
    
    // Update average response time
    if (updates.averageResponseTime) {
      const totalTime = current.averageResponseTime * (current.totalOperations - 1) + updates.averageResponseTime;
      current.averageResponseTime = totalTime / current.totalOperations;
    }
    
    // Update rates
    if (current.totalOperations > 0) {
      current.errorRate = (current.failedOperations / current.totalOperations) * 100;
    }
    
    current.lastActivity = Date.now();
    current.activeUsers = this.activeUsers.size;
  }

  // ================================
  // ANALYTICS AND REPORTING
  // ================================

  getAnalytics(): AnalyticsData {
    const now = Date.now();
    const uptime = now - this.startTime;

    // Calculate cache hit rate
    const cacheHits = this.cacheMetrics.filter(m => m.hit).length;
    const cacheTotal = this.cacheMetrics.length;
    const cacheHitRate = cacheTotal > 0 ? (cacheHits / cacheTotal) * 100 : 0;

    // Calculate overall metrics
    const totalRequests = this.performanceMetrics.length;
    const successfulRequests = this.performanceMetrics.filter(m => m.success).length;
    const averageResponseTime = totalRequests > 0 
      ? this.performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests 
      : 0;
    const errorRate = totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests) * 100 : 0;

    return {
      performance: [...this.performanceMetrics],
      errors: [...this.errorMetrics],
      cache: [...this.cacheMetrics],
      interactions: [...this.interactionMetrics],
      contexts: { ...this.contextMetrics },
      summary: {
        totalRequests,
        averageResponseTime,
        errorRate,
        cacheHitRate,
        activeUsers: this.activeUsers.size,
        uptime
      }
    };
  }

  getContextAnalytics(context: string): ContextMetrics | null {
    return this.contextMetrics[context] || null;
  }

  getPerformanceAnalytics(timeRange: { start: number; end: number }): PerformanceMetric[] {
    return this.performanceMetrics.filter(
      m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  getErrorAnalytics(timeRange: { start: number; end: number }): ErrorMetric[] {
    return this.errorMetrics.filter(
      m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  getCacheAnalytics(timeRange: { start: number; end: number }): CacheMetric[] {
    return this.cacheMetrics.filter(
      m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  // ================================
  // UTILITY METHODS
  // ================================

  private estimateDataSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private trimMetrics(): void {
    const maxSize = this.config.maxStorageSize;
    
    if (this.performanceMetrics.length > maxSize) {
      this.performanceMetrics = this.performanceMetrics.slice(-maxSize);
    }
    
    if (this.errorMetrics.length > maxSize) {
      this.errorMetrics = this.errorMetrics.slice(-maxSize);
    }
    
    if (this.cacheMetrics.length > maxSize) {
      this.cacheMetrics = this.cacheMetrics.slice(-maxSize);
    }
    
    if (this.interactionMetrics.length > maxSize) {
      this.interactionMetrics = this.interactionMetrics.slice(-maxSize);
    }
  }

  private startFlushTimer(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flushToStorage();
      }, this.config.flushInterval);
    }
  }

  private flushToStorage(): void {
    try {
      const analytics = this.getAnalytics();
      localStorage.setItem('app_analytics', JSON.stringify(analytics));
    } catch (error) {
      // Monitoring errors should be handled silently to prevent disruption
    }
  }

  // ================================
  // CLEANUP
  // ================================

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushToStorage();
  }
}

// ================================
// GLOBAL MONITORING INSTANCE
// ================================

export const globalMonitoring = new MonitoringSystem();

// ================================
// REACT HOOKS FOR MONITORING
// ================================

import { useCallback, useEffect, useRef } from 'react';

export function usePerformanceMonitoring(context: string) {
  const startTimeRef = useRef<number>(0);

  const startOperation = useCallback((operation: string) => {
    startTimeRef.current = performance.now();
    return operation;
  }, []);

  const endOperation = useCallback((operation: string, success: boolean, dataSize?: number) => {
    const duration = performance.now() - startTimeRef.current;
    globalMonitoring.trackPerformance({
      operation,
      context,
      duration,
      timestamp: Date.now(),
      success,
      dataSize
    });
  }, [context]);

  const measureOperation = useCallback(<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    return globalMonitoring.measureOperation(operation, context, fn);
  }, [context]);

  return {
    startOperation,
    endOperation,
    measureOperation
  };
}

export function useErrorMonitoring(context: string) {
  const trackError = useCallback((error: AppError, operation: string, retryCount: number = 0) => {
    globalMonitoring.trackError(error, context, operation, retryCount);
  }, [context]);

  const markErrorResolved = useCallback((errorId: string) => {
    globalMonitoring.markErrorResolved(errorId);
  }, []);

  return {
    trackError,
    markErrorResolved
  };
}

export function useInteractionMonitoring(context: string) {
  const trackInteraction = useCallback((
    action: string,
    component: string,
    success: boolean,
    duration?: number,
    data?: any
  ) => {
    globalMonitoring.trackInteraction({
      action,
      context,
      component,
      timestamp: Date.now(),
      success,
      duration,
      data
    });
  }, [context]);

  return {
    trackInteraction
  };
}

export function useCacheMonitoring() {
  const trackCacheOperation = useCallback((
    namespace: string,
    operation: 'get' | 'set' | 'delete' | 'clear' | 'invalidate',
    key: string,
    hit: boolean,
    duration: number,
    size: number
  ) => {
    globalMonitoring.trackCacheOperation({
      namespace,
      operation,
      key,
      hit,
      duration,
      size,
      timestamp: Date.now()
    });
  }, []);

  return {
    trackCacheOperation
  };
}

// ================================
// EXPORTS
// ================================

export default globalMonitoring; 