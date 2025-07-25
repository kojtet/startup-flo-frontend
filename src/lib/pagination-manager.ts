import { useState, useCallback, useRef, useEffect } from 'react';

// ================================
// PAGINATION TYPES
// ================================

export interface PaginationConfig {
  defaultPageSize: number;
  maxPageSize: number;
  prefetchPages: number; // Number of pages to prefetch ahead
  virtualScrolling: boolean;
  infiniteScroll: boolean;
  cachePages: boolean;
  cacheSize: number; // Maximum number of cached pages
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  error: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
  search?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  meta?: {
    fetchedAt: number;
    cacheKey: string;
    totalSize: number;
  };
}

export interface PageCache<T> {
  data: T[];
  timestamp: number;
  params: PaginationParams;
  totalItems: number;
}

// ================================
// PAGINATION MANAGER CLASS
// ================================

export class PaginationManager<T> {
  private cache = new Map<string, PageCache<T>>();
  private config: PaginationConfig;
  private observers = new Set<(state: PaginationState) => void>();

  constructor(config: Partial<PaginationConfig> = {}) {
    this.config = {
      defaultPageSize: 20,
      maxPageSize: 100,
      prefetchPages: 1,
      virtualScrolling: false,
      infiniteScroll: false,
      cachePages: true,
      cacheSize: 10,
      ...config
    };
  }

  // Generate cache key for params
  private generateCacheKey(params: PaginationParams): string {
    const { page, limit, search = '', filters = {}, sortBy = '', sortOrder = 'asc' } = params;
    const filterStr = JSON.stringify(filters);
    return `p${page}_l${limit}_s${search}_f${filterStr}_sort${sortBy}_${sortOrder}`;
  }

  // Check if page is cached and valid
  private isCacheValid(cacheKey: string, maxAge: number = 5 * 60 * 1000): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < maxAge;
  }

  // Get cached page data
  getCachedPage(params: PaginationParams): T[] | null {
    const cacheKey = this.generateCacheKey(params);
    const cached = this.cache.get(cacheKey);
    return cached && this.isCacheValid(cacheKey) ? cached.data : null;
  }

  // Cache page data
  cachePage(params: PaginationParams, data: T[], totalItems: number): void {
    if (!this.config.cachePages) return;

    const cacheKey = this.generateCacheKey(params);
    
    // Implement LRU eviction
    if (this.cache.size >= this.config.cacheSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      params,
      totalItems
    });
  }

  // Clear cache
  clearCache(pattern?: RegExp): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Get cache statistics
  getCacheStats(): {
    size: number;
    keys: string[];
    hitRate: number;
    memoryUsage: number;
  } {
    const keys = Array.from(this.cache.keys());
    const memoryUsage = keys.reduce((total, key) => {
      const cached = this.cache.get(key);
      return total + (cached ? JSON.stringify(cached).length : 0);
    }, 0);

    return {
      size: this.cache.size,
      keys,
      hitRate: 0, // Would need hit/miss tracking
      memoryUsage
    };
  }

  // Subscribe to state changes
  subscribe(observer: (state: PaginationState) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  // Notify observers of state change
  private notify(state: PaginationState): void {
    this.observers.forEach(observer => observer(state));
  }

  // Prefetch adjacent pages
  async prefetchPages(
    currentParams: PaginationParams,
    fetcher: (params: PaginationParams) => Promise<PaginatedResponse<T>>
  ): Promise<void> {
    if (!this.config.cachePages || this.config.prefetchPages === 0) return;

    const prefetchPromises: Promise<void>[] = [];

    // Prefetch next pages
    for (let i = 1; i <= this.config.prefetchPages; i++) {
      const nextPage = currentParams.page + i;
      const nextParams = { ...currentParams, page: nextPage };
      const cacheKey = this.generateCacheKey(nextParams);

      if (!this.isCacheValid(cacheKey)) {
        prefetchPromises.push(
          fetcher(nextParams)
            .then(response => {
              this.cachePage(nextParams, response.data, response.pagination.total);
            })
            .catch(() => {
              // Silent fail for prefetch
            })
        );
      }
    }

    // Prefetch previous pages
    for (let i = 1; i <= this.config.prefetchPages; i++) {
      const prevPage = currentParams.page - i;
      if (prevPage >= 1) {
        const prevParams = { ...currentParams, page: prevPage };
        const cacheKey = this.generateCacheKey(prevParams);

        if (!this.isCacheValid(cacheKey)) {
          prefetchPromises.push(
            fetcher(prevParams)
              .then(response => {
                this.cachePage(prevParams, response.data, response.pagination.total);
              })
              .catch(() => {
                // Silent fail for prefetch
              })
          );
        }
      }
    }

    await Promise.allSettled(prefetchPromises);
  }
}

// ================================
// PAGINATION HOOK
// ================================

export interface UsePaginationOptions<T> {
  fetcher: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
  config?: Partial<PaginationConfig>;
  initialParams?: Partial<PaginationParams>;
  enablePrefetch?: boolean;
  enableInfiniteScroll?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
}

export interface UsePaginationReturn<T> {
  // Data
  data: T[];
  allData: T[]; // For infinite scroll
  
  // State
  state: PaginationState;
  params: PaginationParams;
  
  // Actions
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  changePageSize: (size: number) => Promise<void>;
  search: (query: string) => Promise<void>;
  filter: (filters: Record<string, any>) => Promise<void>;
  sort: (field: string, order?: 'asc' | 'desc') => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>; // For infinite scroll
  
  // Utilities
  clearCache: () => void;
  getCacheStats: () => ReturnType<PaginationManager<T>['getCacheStats']>;
  
  // Selection (for batch operations)
  selectedItems: Set<string>;
  selectItem: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  getSelectedData: () => T[];
}

export function usePagination<T extends { id: string }>({
  fetcher,
  config = {},
  initialParams = {},
  enablePrefetch = true,
  enableInfiniteScroll = false,
  enableSearch = true,
  enableFilters = true
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  
  // Initialize pagination manager
  const managerRef = useRef<PaginationManager<T>>(
    new PaginationManager<T>({ infiniteScroll: enableInfiniteScroll, ...config })
  );
  const manager = managerRef.current;

  // State
  const [data, setData] = useState<T[]>([]);
  const [allData, setAllData] = useState<T[]>([]); // For infinite scroll
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  const [state, setState] = useState<PaginationState>({
    currentPage: 1,
    pageSize: config.defaultPageSize || 20,
    totalItems: 0,
    totalPages: 0,
    isLoading: false,
    isLoadingMore: false,
    hasNextPage: false,
    hasPreviousPage: false,
    error: null
  });

  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: config.defaultPageSize || 20,
    search: '',
    filters: {},
    sortBy: '',
    sortOrder: 'asc',
    ...initialParams
  });

  // Fetch data function
  const fetchData = useCallback(async (
    newParams: PaginationParams, 
    append: boolean = false
  ): Promise<void> => {
    const loadingKey = append ? 'isLoadingMore' : 'isLoading';
    
    setState(prev => ({ ...prev, [loadingKey]: true, error: null }));

    try {
      // Check cache first
      const cached = manager.getCachedPage(newParams);
      if (cached) {
        setData(cached);
        setState(prev => ({ ...prev, [loadingKey]: false }));
        return;
      }

      // Fetch from API
      const response = await fetcher(newParams);
      const { data: responseData, pagination } = response;

      // Cache the response
      manager.cachePage(newParams, responseData, pagination.total);

      // Update data
      if (append && enableInfiniteScroll) {
        setData(prev => [...prev, ...responseData]);
        setAllData(prev => [...prev, ...responseData]);
      } else {
        setData(responseData);
        setAllData(responseData);
      }

      // Update pagination state
      setState(prev => ({
        ...prev,
        currentPage: pagination.page,
        totalItems: pagination.total,
        totalPages: pagination.pages,
        hasNextPage: pagination.hasNext,
        hasPreviousPage: pagination.hasPrevious,
        [loadingKey]: false,
        error: null
      }));

      // Prefetch adjacent pages
      if (enablePrefetch) {
        manager.prefetchPages(newParams, fetcher);
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        [loadingKey]: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      }));
    }
  }, [fetcher, manager, enablePrefetch, enableInfiniteScroll]);

  // Actions
  const goToPage = useCallback(async (page: number) => {
    const newParams = { ...params, page };
    setParams(newParams);
    await fetchData(newParams);
  }, [params, fetchData]);

  const nextPage = useCallback(async () => {
    if (state.hasNextPage) {
      await goToPage(state.currentPage + 1);
    }
  }, [state.hasNextPage, state.currentPage, goToPage]);

  const previousPage = useCallback(async () => {
    if (state.hasPreviousPage) {
      await goToPage(state.currentPage - 1);
    }
  }, [state.hasPreviousPage, state.currentPage, goToPage]);

  const changePageSize = useCallback(async (size: number) => {
    const newParams = { ...params, limit: size, page: 1 };
    setParams(newParams);
    setState(prev => ({ ...prev, pageSize: size }));
    await fetchData(newParams);
  }, [params, fetchData]);

  const search = useCallback(async (query: string) => {
    if (!enableSearch) return;
    const newParams = { ...params, search: query, page: 1 };
    setParams(newParams);
    manager.clearCache(); // Clear cache when searching
    await fetchData(newParams);
  }, [params, fetchData, manager, enableSearch]);

  const filter = useCallback(async (filters: Record<string, any>) => {
    if (!enableFilters) return;
    const newParams = { ...params, filters, page: 1 };
    setParams(newParams);
    manager.clearCache(); // Clear cache when filtering
    await fetchData(newParams);
  }, [params, fetchData, manager, enableFilters]);

  const sort = useCallback(async (field: string, order: 'asc' | 'desc' = 'asc') => {
    const newParams = { ...params, sortBy: field, sortOrder: order, page: 1 };
    setParams(newParams);
    await fetchData(newParams);
  }, [params, fetchData]);

  const refresh = useCallback(async () => {
    manager.clearCache();
    await fetchData(params);
  }, [params, fetchData, manager]);

  const loadMore = useCallback(async () => {
    if (enableInfiniteScroll && state.hasNextPage && !state.isLoadingMore) {
      const newParams = { ...params, page: state.currentPage + 1 };
      setParams(newParams);
      await fetchData(newParams, true);
    }
  }, [enableInfiniteScroll, state.hasNextPage, state.isLoadingMore, state.currentPage, params, fetchData]);

  // Selection actions
  const selectItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(data.map(item => item.id)));
  }, [data]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const getSelectedData = useCallback(() => {
    return data.filter(item => selectedItems.has(item.id));
  }, [data, selectedItems]);

  // Utility actions
  const clearCache = useCallback(() => {
    manager.clearCache();
  }, [manager]);

  const getCacheStats = useCallback(() => {
    return manager.getCacheStats();
  }, [manager]);

  // Initial load
  useEffect(() => {
    fetchData(params);
  }, []); // Only run once on mount

  return {
    data,
    allData,
    state,
    params,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    search,
    filter,
    sort,
    refresh,
    loadMore,
    clearCache,
    getCacheStats,
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    getSelectedData
  };
} 