import { PaginationParams } from './pagination-manager';

// ================================
// FILTER TYPES
// ================================

export type FilterOperator = 
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'contains' | 'startsWith' | 'endsWith'
  | 'in' | 'notIn' | 'between' | 'isNull' | 'isNotNull'
  | 'dateRange' | 'dateAfter' | 'dateBefore'
  | 'regex' | 'fuzzy';

export interface FilterRule {
  field: string;
  operator: FilterOperator;
  value: any;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

export interface FilterGroup {
  logic: 'AND' | 'OR';
  rules: (FilterRule | FilterGroup)[];
}

export interface ServerFilter {
  rules: FilterRule[];
  groups: FilterGroup[];
  search?: {
    query: string;
    fields: string[];
    fuzzy?: boolean;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  dateRange?: {
    field: string;
    start: string;
    end: string;
  };
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filter: ServerFilter;
  isDefault?: boolean;
  isPublic?: boolean;
  createdBy?: string;
}

// ================================
// FILTER BUILDER CLASS
// ================================

export class FilterBuilder {
  private filter: ServerFilter = {
    rules: [],
    groups: [],
    sort: []
  };

  // Add a simple filter rule
  where(field: string, operator: FilterOperator, value: any, type?: FilterRule['type']): FilterBuilder {
    this.filter.rules.push({ field, operator, value, type });
    return this;
  }

  // Convenience methods for common filters
  equals(field: string, value: any): FilterBuilder {
    return this.where(field, 'eq', value);
  }

  contains(field: string, value: string): FilterBuilder {
    return this.where(field, 'contains', value, 'string');
  }

  greaterThan(field: string, value: number | string): FilterBuilder {
    return this.where(field, 'gt', value, typeof value === 'number' ? 'number' : 'date');
  }

  lessThan(field: string, value: number | string): FilterBuilder {
    return this.where(field, 'lt', value, typeof value === 'number' ? 'number' : 'date');
  }

  between(field: string, min: any, max: any): FilterBuilder {
    return this.where(field, 'between', [min, max]);
  }

  inList(field: string, values: any[]): FilterBuilder {
    return this.where(field, 'in', values, 'array');
  }

  dateRange(field: string, start: string, end: string): FilterBuilder {
    this.filter.dateRange = { field, start, end };
    return this;
  }

  // Add search functionality
  search(query: string, fields: string[], fuzzy: boolean = false): FilterBuilder {
    this.filter.search = { query, fields, fuzzy };
    return this;
  }

  // Add sorting
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): FilterBuilder {
    if (!this.filter.sort) this.filter.sort = [];
    this.filter.sort.push({ field, direction });
    return this;
  }

  // Add complex group filters
  group(logic: 'AND' | 'OR', builderFn: (builder: FilterBuilder) => void): FilterBuilder {
    const groupBuilder = new FilterBuilder();
    builderFn(groupBuilder);
    
    const group: FilterGroup = {
      logic,
      rules: [
        ...groupBuilder.filter.rules,
        ...groupBuilder.filter.groups
      ]
    };
    
    this.filter.groups.push(group);
    return this;
  }

  // Build the final filter
  build(): ServerFilter {
    return { ...this.filter };
  }

  // Reset the builder
  reset(): FilterBuilder {
    this.filter = { rules: [], groups: [], sort: [] };
    return this;
  }

  // Convert to query string
  toQueryString(): string {
    const params = new URLSearchParams();
    
    // Add rules
    this.filter.rules.forEach((rule, index) => {
      params.append(`filter[${index}][field]`, rule.field);
      params.append(`filter[${index}][operator]`, rule.operator);
      params.append(`filter[${index}][value]`, JSON.stringify(rule.value));
      if (rule.type) params.append(`filter[${index}][type]`, rule.type);
    });

    // Add search
    if (this.filter.search) {
      params.append('search[query]', this.filter.search.query);
      params.append('search[fields]', this.filter.search.fields.join(','));
      if (this.filter.search.fuzzy) params.append('search[fuzzy]', 'true');
    }

    // Add sorting
    if (this.filter.sort && this.filter.sort.length > 0) {
      this.filter.sort.forEach((sort, index) => {
        params.append(`sort[${index}][field]`, sort.field);
        params.append(`sort[${index}][direction]`, sort.direction);
      });
    }

    // Add date range
    if (this.filter.dateRange) {
      params.append('dateRange[field]', this.filter.dateRange.field);
      params.append('dateRange[start]', this.filter.dateRange.start);
      params.append('dateRange[end]', this.filter.dateRange.end);
    }

    return params.toString();
  }
}

// ================================
// FILTER MANAGER CLASS
// ================================

export class FilterManager {
  private presets = new Map<string, FilterPreset>();
  private activeFilter: ServerFilter | null = null;
  private queryCache = new Map<string, any>();

  // Preset management
  savePreset(preset: FilterPreset): void {
    this.presets.set(preset.id, preset);
  }

  getPreset(id: string): FilterPreset | null {
    return this.presets.get(id) || null;
  }

  getPresets(publicOnly: boolean = false): FilterPreset[] {
    const allPresets = Array.from(this.presets.values());
    return publicOnly ? allPresets.filter(p => p.isPublic) : allPresets;
  }

  deletePreset(id: string): boolean {
    return this.presets.delete(id);
  }

  // Filter management
  setActiveFilter(filter: ServerFilter): void {
    this.activeFilter = filter;
  }

  getActiveFilter(): ServerFilter | null {
    return this.activeFilter;
  }

  clearActiveFilter(): void {
    this.activeFilter = null;
  }

  // Query caching for performance
  cacheQuery(key: string, result: any): void {
    this.queryCache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  getCachedQuery(key: string, maxAge: number = 5 * 60 * 1000): any | null {
    const cached = this.queryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > maxAge) {
      this.queryCache.delete(key);
      return null;
    }
    
    return cached.result;
  }

  clearQueryCache(): void {
    this.queryCache.clear();
  }
}

// ================================
// SMART FILTER HOOKS
// ================================

export interface UseServerFilterOptions {
  defaultFilter?: ServerFilter;
  enablePresets?: boolean;
  enableCache?: boolean;
  cacheTimeout?: number;
}

export interface UseServerFilterReturn {
  // Current filter state
  filter: ServerFilter | null;
  
  // Filter builder
  builder: FilterBuilder;
  
  // Actions
  applyFilter: (filter: ServerFilter) => void;
  clearFilter: () => void;
  resetBuilder: () => void;
  
  // Preset management
  saveAsPreset: (name: string, description: string, isPublic?: boolean) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
  getPresets: () => FilterPreset[];
  
  // Utilities
  toQueryParams: () => Record<string, any>;
  getQueryString: () => string;
  
  // Cache management
  clearCache: () => void;
}

export function useServerFilter({
  defaultFilter,
  enablePresets = true,
  enableCache = true,
  cacheTimeout = 5 * 60 * 1000
}: UseServerFilterOptions = {}): UseServerFilterReturn {
  
  const [manager] = useState(() => new FilterManager());
  const [filter, setFilter] = useState<ServerFilter | null>(defaultFilter || null);
  const [builder] = useState(() => new FilterBuilder());

  // Actions
  const applyFilter = useCallback((newFilter: ServerFilter) => {
    setFilter(newFilter);
    manager.setActiveFilter(newFilter);
  }, [manager]);

  const clearFilter = useCallback(() => {
    setFilter(null);
    manager.clearActiveFilter();
    builder.reset();
  }, [manager, builder]);

  const resetBuilder = useCallback(() => {
    builder.reset();
  }, [builder]);

  // Preset management
  const saveAsPreset = useCallback((name: string, description: string, isPublic: boolean = false) => {
    if (!filter) return;
    
    const preset: FilterPreset = {
      id: Date.now().toString(),
      name,
      description,
      filter,
      isPublic,
      createdBy: 'current_user' // This should come from auth context
    };
    
    manager.savePreset(preset);
  }, [filter, manager]);

  const loadPreset = useCallback((id: string) => {
    const preset = manager.getPreset(id);
    if (preset) {
      applyFilter(preset.filter);
    }
  }, [manager, applyFilter]);

  const deletePreset = useCallback((id: string) => {
    return manager.deletePreset(id);
  }, [manager]);

  const getPresets = useCallback(() => {
    return manager.getPresets();
  }, [manager]);

  // Utilities
  const toQueryParams = useCallback((): Record<string, any> => {
    if (!filter) return {};
    
    const params: Record<string, any> = {};
    
    // Convert filter to flat query params
    filter.rules.forEach((rule, index) => {
      params[`filter[${index}][field]`] = rule.field;
      params[`filter[${index}][operator]`] = rule.operator;
      params[`filter[${index}][value]`] = rule.value;
      if (rule.type) params[`filter[${index}][type]`] = rule.type;
    });

    if (filter.search) {
      params['search[query]'] = filter.search.query;
      params['search[fields]'] = filter.search.fields.join(',');
      if (filter.search.fuzzy) params['search[fuzzy]'] = true;
    }

    if (filter.sort && filter.sort.length > 0) {
      filter.sort.forEach((sort, index) => {
        params[`sort[${index}][field]`] = sort.field;
        params[`sort[${index}][direction]`] = sort.direction;
      });
    }

    if (filter.dateRange) {
      params['dateRange[field]'] = filter.dateRange.field;
      params['dateRange[start]'] = filter.dateRange.start;
      params['dateRange[end]'] = filter.dateRange.end;
    }

    return params;
  }, [filter]);

  const getQueryString = useCallback(() => {
    if (!filter) return '';
    return builder.toQueryString();
  }, [filter, builder]);

  const clearCache = useCallback(() => {
    if (enableCache) {
      manager.clearQueryCache();
    }
  }, [manager, enableCache]);

  return {
    filter,
    builder,
    applyFilter,
    clearFilter,
    resetBuilder,
    saveAsPreset,
    loadPreset,
    deletePreset,
    getPresets,
    toQueryParams,
    getQueryString,
    clearCache
  };
}

// ================================
// COMMON FILTER PRESETS
// ================================

export const createCommonFilters = () => {
  const filterManager = new FilterManager();

  // Assets filters
  filterManager.savePreset({
    id: 'assets-active',
    name: 'Active Assets',
    description: 'Show only active assets',
    filter: new FilterBuilder().equals('status', 'active').build(),
    isDefault: true,
    isPublic: true
  });

  filterManager.savePreset({
    id: 'assets-maintenance',
    name: 'Assets Under Maintenance',
    description: 'Show assets currently under maintenance',
    filter: new FilterBuilder().equals('status', 'maintenance').build(),
    isPublic: true
  });

  filterManager.savePreset({
    id: 'assets-high-value',
    name: 'High Value Assets',
    description: 'Show assets worth more than $5000',
    filter: new FilterBuilder().greaterThan('purchase_cost', 5000).build(),
    isPublic: true
  });

  // Finance filters
  filterManager.savePreset({
    id: 'expenses-pending',
    name: 'Pending Expenses',
    description: 'Show expenses awaiting approval',
    filter: new FilterBuilder().equals('status', 'pending').build(),
    isPublic: true
  });

  filterManager.savePreset({
    id: 'transactions-this-month',
    name: 'This Month Transactions',
    description: 'Show transactions from current month',
    filter: new FilterBuilder().dateRange('created_at', 
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      new Date().toISOString()
    ).build(),
    isPublic: true
  });

  // HR filters
  filterManager.savePreset({
    id: 'employees-active',
    name: 'Active Employees',
    description: 'Show only active employees',
    filter: new FilterBuilder().equals('status', 'active').build(),
    isDefault: true,
    isPublic: true
  });

  return filterManager;
};

// ================================
// FILTER MIGRATION HELPERS
// ================================

/**
 * Helper to migrate existing client-side filters to server-side
 */
export class FilterMigrator {
  static migrateAssetFilters(clientFilters: Record<string, any>): ServerFilter {
    const builder = new FilterBuilder();

    if (clientFilters.status) {
      builder.equals('status', clientFilters.status);
    }

    if (clientFilters.category_id) {
      builder.equals('category_id', clientFilters.category_id);
    }

    if (clientFilters.location) {
      builder.contains('location', clientFilters.location);
    }

    if (clientFilters.valueRange) {
      const { min, max } = clientFilters.valueRange;
      if (min !== undefined && max !== undefined) {
        builder.between('purchase_cost', min, max);
      } else if (min !== undefined) {
        builder.greaterThan('purchase_cost', min);
      } else if (max !== undefined) {
        builder.lessThan('purchase_cost', max);
      }
    }

    if (clientFilters.search) {
      builder.search(clientFilters.search, ['name', 'description', 'asset_tag']);
    }

    return builder.build();
  }

  static migrateFinanceFilters(clientFilters: Record<string, any>): ServerFilter {
    const builder = new FilterBuilder();

    if (clientFilters.type) {
      builder.equals('type', clientFilters.type);
    }

    if (clientFilters.status) {
      builder.equals('status', clientFilters.status);
    }

    if (clientFilters.dateRange) {
      const { start, end } = clientFilters.dateRange;
      builder.dateRange('created_at', start, end);
    }

    if (clientFilters.amountRange) {
      const { min, max } = clientFilters.amountRange;
      builder.between('amount', min, max);
    }

    return builder.build();
  }

  static migrateHRFilters(clientFilters: Record<string, any>): ServerFilter {
    const builder = new FilterBuilder();

    if (clientFilters.status) {
      builder.equals('status', clientFilters.status);
    }

    if (clientFilters.department_id) {
      builder.equals('department_id', clientFilters.department_id);
    }

    if (clientFilters.search) {
      builder.search(clientFilters.search, ['first_name', 'last_name', 'email']);
    }

    return builder.build();
  }
} 