import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/apis";
import { useAuth } from "./AuthContext";
import type {
  Asset,
  AssetCategory,
  AssetAssignment,
  CreateAssetData,
  UpdateAssetData,
  CreateAssetCategoryData,
  UpdateAssetCategoryData,
  AssignAssetData,
  UnassignAssetData,
  PaginationParams,
  AssetScanData,
} from "@/apis/types";
import { ApiError } from "@/apis/core/errors";

interface AssetsCache {
  assets: {
    data: Asset[];
    timestamp: number;
  } | null;
  assetCategories: {
    data: AssetCategory[];
    timestamp: number;
  } | null;
  assetAssignments: {
    data: AssetAssignment[];
    timestamp: number;
  } | null;
}

interface AssetsContextType {
  // Cache state
  cache: AssetsCache;
  
  // Data state
  assets: Asset[];
  assetCategories: AssetCategory[];
  assetAssignments: AssetAssignment[];
  
  // Loading states
  isLoadingAssets: boolean;
  isLoadingAssetCategories: boolean;
  isLoadingAssetAssignments: boolean;
  
  // Error states
  assetsError: string | null;
  assetCategoriesError: string | null;
  assetAssignmentsError: string | null;
  
  // Optimized data access methods (replaces inefficient service methods)
  getAssetsOptimized: (useCache?: boolean) => Promise<Asset[]>;
  getAssetsByStatus: (status: Asset['status']) => Asset[];
  getActiveAssets: () => Asset[];
  getInStockAssets: () => Asset[];
  getAssignedAssets: () => Asset[];
  getMaintenanceAssets: () => Asset[];
  getRetiredAssets: () => Asset[];
  getAssetsByCategory: (categoryId: string) => Asset[];
  getAssetsByLocation: (location: string) => Asset[];
  getAssetsByName: (namePattern: string) => Asset[];
  getAssetsByTag: (tagPattern: string) => Asset[];
  getAssetsByValueRange: (minValue?: number, maxValue?: number) => Asset[];
  getDepreciatingAssets: () => Asset[];
  getAssetsNearWarrantyExpiry: (daysThreshold?: number) => Asset[];
  
  getAssetCategoriesOptimized: (useCache?: boolean) => Promise<AssetCategory[]>;
  getActiveAssetCategories: () => AssetCategory[];
  getInactiveAssetCategories: () => AssetCategory[];
  getAssetCategoryByName: (name: string) => AssetCategory | undefined;
  
  getAssetAssignmentsOptimized: (useCache?: boolean) => Promise<AssetAssignment[]>;
  getActiveAssignments: () => AssetAssignment[];
  getAssignmentsByEmployee: (employeeId: string) => AssetAssignment[];
  getAssignmentsByAsset: (assetId: string) => AssetAssignment[];
  getOverdueAssignments: () => AssetAssignment[];
  
  // Asset analytics
  getAssetSummary: () => {
    totalAssets: number;
    activeAssets: number;
    assignedAssets: number;
    availableAssets: number;
    maintenanceAssets: number;
    retiredAssets: number;
    totalValue: number;
    depreciation: number;
    assignmentRate: number;
  };
  
  getDepreciationSummary: () => {
    totalOriginalValue: number;
    totalCurrentValue: number;
    totalDepreciation: number;
    depreciationPercentage: number;
  };
  
  // Standard CRUD operations (maintain compatibility)
  fetchAssets: (params?: any) => Promise<void>;
  fetchAssetCategories: (params?: any) => Promise<void>;
  fetchAssetAssignments: (params?: any) => Promise<void>;
  
  // Asset CRUD
  createAsset: (data: CreateAssetData) => Promise<Asset>;
  updateAsset: (id: string, data: UpdateAssetData) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<void>;
  scanAsset: (data: AssetScanData) => Promise<Asset>;
  
  // Asset Category CRUD
  createAssetCategory: (data: CreateAssetCategoryData) => Promise<AssetCategory>;
  updateAssetCategory: (id: string, data: UpdateAssetCategoryData) => Promise<AssetCategory>;
  deleteAssetCategory: (id: string) => Promise<void>;
  
  // Asset Assignment operations
  assignAsset: (assetId: string, data: AssignAssetData) => Promise<AssetAssignment>;
  unassignAsset: (assetId: string, data: UnassignAssetData) => Promise<void>;
  getAssetAssignmentHistory: (assetId: string) => Promise<AssetAssignment[]>;
  
  // Cache management
  clearCache: () => void;
  invalidateCache: (type?: keyof AssetsCache) => void;
  refreshData: () => Promise<void>;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

// Cache duration: 10 minutes for asset categories (static), 5 minutes for assets and assignments
const CACHE_DURATION = {
  STATIC: 10 * 60 * 1000,   // 10 minutes - asset categories
  DYNAMIC: 5 * 60 * 1000,   // 5 minutes - assets, assignments
};

export const AssetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Cache state
  const [cache, setCache] = useState<AssetsCache>({
    assets: null,
    assetCategories: null,
    assetAssignments: null,
  });
  
  // Data state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  const [assetAssignments, setAssetAssignments] = useState<AssetAssignment[]>([]);
  
  // Loading states
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isLoadingAssetCategories, setIsLoadingAssetCategories] = useState(false);
  const [isLoadingAssetAssignments, setIsLoadingAssetAssignments] = useState(false);
  
  // Error states
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [assetCategoriesError, setAssetCategoriesError] = useState<string | null>(null);
  const [assetAssignmentsError, setAssetAssignmentsError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  
  // Helper function to check if cache is valid
  const isCacheValid = (cacheItem: { timestamp: number } | null, duration: number): boolean => {
    if (!cacheItem) return false;
    return Date.now() - cacheItem.timestamp < duration;
  };
  
  // ================================
  // OPTIMIZED DATA ACCESS METHODS
  // ================================
  
  // Asset methods
  const getAssetsOptimized = useCallback(async (useCache: boolean = true): Promise<Asset[]> => {
    if (useCache && isCacheValid(cache.assets, CACHE_DURATION.DYNAMIC)) {
      return cache.assets!.data;
    }
    
    setIsLoadingAssets(true);
    setAssetsError(null);
    try {
      const data = await api.assets.getAssets();
      setAssets(data);
      setCache(prev => ({
        ...prev,
        assets: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load assets";
      setAssetsError(errorMessage);
      throw err;
    } finally {
      setIsLoadingAssets(false);
    }
  }, [cache.assets]);
  
  // Optimized asset filtering methods using cached data
  const getAssetsByStatus = useCallback((status: Asset['status']): Asset[] => {
    return assets.filter(asset => asset.status === status);
  }, [assets]);
  
  const getActiveAssets = useCallback((): Asset[] => {
    return getAssetsByStatus('active');
  }, [getAssetsByStatus]);
  
  const getInStockAssets = useCallback((): Asset[] => {
    return getAssetsByStatus('in_stock');
  }, [getAssetsByStatus]);
  
  const getAssignedAssets = useCallback((): Asset[] => {
    return getAssetsByStatus('assigned');
  }, [getAssetsByStatus]);
  
  const getMaintenanceAssets = useCallback((): Asset[] => {
    return getAssetsByStatus('maintenance');
  }, [getAssetsByStatus]);
  
  const getRetiredAssets = useCallback((): Asset[] => {
    return getAssetsByStatus('retired');
  }, [getAssetsByStatus]);
  
  const getAssetsByCategory = useCallback((categoryId: string): Asset[] => {
    return assets.filter(asset => asset.category_id === categoryId);
  }, [assets]);
  
  const getAssetsByLocation = useCallback((location: string): Asset[] => {
    return assets.filter(asset => asset.location && asset.location.toLowerCase().includes(location.toLowerCase()));
  }, [assets]);
  
  const getAssetsByName = useCallback((namePattern: string): Asset[] => {
    const pattern = namePattern.toLowerCase();
    return assets.filter(asset => 
      asset.name.toLowerCase().includes(pattern)
    );
  }, [assets]);
  
  const getAssetsByTag = useCallback((tagPattern: string): Asset[] => {
    const pattern = tagPattern.toLowerCase();
    return assets.filter(asset => 
      asset.asset_tag && asset.asset_tag.toLowerCase().includes(pattern)
    );
  }, [assets]);
  
  const getAssetsByValueRange = useCallback((minValue?: number, maxValue?: number): Asset[] => {
    return assets.filter(asset => {
      const value = asset.current_value || asset.purchase_cost || 0;
      if (minValue !== undefined && value < minValue) return false;
      if (maxValue !== undefined && value > maxValue) return false;
      return true;
    });
  }, [assets]);
  
  const getDepreciatingAssets = useCallback((): Asset[] => {
    return assets.filter(asset => 
      asset.depreciation_start && 
      asset.current_value !== undefined &&
      asset.purchase_cost !== undefined
    );
  }, [assets]);
  
  const getAssetsNearWarrantyExpiry = useCallback((daysThreshold: number = 30): Asset[] => {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    
    return assets.filter(asset => {
      if (!asset.warranty_expiry) return false;
      const expiryDate = new Date(asset.warranty_expiry);
      return expiryDate <= thresholdDate && expiryDate >= new Date();
    });
  }, [assets]);
  
  // Asset Category methods
  const getAssetCategoriesOptimized = useCallback(async (useCache: boolean = true): Promise<AssetCategory[]> => {
    if (useCache && isCacheValid(cache.assetCategories, CACHE_DURATION.STATIC)) {
      return cache.assetCategories!.data;
    }
    
    setIsLoadingAssetCategories(true);
    setAssetCategoriesError(null);
    try {
      const data = await api.assets.getAssetCategories();
      setAssetCategories(data);
      setCache(prev => ({
        ...prev,
        assetCategories: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load asset categories";
      setAssetCategoriesError(errorMessage);
      throw err;
    } finally {
      setIsLoadingAssetCategories(false);
    }
  }, [cache.assetCategories]);
  
  const getActiveAssetCategories = useCallback((): AssetCategory[] => {
    return assetCategories.filter(category => !category.description || category.description !== 'inactive');
  }, [assetCategories]);
  
  const getInactiveAssetCategories = useCallback((): AssetCategory[] => {
    return assetCategories.filter(category => category.description === 'inactive');
  }, [assetCategories]);
  
  const getAssetCategoryByName = useCallback((name: string): AssetCategory | undefined => {
    return assetCategories.find(category => category.name.toLowerCase() === name.toLowerCase());
  }, [assetCategories]);
  
  // Asset Assignment methods
  const getAssetAssignmentsOptimized = useCallback(async (useCache: boolean = true): Promise<AssetAssignment[]> => {
    if (useCache && isCacheValid(cache.assetAssignments, CACHE_DURATION.DYNAMIC)) {
      return cache.assetAssignments!.data;
    }
    
    setIsLoadingAssetAssignments(true);
    setAssetAssignmentsError(null);
    try {
      // Note: This would need to fetch all assignments, but the API might not have this endpoint
      // For now, we'll return the cached data or empty array
      const data: AssetAssignment[] = []; // This would be replaced with actual API call
      setAssetAssignments(data);
      setCache(prev => ({
        ...prev,
        assetAssignments: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load asset assignments";
      setAssetAssignmentsError(errorMessage);
      throw err;
    } finally {
      setIsLoadingAssetAssignments(false);
    }
  }, [cache.assetAssignments]);
  
  const getActiveAssignments = useCallback((): AssetAssignment[] => {
    return assetAssignments.filter(assignment => !assignment.return_date);
  }, [assetAssignments]);
  
  const getAssignmentsByEmployee = useCallback((employeeId: string): AssetAssignment[] => {
    return assetAssignments.filter(assignment => assignment.employee_id === employeeId);
  }, [assetAssignments]);
  
  const getAssignmentsByAsset = useCallback((assetId: string): AssetAssignment[] => {
    return assetAssignments.filter(assignment => assignment.asset_id === assetId);
  }, [assetAssignments]);
  
  const getOverdueAssignments = useCallback((): AssetAssignment[] => {
    const now = new Date();
    return assetAssignments.filter(assignment => {
      if (!assignment.return_date || assignment.return_date) return false;
      const expectedReturn = new Date(assignment.return_date);
      return expectedReturn < now;
    });
  }, [assetAssignments]);
  
  // Asset analytics
  const getAssetSummary = useCallback(() => {
    const totalAssets = assets.length;
    const activeAssets = getActiveAssets().length;
    const assignedAssets = getAssignedAssets().length;
    const availableAssets = getInStockAssets().length + activeAssets;
    const maintenanceAssets = getMaintenanceAssets().length;
    const retiredAssets = getRetiredAssets().length;
    
    const totalValue = assets.reduce((sum, asset) => sum + (asset.current_value || asset.purchase_cost || 0), 0);
    const originalValue = assets.reduce((sum, asset) => sum + (asset.purchase_cost || 0), 0);
    const depreciation = originalValue - totalValue;
    
    const assignmentRate = totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 0;
    
    return {
      totalAssets,
      activeAssets,
      assignedAssets,
      availableAssets,
      maintenanceAssets,
      retiredAssets,
      totalValue,
      depreciation,
      assignmentRate,
    };
  }, [assets, getActiveAssets, getAssignedAssets, getInStockAssets, getMaintenanceAssets, getRetiredAssets]);
  
  const getDepreciationSummary = useCallback(() => {
    const totalOriginalValue = assets.reduce((sum, asset) => sum + (asset.purchase_cost || 0), 0);
    const totalCurrentValue = assets.reduce((sum, asset) => sum + (asset.current_value || asset.purchase_cost || 0), 0);
    const totalDepreciation = totalOriginalValue - totalCurrentValue;
    const depreciationPercentage = totalOriginalValue > 0 ? (totalDepreciation / totalOriginalValue) * 100 : 0;
    
    return {
      totalOriginalValue,
      totalCurrentValue,
      totalDepreciation,
      depreciationPercentage,
    };
  }, [assets]);
  
  // ================================
  // STANDARD CRUD OPERATIONS
  // ================================
  
  const fetchAssets = useCallback(async (params?: any) => {
    await getAssetsOptimized(false); // Force fresh fetch
  }, [getAssetsOptimized]);
  
  const fetchAssetCategories = useCallback(async (params?: any) => {
    await getAssetCategoriesOptimized(false); // Force fresh fetch
  }, [getAssetCategoriesOptimized]);
  
  const fetchAssetAssignments = useCallback(async (params?: any) => {
    await getAssetAssignmentsOptimized(false); // Force fresh fetch
  }, [getAssetAssignmentsOptimized]);
  
  // Asset CRUD operations
  const createAsset = useCallback(async (data: CreateAssetData): Promise<Asset> => {
    try {
      const newAsset = await api.assets.createAsset(data);
      // Invalidate cache and refresh
      setCache(prev => ({ ...prev, assets: null }));
      await getAssetsOptimized(false);
      return newAsset;
    } catch (err) {
      throw err;
    }
  }, [getAssetsOptimized]);
  
  const updateAsset = useCallback(async (assetId: string, data: UpdateAssetData): Promise<Asset> => {
    try {
      const updatedAsset = await api.assets.updateAsset(assetId, data);
      // Update local state and cache
      setAssets(prev => prev.map(asset => asset.id === assetId ? updatedAsset : asset));
      setCache(prev => prev.assets ? {
        ...prev,
        assets: {
          ...prev.assets,
          data: prev.assets.data.map(asset => asset.id === assetId ? updatedAsset : asset)
        }
      } : prev);
      return updatedAsset;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const deleteAsset = useCallback(async (assetId: string): Promise<void> => {
    try {
      await api.assets.deleteAsset(assetId);
      // Remove from local state and cache
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      setCache(prev => prev.assets ? {
        ...prev,
        assets: {
          ...prev.assets,
          data: prev.assets.data.filter(asset => asset.id !== assetId)
        }
      } : prev);
    } catch (err) {
      throw err;
    }
  }, []);
  
  const scanAsset = useCallback(async (data: AssetScanData): Promise<Asset> => {
    try {
      // Since scanAsset doesn't exist in the API, we'll implement a basic search
      const assets = await getAssetsOptimized(false);
      const foundAsset = assets.find(asset => 
        asset.asset_tag === data.scan_data || 
        asset.serial_number === data.scan_data
      );
      if (!foundAsset) {
        throw new Error('Asset not found');
      }
      return foundAsset;
    } catch (err) {
      throw err;
    }
  }, [getAssetsOptimized]);
  
  // Asset Category CRUD operations
  const createAssetCategory = useCallback(async (data: CreateAssetCategoryData): Promise<AssetCategory> => {
    try {
      const newCategory = await api.assets.createAssetCategory(data);
      // Invalidate cache and refresh
      setCache(prev => ({ ...prev, assetCategories: null }));
      await getAssetCategoriesOptimized(false);
      return newCategory;
    } catch (err) {
      throw err;
    }
  }, [getAssetCategoriesOptimized]);
  
  const updateAssetCategory = useCallback(async (categoryId: string, data: UpdateAssetCategoryData): Promise<AssetCategory> => {
    try {
      const updatedCategory = await api.assets.updateAssetCategory(categoryId, data);
      // Update local state and cache
      setAssetCategories(prev => prev.map(category => category.id === categoryId ? updatedCategory : category));
      setCache(prev => prev.assetCategories ? {
        ...prev,
        assetCategories: {
          ...prev.assetCategories,
          data: prev.assetCategories.data.map(category => category.id === categoryId ? updatedCategory : category)
        }
      } : prev);
      return updatedCategory;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const deleteAssetCategory = useCallback(async (categoryId: string): Promise<void> => {
    try {
      await api.assets.deleteAssetCategory(categoryId);
      // Remove from local state and cache
      setAssetCategories(prev => prev.filter(category => category.id !== categoryId));
      setCache(prev => prev.assetCategories ? {
        ...prev,
        assetCategories: {
          ...prev.assetCategories,
          data: prev.assetCategories.data.filter(category => category.id !== categoryId)
        }
      } : prev);
    } catch (err) {
      throw err;
    }
  }, []);
  
  // Asset Assignment operations - these methods don't exist in the API, so we'll implement basic functionality
  const assignAsset = useCallback(async (assetId: string, data: AssignAssetData): Promise<AssetAssignment> => {
    try {
      // Since assignAsset doesn't exist in the API, we'll update the asset status to 'assigned'
      const updatedAsset = await api.assets.updateAsset(assetId, { status: 'assigned' });
      
      // Create a mock assignment object
      const assignment: AssetAssignment = {
        id: `temp_${Date.now()}`,
        asset_id: assetId,
        employee_id: data.employee_id,
        assigned_date: data.assigned_date,
        return_date: data.return_date,
        notes: data.notes,
        created_at: new Date().toISOString(),
      };
      
      // Invalidate cache and refresh
      setCache(prev => ({ ...prev, assets: null, assetAssignments: null }));
      await Promise.all([
        getAssetsOptimized(false),
        getAssetAssignmentsOptimized(false),
      ]);
      return assignment;
    } catch (err) {
      throw err;
    }
  }, [getAssetsOptimized, getAssetAssignmentsOptimized]);
  
  const unassignAsset = useCallback(async (assetId: string, data: UnassignAssetData): Promise<void> => {
    try {
      // Since unassignAsset doesn't exist in the API, we'll update the asset status to 'in_stock'
      await api.assets.updateAsset(assetId, { status: 'in_stock' });
      
      // Invalidate cache and refresh
      setCache(prev => ({ ...prev, assets: null, assetAssignments: null }));
      await Promise.all([
        getAssetsOptimized(false),
        getAssetAssignmentsOptimized(false),
      ]);
    } catch (err) {
      throw err;
    }
  }, [getAssetsOptimized, getAssetAssignmentsOptimized]);
  
  const getAssetAssignmentHistory = useCallback(async (assetId: string): Promise<AssetAssignment[]> => {
    try {
      // Since getAssetAssignmentHistory doesn't exist in the API, we'll return an empty array
      // In a real implementation, this would fetch from a separate endpoint
      return [];
    } catch (err) {
      throw err;
    }
  }, []);
  
  // ================================
  // CACHE MANAGEMENT
  // ================================
  
  const clearCache = useCallback(() => {
    setCache({
      assets: null,
      assetCategories: null,
      assetAssignments: null,
    });
    console.log("Assets cache cleared");
  }, []);
  
  const invalidateCache = useCallback((type?: keyof AssetsCache) => {
    if (type) {
      setCache(prev => ({ ...prev, [type]: null }));
    } else {
      clearCache();
    }
  }, [clearCache]);
  
  const refreshData = useCallback(async () => {
    clearCache();
    await Promise.all([
      getAssetsOptimized(false),
      getAssetCategoriesOptimized(false),
      getAssetAssignmentsOptimized(false),
    ]);
  }, [clearCache, getAssetsOptimized, getAssetCategoriesOptimized, getAssetAssignmentsOptimized]);
  
  // Auto-initialize data on auth
  useEffect(() => {
    if (isAuthenticated) {
      // Load asset categories immediately (static data)
      getAssetCategoriesOptimized();
    } else {
      clearCache();
    }
  }, [isAuthenticated, getAssetCategoriesOptimized, clearCache]);
  
  const value: AssetsContextType = {
    // Cache state
    cache,
    
    // Data state
    assets,
    assetCategories,
    assetAssignments,
    
    // Loading states
    isLoadingAssets,
    isLoadingAssetCategories,
    isLoadingAssetAssignments,
    
    // Error states
    assetsError,
    assetCategoriesError,
    assetAssignmentsError,
    
    // Optimized data access methods
    getAssetsOptimized,
    getAssetsByStatus,
    getActiveAssets,
    getInStockAssets,
    getAssignedAssets,
    getMaintenanceAssets,
    getRetiredAssets,
    getAssetsByCategory,
    getAssetsByLocation,
    getAssetsByName,
    getAssetsByTag,
    getAssetsByValueRange,
    getDepreciatingAssets,
    getAssetsNearWarrantyExpiry,
    
    getAssetCategoriesOptimized,
    getActiveAssetCategories,
    getInactiveAssetCategories,
    getAssetCategoryByName,
    
    getAssetAssignmentsOptimized,
    getActiveAssignments,
    getAssignmentsByEmployee,
    getAssignmentsByAsset,
    getOverdueAssignments,
    
    // Asset analytics
    getAssetSummary,
    getDepreciationSummary,
    
    // Standard CRUD operations
    fetchAssets,
    fetchAssetCategories,
    fetchAssetAssignments,
    
    createAsset,
    updateAsset,
    deleteAsset,
    scanAsset,
    
    createAssetCategory,
    updateAssetCategory,
    deleteAssetCategory,
    
    assignAsset,
    unassignAsset,
    getAssetAssignmentHistory,
    
    // Cache management
    clearCache,
    invalidateCache,
    refreshData,
  };
  
  return (
    <AssetsContext.Provider value={value}>
      {children}
    </AssetsContext.Provider>
  );
};

export const useAssets = (): AssetsContextType => {
  const context = useContext(AssetsContext);
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetsProvider");
  }
  return context;
};

export default AssetsContext; 