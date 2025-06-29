import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/apis";
import { useAuth } from "./AuthContext";
import type { Company } from "@/apis/types";
import { ApiError } from "@/apis/core/errors";

type SubscriptionStatus = 'trial' | 'expired' | 'pro' | 'enterprise' | 'premium' | 'basic' | null;
type SubscriptionPlan = 'trial' | 'basic' | 'pro' | 'enterprise' | 'premium' | null;

interface SubscriptionCache {
  companyDetails: {
    data: Company;
    timestamp: number;
  } | null;
}

interface SubscriptionContextType {
  // Cache state
  cache: SubscriptionCache;
  
  // Subscription state
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  isTrialPlan: boolean;
  isExpiredPlan: boolean;
  isPaidPlan: boolean;
  shouldShowUpgrade: boolean;
  trialDaysRemaining: number | null;
  
  // Company details (cached)
  companyDetails: Company | null;
  
  // Loading and error states
  isLoadingSubscription: boolean;
  subscriptionError: string | null;
  
  // Optimized data access methods
  getSubscriptionStatusOptimized: (useCache?: boolean) => Promise<SubscriptionStatus>;
  getCompanyDetailsOptimized: (useCache?: boolean) => Promise<Company | null>;
  
  // Subscription utilities
  canAccessFeature: (feature: string) => boolean;
  getSubscriptionBadgeInfo: () => { text: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' };
  getUpgradeMessage: () => string;
  
  // Standard operations
  fetchSubscriptionStatus: (companyId?: string) => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  
  // Cache management
  clearCache: () => void;
  invalidateCache: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Cache duration: 15 minutes for subscription data (relatively static)
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Cache state
  const [cache, setCache] = useState<SubscriptionCache>({
    companyDetails: null,
  });
  
  // Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(null);
  const [companyDetails, setCompanyDetails] = useState<Company | null>(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  
  // Loading and error states
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  
  const { user: authUser, isAuthenticated } = useAuth();
  
  // Helper function to check if cache is valid
  const isCacheValid = (cacheItem: { timestamp: number } | null, duration: number): boolean => {
    if (!cacheItem) return false;
    return Date.now() - cacheItem.timestamp < duration;
  };
  
  // Calculate derived subscription properties
  const isTrialPlan = subscriptionStatus === 'trial';
  const isExpiredPlan = subscriptionStatus === 'expired';
  const isPaidPlan = subscriptionStatus !== null && !isTrialPlan && !isExpiredPlan;
  const shouldShowUpgrade = isTrialPlan || isExpiredPlan;
  
  // ================================
  // OPTIMIZED DATA ACCESS METHODS
  // ================================
  
  const getCompanyDetailsOptimized = useCallback(async (useCache: boolean = true): Promise<Company | null> => {
    const companyId = authUser?.company_id;
    if (!companyId) {
      console.log("🏢 No company ID available for subscription check");
      return null;
    }
    
    if (useCache && isCacheValid(cache.companyDetails, CACHE_DURATION)) {
      console.log("📋 Using cached company details for subscription");
      return cache.companyDetails!.data;
    }
    
    setIsLoadingSubscription(true);
    setSubscriptionError(null);
    
    try {
      console.log("📡 Fetching company details for subscription...");
      const data = await api.company.getCompanyDetails(companyId);
      
      setCompanyDetails(data);
      setCache(prev => ({
        ...prev,
        companyDetails: { data, timestamp: Date.now() }
      }));
      
      console.log("✅ Company details fetched successfully:", { 
        id: data.id, 
        subscription_status: data.subscription_status 
      });
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load subscription status";
      setSubscriptionError(errorMessage);
      console.error("❌ Failed to fetch company details for subscription:", err);
      return null;
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [authUser?.company_id, cache.companyDetails]);
  
  const getSubscriptionStatusOptimized = useCallback(async (useCache: boolean = true): Promise<SubscriptionStatus> => {
    const company = await getCompanyDetailsOptimized(useCache);
    
    if (!company) {
      return null;
    }
    
    const status = company.subscription_status as SubscriptionStatus;
    setSubscriptionStatus(status);
    setSubscriptionPlan(status);
    
    // Calculate trial days remaining if applicable
    if (status === 'trial' && company.trial_end_date) {
      const trialEndDate = new Date(company.trial_end_date);
      const now = new Date();
      const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setTrialDaysRemaining(Math.max(0, daysRemaining));
    } else {
      setTrialDaysRemaining(null);
    }
    
    console.log("🔔 Subscription status updated:", { status, plan: status });
    return status;
  }, [getCompanyDetailsOptimized]);
  
  // ================================
  // SUBSCRIPTION UTILITIES
  // ================================
  
  const canAccessFeature = useCallback((feature: string): boolean => {
    // Define feature access based on subscription plans
    const featureAccess = {
      trial: ['basic_features', 'limited_users'],
      basic: ['basic_features', 'standard_users'],
      pro: ['basic_features', 'standard_users', 'advanced_features', 'integrations'],
      enterprise: ['basic_features', 'standard_users', 'advanced_features', 'integrations', 'custom_features'],
      premium: ['basic_features', 'standard_users', 'advanced_features', 'integrations', 'premium_features'],
    };
    
    if (!subscriptionPlan || subscriptionPlan === 'expired') {
      return false;
    }
    
    const allowedFeatures = featureAccess[subscriptionPlan as keyof typeof featureAccess] || [];
    return allowedFeatures.includes(feature);
  }, [subscriptionPlan]);
  
  const getSubscriptionBadgeInfo = useCallback((): { text: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' } => {
    switch (subscriptionStatus) {
      case 'trial':
        return { text: trialDaysRemaining ? `Trial (${trialDaysRemaining}d)` : 'Trial', variant: 'default' };
      case 'expired':
        return { text: 'Trial Expired', variant: 'destructive' };
      case 'basic':
        return { text: 'Basic', variant: 'outline' };
      case 'pro':
        return { text: 'Pro', variant: 'secondary' };
      case 'enterprise':
        return { text: 'Enterprise', variant: 'secondary' };
      case 'premium':
        return { text: 'Premium', variant: 'secondary' };
      default:
        return { text: 'Free', variant: 'outline' };
    }
  }, [subscriptionStatus, trialDaysRemaining]);
  
  const getUpgradeMessage = useCallback((): string => {
    switch (subscriptionStatus) {
      case 'trial':
        return trialDaysRemaining 
          ? `Your trial expires in ${trialDaysRemaining} days. Upgrade now to continue using all features.`
          : 'Your trial is ending soon. Upgrade now to continue using all features.';
      case 'expired':
        return 'Your trial has expired. Upgrade now to regain access to all features.';
      default:
        return 'Upgrade your plan to unlock more features and capabilities.';
    }
  }, [subscriptionStatus, trialDaysRemaining]);
  
  // ================================
  // STANDARD OPERATIONS
  // ================================
  
  const fetchSubscriptionStatus = useCallback(async (companyId?: string) => {
    const targetCompanyId = companyId || authUser?.company_id;
    if (!targetCompanyId) {
      console.log("🏢 No company ID provided for subscription fetch");
      return;
    }
    
    await getSubscriptionStatusOptimized(false); // Force fresh fetch
  }, [authUser?.company_id, getSubscriptionStatusOptimized]);
  
  const refreshSubscriptionStatus = useCallback(async () => {
    console.log("🔄 Refreshing subscription status...");
    await getSubscriptionStatusOptimized(false); // Force fresh fetch
  }, [getSubscriptionStatusOptimized]);
  
  // ================================
  // CACHE MANAGEMENT
  // ================================
  
  const clearCache = useCallback(() => {
    setCache({
      companyDetails: null,
    });
    setSubscriptionStatus(null);
    setSubscriptionPlan(null);
    setCompanyDetails(null);
    setTrialDaysRemaining(null);
    setSubscriptionError(null);
    console.log("🧹 Subscription cache cleared");
  }, []);
  
  const invalidateCache = useCallback(() => {
    setCache(prev => ({ ...prev, companyDetails: null }));
    console.log("🔄 Subscription cache invalidated");
  }, []);
  
  // ================================
  // INITIALIZATION
  // ================================
  
  // Auto-initialize subscription data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && authUser?.company_id) {
      console.log("🚀 Auto-initializing subscription status for company:", authUser.company_id);
      getSubscriptionStatusOptimized().catch(err => {
        console.error("Auto-initialization failed for subscription:", err);
      });
    } else {
      console.log("❌ User not authenticated or no company ID, clearing subscription cache");
      clearCache();
    }
  }, [isAuthenticated, authUser?.company_id, getSubscriptionStatusOptimized, clearCache]);
  
  const value: SubscriptionContextType = {
    // Cache state
    cache,
    
    // Subscription state
    subscriptionStatus,
    subscriptionPlan,
    isTrialPlan,
    isExpiredPlan,
    isPaidPlan,
    shouldShowUpgrade,
    trialDaysRemaining,
    
    // Company details
    companyDetails,
    
    // Loading and error states
    isLoadingSubscription,
    subscriptionError,
    
    // Optimized data access methods
    getSubscriptionStatusOptimized,
    getCompanyDetailsOptimized,
    
    // Subscription utilities
    canAccessFeature,
    getSubscriptionBadgeInfo,
    getUpgradeMessage,
    
    // Standard operations
    fetchSubscriptionStatus,
    refreshSubscriptionStatus,
    
    // Cache management
    clearCache,
    invalidateCache,
  };
  
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export default SubscriptionContext; 