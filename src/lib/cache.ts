/**
 * @fileoverview Advanced cache utilities for application data caching.
 * 
 * This module provides a comprehensive caching solution with features like LRU eviction,
 * persistence, compression, statistics tracking, and cache warming. It includes both
 * the AdvancedCache class and utility functions for common caching patterns.
 * 
 * @author Fihankra Safety Sentinel Team
 * @version 1.0.0
 * @since 2024
 */

// ================================
// CACHE UTILITIES
// ================================

import { CacheEntry, CacheConfig, CacheStats, CacheOperation, DEFAULT_CACHE_CONFIG } from './types';

/**
 * Advanced cache implementation with LRU eviction, persistence, and statistics
 */
export class AdvancedCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private operations: CacheOperation[] = [];

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      maxSize: this.config.maxSize,
      hitRate: 0,
      evictions: 0,
      lastCleanup: Date.now(),
    };

    this.startCleanupInterval();
    this.loadFromStorage();
  }

  /**
   * Gets a value from cache
   */
  get(key: string): T | null {
    const startTime = Date.now();
    const entry = this.cache.get(key);

    if (!entry) {
      this.recordOperation('get', key, undefined, false, Date.now() - startTime);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.delete(key);
      this.recordOperation('get', key, undefined, false, Date.now() - startTime);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.cache.set(key, entry);

    this.recordOperation('get', key, entry.data, true, Date.now() - startTime);
    this.stats.hits++;
    this.updateHitRate();

    return entry.data;
  }

  /**
   * Sets a value in cache
   */
  set(key: string, data: T, ttl?: number): void {
    const startTime = Date.now();
    const timestamp = Date.now();
    const entryTTL = ttl || this.config.defaultTTL;

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp,
      ttl: entryTTL,
      accessCount: 1,
      lastAccessed: timestamp,
    };

    // Check if key already exists
    const existing = this.cache.get(key);
    if (existing) {
      entry.accessCount = existing.accessCount + 1;
    }

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;

    // Evict if cache is full
    if (this.cache.size > this.config.maxSize) {
      this.evictLRU();
    }

    this.recordOperation('set', key, data, true, Date.now() - startTime);
    this.saveToStorage();
  }

  /**
   * Deletes a value from cache
   */
  delete(key: string): boolean {
    const startTime = Date.now();
    const existed = this.cache.delete(key);
    
    if (existed) {
      this.stats.size = this.cache.size;
    }

    this.recordOperation('delete', key, undefined, existed, Date.now() - startTime);
    this.saveToStorage();
    
    return existed;
  }

  /**
   * Clears all cache entries
   */
  clear(): void {
    const startTime = Date.now();
    const size = this.cache.size;
    
    this.cache.clear();
    this.stats.size = 0;

    this.recordOperation('clear', '', undefined, true, Date.now() - startTime);
    this.saveToStorage();
  }

  /**
   * Checks if a key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Gets cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Gets recent operations
   */
  getRecentOperations(limit: number = 100): CacheOperation[] {
    return this.operations.slice(-limit);
  }

  /**
   * Evicts entries by tags
   */
  evictByTags(tags: string[]): number {
    let evicted = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        evicted++;
      }
    }

    this.stats.evictions += evicted;
    this.stats.size = this.cache.size;
    this.saveToStorage();
    
    return evicted;
  }

  /**
   * Sets tags for a cache entry
   */
  setTags(key: string, tags: string[]): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    entry.tags = tags;
    this.cache.set(key, entry);
    this.saveToStorage();
    
    return true;
  }

  /**
   * Gets all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Gets all values in cache
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.data);
  }

  /**
   * Gets cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Checks if cache is empty
   */
  isEmpty(): boolean {
    return this.cache.size === 0;
  }

  /**
   * Destroys the cache and cleans up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    this.operations = [];
  }

  /**
   * Private methods
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.timestamp + entry.ttl;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private recordOperation(
    type: CacheOperation['type'],
    key: string,
    data: any,
    success: boolean,
    duration: number
  ): void {
    const operation: CacheOperation = {
      type,
      key,
      data,
      timestamp: Date.now(),
      success,
      duration,
    };

    this.operations.push(operation);

    // Keep only last 1000 operations
    if (this.operations.length > 1000) {
      this.operations = this.operations.slice(-1000);
    }
  }

  private startCleanupInterval(): void {
    if (this.config.cleanupInterval > 0) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.size = this.cache.size;
      this.saveToStorage();
    }

    this.stats.lastCleanup = now;
  }

  private saveToStorage(): void {
    if (!this.config.enablePersistence) return;

    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        stats: this.stats,
        timestamp: Date.now(),
      };

      const serialized = this.config.enableCompression 
        ? this.compress(JSON.stringify(data))
        : JSON.stringify(data);

      localStorage.setItem('app_cache', serialized);
    } catch (error) {
      // Cache save errors should be handled silently
    }
  }

  private loadFromStorage(): void {
    if (!this.config.enablePersistence) return;

    try {
      const serialized = localStorage.getItem('app_cache');
      if (!serialized) return;

      const data = JSON.parse(
        this.config.enableCompression 
          ? this.decompress(serialized)
          : serialized
      );

      // Only load if cache is not too old (24 hours)
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        this.cache = new Map(data.entries);
        this.stats = data.stats;
        this.stats.size = this.cache.size;
      }
    } catch (error) {
      // Cache load errors should be handled silently
    }
  }

  private compress(data: string): string {
    // Simple compression - in production, use a proper compression library
    return btoa(data);
  }

  private decompress(data: string): string {
    // Simple decompression - in production, use a proper compression library
    return atob(data);
  }
}

/**
 * Creates a new cache instance
 */
export function createCache<T = any>(config?: Partial<CacheConfig>): AdvancedCache<T> {
  return new AdvancedCache<T>(config);
}

/**
 * Global cache instance
 */
export const globalCache = createCache();

/**
 * Cache decorator for functions
 */
export function cached<T extends (...args: any[]) => any>(
  ttl: number = 5 * 60 * 1000,
  keyGenerator?: (...args: Parameters<T>) => string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = createCache();

    descriptor.value = function (...args: Parameters<T>): ReturnType<T> {
      const key = keyGenerator 
        ? keyGenerator(...args)
        : `${propertyName}_${JSON.stringify(args)}`;

      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      const result = method.apply(this, args);
      
      if (result instanceof Promise) {
        return result.then(value => {
          cache.set(key, value, ttl);
          return value;
        }) as ReturnType<T>;
      } else {
        cache.set(key, result, ttl);
        return result;
      }
    };

    return descriptor;
  };
}

/**
 * Cache hook for React components
 */
export function useCache<T = any>(key: string, ttl?: number) {
  const cache = globalCache;
  
  return {
    get: () => cache.get(key),
    set: (data: T) => cache.set(key, data, ttl),
    delete: () => cache.delete(key),
    has: () => cache.has(key),
  };
}

/**
 * Cache middleware for API calls
 */
export function createCacheMiddleware(
  cache: AdvancedCache,
  ttl: number = 5 * 60 * 1000
) {
  return async (url: string, options: RequestInit = {}) => {
    const cacheKey = `api_${url}_${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Make the actual request
    const response = await fetch(url, options);
    const data = await response.json();

    // Cache the response
    cache.set(cacheKey, data, ttl);

    return data;
  };
}

/**
 * Cache utilities for common patterns
 */
export const cacheUtils = {
  /**
   * Creates a cache key from multiple parts
   */
  createKey: (...parts: any[]): string => {
    return parts.map(part => 
      typeof part === 'object' ? JSON.stringify(part) : String(part)
    ).join('_');
  },

  /**
   * Creates a cache key for API responses
   */
  createApiKey: (method: string, url: string, params?: any): string => {
    return `api_${method}_${url}_${params ? JSON.stringify(params) : ''}`;
  },

  /**
   * Creates a cache key for user-specific data
   */
  createUserKey: (userId: string, ...parts: any[]): string => {
    return `user_${userId}_${cacheUtils.createKey(...parts)}`;
  },

  /**
   * Creates a cache key for company-specific data
   */
  createCompanyKey: (companyId: string, ...parts: any[]): string => {
    return `company_${companyId}_${cacheUtils.createKey(...parts)}`;
  },

  /**
   * Invalidates cache entries by pattern
   */
  invalidateByPattern: (cache: AdvancedCache, pattern: RegExp): number => {
    let invalidated = 0;
    
    for (const key of cache.keys()) {
      if (pattern.test(key)) {
        cache.delete(key);
        invalidated++;
      }
    }
    
    return invalidated;
  },

  /**
   * Preloads data into cache
   */
  preload: async <T>(
    cache: AdvancedCache<T>,
    key: string,
    loader: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const cached = cache.get(key);
    if (cached) return cached;

    const data = await loader();
    cache.set(key, data, ttl);
    return data;
  },
}; 