import { useState, useCallback, useRef, useEffect } from 'react';

// Cache entry with metadata
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // Estimated size in bytes
}

// Cache configuration
interface CacheConfig {
  maxSize: number; // Maximum cache size in MB
  maxAge: number; // Maximum age in milliseconds
  persistToStorage?: boolean; // Whether to persist to localStorage
  storageKey?: string; // localStorage key prefix
  backgroundRefresh?: boolean; // Whether to refresh in background
  backgroundRefreshThreshold?: number; // Percentage of maxAge before background refresh
}

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  entryCount: number;
  evictions: number;
}

// Request deduplication
interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

export class AdvancedCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private pendingRequests = new Map<string, PendingRequest<T>>();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalSize: 0,
    entryCount: 0,
    evictions: 0,
  };

  constructor(config: CacheConfig) {
    this.config = config;
    this.loadFromStorage();
    this.startCleanupInterval();
  }

  // Get data with advanced caching
  async get(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check if there's a pending request for this key
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending.promise;
    }

    // Check cache first
    const cached = this.cache.get(key);
    if (cached && !this.isExpired(cached)) {
      this.updateAccessStats(key, cached);
      this.stats.hits++;
      this.updateHitRate();

      // Background refresh if enabled and cache is getting stale
      if (this.config.backgroundRefresh && this.shouldBackgroundRefresh(cached)) {
        this.backgroundRefresh(key, fetcher);
      }

      return cached.data;
    }

    this.stats.misses++;
    this.updateHitRate();

    // Create new request
    const promise = this.fetchAndCache(key, fetcher);
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    try {
      const result = await promise;
      this.pendingRequests.delete(key);
      return result;
    } catch (error) {
      this.pendingRequests.delete(key);
      throw error;
    }
  }

  // Set data in cache
  set(key: string, data: T): void {
    const size = this.estimateSize(data);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.maxAge,
      accessCount: 0,
      lastAccessed: Date.now(),
      size,
    };

    // Check if we need to evict entries
    this.ensureCapacity(size);

    this.cache.set(key, entry);
    this.stats.totalSize += size;
    this.stats.entryCount++;

    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  // Invalidate cache entries
  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      this.clear();
      return;
    }

    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  // Delete specific key
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.totalSize -= entry.size;
      this.stats.entryCount--;
      this.cache.delete(key);
      
      if (this.config.persistToStorage) {
        this.saveToStorage();
      }
      return true;
    }
    return false;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    this.stats.totalSize = 0;
    this.stats.entryCount = 0;
    
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Warm cache with multiple keys
  async warmCache(entries: Array<{ key: string; fetcher: () => Promise<T> }>): Promise<void> {
    const promises = entries.map(({ key, fetcher }) => 
      this.get(key, fetcher).catch(() => {
        // Silently fail for cache warming
        console.warn(`Failed to warm cache for key: ${key}`);
      })
    );
    
    await Promise.allSettled(promises);
  }

  // Preload data for better UX
  preload(key: string, fetcher: () => Promise<T>): void {
    // Don't await, just start the request
    this.get(key, fetcher).catch(() => {
      // Silently fail for preloading
    });
  }

  private async fetchAndCache(key: string, fetcher: () => Promise<T>): Promise<T> {
    try {
      const data = await fetcher();
      this.set(key, data);
      return data;
    } catch (error) {
      throw error;
    }
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private shouldBackgroundRefresh(entry: CacheEntry<T>): boolean {
    const age = Date.now() - entry.timestamp;
    const threshold = this.config.maxAge * (this.config.backgroundRefreshThreshold || 0.8);
    return age > threshold;
  }

  private async backgroundRefresh(key: string, fetcher: () => Promise<T>): Promise<void> {
    try {
      const data = await fetcher();
      this.set(key, data);
    } catch (error) {
      // Silently fail for background refresh
      console.warn(`Background refresh failed for key: ${key}`, error);
    }
  }

  private updateAccessStats(key: string, entry: CacheEntry<T>): void {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.cache.set(key, entry);
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private estimateSize(data: T): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 1024; // Default size estimate
    }
  }

  private ensureCapacity(newEntrySize: number): void {
    const maxSizeBytes = this.config.maxSize * 1024 * 1024; // Convert MB to bytes
    
    if (this.stats.totalSize + newEntrySize <= maxSizeBytes) {
      return;
    }

    // LRU eviction
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    let currentSize = this.stats.totalSize;
    
    for (const [key, entry] of entries) {
      if (currentSize + newEntrySize <= maxSizeBytes) {
        break;
      }
      
      this.delete(key);
      currentSize -= entry.size;
      this.stats.evictions++;
    }
  }

  private saveToStorage(): void {
    if (!this.config.persistToStorage || !this.config.storageKey) return;
    
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        stats: this.stats,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(
        `${this.config.storageKey}_cache`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.warn('Failed to save cache to storage', error);
    }
  }

  private loadFromStorage(): void {
    if (!this.config.persistToStorage || !this.config.storageKey) return;
    
    try {
      const stored = localStorage.getItem(`${this.config.storageKey}_cache`);
      if (!stored) return;
      
      const data = JSON.parse(stored);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours for persisted cache
      
      // Only load if not too old
      if (Date.now() - data.timestamp < maxAge) {
        this.cache = new Map(data.cache);
        this.stats = data.stats;
      }
    } catch (error) {
      console.warn('Failed to load cache from storage', error);
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      for (const [key, entry] of this.cache.entries()) {
        if (this.isExpired(entry)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => this.delete(key));
    }, 60000); // Clean up every minute
  }
}

// React hook for using advanced cache
export function useAdvancedCache<T = any>(
  config: CacheConfig,
  dependencies: any[] = []
): AdvancedCache<T> {
  const cacheRef = useRef<AdvancedCache<T> | null>(null);
  
  useEffect(() => {
    if (!cacheRef.current) {
      cacheRef.current = new AdvancedCache<T>(config);
    }
    
    return () => {
      // Cleanup on unmount
      cacheRef.current?.clear();
    };
  }, dependencies);
  
  return cacheRef.current!;
}

// Hook for cache statistics
export function useCacheStats<T = any>(cache: AdvancedCache<T>) {
  const [stats, setStats] = useState<CacheStats>(cache.getStats());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cache.getStats());
    }, 5000); // Update stats every 5 seconds
    
    return () => clearInterval(interval);
  }, [cache]);
  
  return stats;
}

// Hook for cache warming
export function useCacheWarming<T = any>(
  cache: AdvancedCache<T>,
  warmEntries: Array<{ key: string; fetcher: () => Promise<T> }>
) {
  const [isWarming, setIsWarming] = useState(false);
  const [warmedKeys, setWarmedKeys] = useState<Set<string>>(new Set());
  
  const warmCache = useCallback(async () => {
    setIsWarming(true);
    try {
      await cache.warmCache(warmEntries);
      setWarmedKeys(new Set(warmEntries.map(entry => entry.key)));
    } finally {
      setIsWarming(false);
    }
  }, [cache, warmEntries]);
  
  return { warmCache, isWarming, warmedKeys };
} 