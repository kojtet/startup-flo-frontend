import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/apis";
import { useAuth } from "./AuthContext";
import type {
  Vendor,
  VendorCategory,
  CreateVendorData,
  UpdateVendorData,
  CreateVendorCategoryData,
  UpdateVendorCategoryData,
  PaginationParams,
} from "@/apis/types";
import { ApiError } from "@/apis/core/errors";

interface VendorCache {
  vendors: {
    data: Vendor[];
    timestamp: number;
  } | null;
  vendorCategories: {
    data: VendorCategory[];
    timestamp: number;
  } | null;
}

interface VendorContextType {
  // Cache state
  cache: VendorCache;
  
  // Data state
  vendors: Vendor[];
  vendorCategories: VendorCategory[];
  
  // Loading states
  isLoadingVendors: boolean;
  isLoadingVendorCategories: boolean;
  
  // Error states
  vendorsError: string | null;
  vendorCategoriesError: string | null;
  
  // Optimized data access methods (replaces inefficient service methods)
  getVendorsOptimized: (useCache?: boolean) => Promise<Vendor[]>;
  getVendorsByStatus: (status: Vendor['status']) => Vendor[];
  getActiveVendors: () => Vendor[];
  getInactiveVendors: () => Vendor[];
  getSuspendedVendors: () => Vendor[];
  getVendorsByCategory: (categoryId: string) => Vendor[];
  getVendorsByName: (namePattern: string) => Vendor[];
  getVendorsByEmail: (emailPattern: string) => Vendor[];
  getVendorsByPaymentTerms: (paymentTerms: string) => Vendor[];
  getVendorsWithCreditLimit: (minLimit?: number, maxLimit?: number) => Vendor[];
  getTotalVendorCount: () => { active: number; inactive: number; suspended: number; total: number };
  
  getVendorCategoriesOptimized: (useCache?: boolean) => Promise<VendorCategory[]>;
  getVendorCategoriesByName: (namePattern: string) => VendorCategory[];
  getVendorCategoryByName: (name: string) => VendorCategory | undefined;
  
  // Vendor analytics
  getVendorSummary: () => {
    totalVendors: number;
    activeVendors: number;
    inactiveVendors: number;
    suspendedVendors: number;
    categorizedVendors: number;
    uncategorizedVendors: number;
    totalCreditLimit: number;
  };
  
  // Standard CRUD operations (maintain compatibility)
  fetchVendors: (params?: any) => Promise<void>;
  fetchVendorCategories: (params?: any) => Promise<void>;
  
  // Vendor CRUD
  createVendor: (data: CreateVendorData) => Promise<Vendor>;
  updateVendor: (id: string, data: UpdateVendorData) => Promise<Vendor>;
  deleteVendor: (id: string) => Promise<void>;
  
  // Vendor Category CRUD
  createVendorCategory: (data: CreateVendorCategoryData) => Promise<VendorCategory>;
  updateVendorCategory: (id: string, data: UpdateVendorCategoryData) => Promise<VendorCategory>;
  deleteVendorCategory: (id: string) => Promise<void>;
  
  // Cache management
  clearCache: () => void;
  invalidateCache: (type?: keyof VendorCache) => void;
  refreshData: () => Promise<void>;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

// Cache duration: 10 minutes for vendor categories (static), 5 minutes for vendors (more dynamic)
const CACHE_DURATION = {
  STATIC: 10 * 60 * 1000,   // 10 minutes - vendor categories
  DYNAMIC: 5 * 60 * 1000,   // 5 minutes - vendors
};

export const VendorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Cache state
  const [cache, setCache] = useState<VendorCache>({
    vendors: null,
    vendorCategories: null,
  });
  
  // Data state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorCategories, setVendorCategories] = useState<VendorCategory[]>([]);
  
  // Loading states
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [isLoadingVendorCategories, setIsLoadingVendorCategories] = useState(false);
  
  // Error states
  const [vendorsError, setVendorsError] = useState<string | null>(null);
  const [vendorCategoriesError, setVendorCategoriesError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  
  // Helper function to check if cache is valid
  const isCacheValid = (cacheItem: { timestamp: number } | null, duration: number): boolean => {
    if (!cacheItem) return false;
    return Date.now() - cacheItem.timestamp < duration;
  };
  
  // ================================
  // OPTIMIZED DATA ACCESS METHODS
  // ================================
  
  // Vendor methods
  const getVendorsOptimized = useCallback(async (useCache: boolean = true): Promise<Vendor[]> => {
    if (useCache && isCacheValid(cache.vendors, CACHE_DURATION.DYNAMIC)) {
      return cache.vendors!.data;
    }
    
    setIsLoadingVendors(true);
    setVendorsError(null);
    try {
      // @ts-ignore
      const data = await api.vendor.getVendors();
      setVendors(data);
      setCache(prev => ({
        ...prev,
        vendors: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load vendors";
      setVendorsError(errorMessage);
      throw err;
    } finally {
      setIsLoadingVendors(false);
    }
  }, [cache.vendors]);
  
  // Optimized vendor filtering methods using cached data
  const getVendorsByStatus = useCallback((status: Vendor['status']): Vendor[] => {
    return vendors.filter(vendor => vendor.status === status);
  }, [vendors]);
  
  const getActiveVendors = useCallback((): Vendor[] => {
    return getVendorsByStatus('active');
  }, [getVendorsByStatus]);
  
  const getInactiveVendors = useCallback((): Vendor[] => {
    return getVendorsByStatus('inactive');
  }, [getVendorsByStatus]);
  
  const getSuspendedVendors = useCallback((): Vendor[] => {
    return getVendorsByStatus('suspended');
  }, [getVendorsByStatus]);
  
  const getVendorsByCategory = useCallback((categoryId: string): Vendor[] => {
    return vendors.filter(vendor => vendor.category_id === categoryId);
  }, [vendors]);
  
  const getVendorsByName = useCallback((namePattern: string): Vendor[] => {
    const pattern = namePattern.toLowerCase();
    return vendors.filter(vendor => 
      vendor.name.toLowerCase().includes(pattern)
    );
  }, [vendors]);
  
  const getVendorsByEmail = useCallback((emailPattern: string): Vendor[] => {
    const pattern = emailPattern.toLowerCase();
    return vendors.filter(vendor => 
      vendor.email && vendor.email.toLowerCase().includes(pattern)
    );
  }, [vendors]);
  
  const getVendorsByPaymentTerms = useCallback((paymentTerms: string): Vendor[] => {
    return vendors.filter(vendor => vendor.payment_terms === paymentTerms);
  }, [vendors]);
  
  const getVendorsWithCreditLimit = useCallback((minLimit?: number, maxLimit?: number): Vendor[] => {
    return vendors.filter(vendor => {
      if (!vendor.credit_limit) return false;
      if (minLimit !== undefined && vendor.credit_limit < minLimit) return false;
      if (maxLimit !== undefined && vendor.credit_limit > maxLimit) return false;
      return true;
    });
  }, [vendors]);
  
  const getTotalVendorCount = useCallback((): { active: number; inactive: number; suspended: number; total: number } => {
    const activeCount = getActiveVendors().length;
    const inactiveCount = getInactiveVendors().length;
    const suspendedCount = getSuspendedVendors().length;
    
    return {
      active: activeCount,
      inactive: inactiveCount,
      suspended: suspendedCount,
      total: vendors.length
    };
  }, [vendors, getActiveVendors, getInactiveVendors, getSuspendedVendors]);
  
  // Vendor Category methods
  const getVendorCategoriesOptimized = useCallback(async (useCache: boolean = true): Promise<VendorCategory[]> => {
    if (useCache && isCacheValid(cache.vendorCategories, CACHE_DURATION.STATIC)) {
      return cache.vendorCategories!.data;
    }
    
    setIsLoadingVendorCategories(true);
    setVendorCategoriesError(null);
    try {
      // @ts-ignore
      const data = await api.vendor.getVendorCategories();
      setVendorCategories(data);
      setCache(prev => ({
        ...prev,
        vendorCategories: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load vendor categories";
      setVendorCategoriesError(errorMessage);
      throw err;
    } finally {
      setIsLoadingVendorCategories(false);
    }
  }, [cache.vendorCategories]);
  
  const getVendorCategoriesByName = useCallback((namePattern: string): VendorCategory[] => {
    const pattern = namePattern.toLowerCase();
    return vendorCategories.filter(category => 
      category.name.toLowerCase().includes(pattern)
    );
  }, [vendorCategories]);
  
  const getVendorCategoryByName = useCallback((name: string): VendorCategory | undefined => {
    return vendorCategories.find(category => category.name.toLowerCase() === name.toLowerCase());
  }, [vendorCategories]);
  
  // Vendor analytics
  const getVendorSummary = useCallback(() => {
    const { active, inactive, suspended, total } = getTotalVendorCount();
    const categorizedVendors = vendors.filter(vendor => vendor.category_id).length;
    const uncategorizedVendors = total - categorizedVendors;
    const totalCreditLimit = vendors.reduce((sum, vendor) => sum + (vendor.credit_limit || 0), 0);
    
    return {
      totalVendors: total,
      activeVendors: active,
      inactiveVendors: inactive,
      suspendedVendors: suspended,
      categorizedVendors,
      uncategorizedVendors,
      totalCreditLimit,
    };
  }, [vendors, getTotalVendorCount]);
  
  // ================================
  // STANDARD CRUD OPERATIONS
  // ================================
  
  const fetchVendors = useCallback(async (params?: any) => {
    await getVendorsOptimized(false); // Force fresh fetch
  }, [getVendorsOptimized]);
  
  const fetchVendorCategories = useCallback(async (params?: any) => {
    await getVendorCategoriesOptimized(false); // Force fresh fetch
  }, [getVendorCategoriesOptimized]);
  
  // Vendor CRUD operations
  const createVendor = useCallback(async (data: CreateVendorData): Promise<Vendor> => {
    try {
      // @ts-ignore
      const newVendor = await api.vendor.createVendor(data);
      // Invalidate cache and refresh
      setCache(prev => ({ ...prev, vendors: null }));
      await getVendorsOptimized(false);
      return newVendor;
    } catch (err) {
      throw err;
    }
  }, [getVendorsOptimized]);
  
  const updateVendor = useCallback(async (vendorId: string, data: UpdateVendorData): Promise<Vendor> => {
    try {
      // @ts-ignore
      const updatedVendor = await api.vendor.updateVendor(vendorId, data);
      // Update local state and cache
      setVendors(prev => prev.map(vendor => vendor.id === vendorId ? updatedVendor : vendor));
      setCache(prev => prev.vendors ? {
        ...prev,
        vendors: {
          ...prev.vendors,
          data: prev.vendors.data.map(vendor => vendor.id === vendorId ? updatedVendor : vendor)
        }
      } : prev);
      return updatedVendor;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const deleteVendor = useCallback(async (vendorId: string): Promise<void> => {
    try {
      // @ts-ignore
      await api.vendor.deleteVendor(vendorId);
      // Remove from local state and cache
      setVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
      setCache(prev => prev.vendors ? {
        ...prev,
        vendors: {
          ...prev.vendors,
          data: prev.vendors.data.filter(vendor => vendor.id !== vendorId)
        }
      } : prev);
    } catch (err) {
      throw err;
    }
  }, []);
  
  // Vendor Category CRUD operations
  const createVendorCategory = useCallback(async (data: CreateVendorCategoryData): Promise<VendorCategory> => {
    try {
      // @ts-ignore
      const newCategory = await api.vendor.createVendorCategory(data);
      // Invalidate cache and refresh
      setCache(prev => ({ ...prev, vendorCategories: null }));
      await getVendorCategoriesOptimized(false);
      return newCategory;
    } catch (err) {
      throw err;
    }
  }, [getVendorCategoriesOptimized]);
  
  const updateVendorCategory = useCallback(async (categoryId: string, data: UpdateVendorCategoryData): Promise<VendorCategory> => {
    try {
      // @ts-ignore
      const updatedCategory = await api.vendor.updateVendorCategory(categoryId, data);
      // Update local state and cache
      setVendorCategories(prev => prev.map(category => category.id === categoryId ? updatedCategory : category));
      setCache(prev => prev.vendorCategories ? {
        ...prev,
        vendorCategories: {
          ...prev.vendorCategories,
          data: prev.vendorCategories.data.map(category => category.id === categoryId ? updatedCategory : category)
        }
      } : prev);
      return updatedCategory;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const deleteVendorCategory = useCallback(async (categoryId: string): Promise<void> => {
    try {
      // @ts-ignore
      await api.vendor.deleteVendorCategory(categoryId);
      // Remove from local state and cache
      setVendorCategories(prev => prev.filter(category => category.id !== categoryId));
      setCache(prev => prev.vendorCategories ? {
        ...prev,
        vendorCategories: {
          ...prev.vendorCategories,
          data: prev.vendorCategories.data.filter(category => category.id !== categoryId)
        }
      } : prev);
    } catch (err) {
      throw err;
    }
  }, []);
  
  // ================================
  // CACHE MANAGEMENT
  // ================================
  
  const clearCache = useCallback(() => {
    setCache({
      vendors: null,
      vendorCategories: null,
    });
    console.log("Vendor cache cleared");
  }, []);
  
  const invalidateCache = useCallback((type?: keyof VendorCache) => {
    if (type) {
      setCache(prev => ({ ...prev, [type]: null }));
    } else {
      clearCache();
    }
  }, [clearCache]);
  
  const refreshData = useCallback(async () => {
    clearCache();
    await Promise.all([
      getVendorsOptimized(false),
      getVendorCategoriesOptimized(false),
    ]);
  }, [clearCache, getVendorsOptimized, getVendorCategoriesOptimized]);
  
  // Auto-initialize data on auth
  useEffect(() => {
    if (isAuthenticated) {
      // Load vendor categories immediately (static data)
      getVendorCategoriesOptimized();
    } else {
      clearCache();
    }
  }, [isAuthenticated, getVendorCategoriesOptimized, clearCache]);
  
  const value: VendorContextType = {
    // Cache state
    cache,
    
    // Data state
    vendors,
    vendorCategories,
    
    // Loading states
    isLoadingVendors,
    isLoadingVendorCategories,
    
    // Error states
    vendorsError,
    vendorCategoriesError,
    
    // Optimized data access methods
    getVendorsOptimized,
    getVendorsByStatus,
    getActiveVendors,
    getInactiveVendors,
    getSuspendedVendors,
    getVendorsByCategory,
    getVendorsByName,
    getVendorsByEmail,
    getVendorsByPaymentTerms,
    getVendorsWithCreditLimit,
    getTotalVendorCount,
    
    getVendorCategoriesOptimized,
    getVendorCategoriesByName,
    getVendorCategoryByName,
    
    // Vendor analytics
    getVendorSummary,
    
    // Standard CRUD operations
    fetchVendors,
    fetchVendorCategories,
    
    createVendor,
    updateVendor,
    deleteVendor,
    
    createVendorCategory,
    updateVendorCategory,
    deleteVendorCategory,
    
    // Cache management
    clearCache,
    invalidateCache,
    refreshData,
  };
  
  return (
    <VendorContext.Provider value={value}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendor = (): VendorContextType => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error("useVendor must be used within a VendorProvider");
  }
  return context;
};

export default VendorContext; 