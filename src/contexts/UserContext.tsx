import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/apis";
import type { 
  User, 
  // UserProfile, // Unused
  // UserPreferences, // Unused
  // UpdateProfileData, // Unused
  UpdateUserPreferencesData, 
  ChangePasswordData,
  // PaginatedResponse, // Unused
  PaginationParams,
  // CreateUserData, // Unused
  UserActivity, // Added UserActivity type
  UpdateUserProfileData, // Added UpdateUserProfileData type
} from "@/apis/types";
import { useAuth } from "./AuthContext";
import { ApiError } from "@/apis/core/errors";

interface UserContextType {
  // User state
  userProfile: User | null;
  userPreferences: Record<string, unknown>;
  userActivity: UserActivity | null;
  companyUsers: User[]; // Add company users state
  
  // Loading states
  isLoadingProfile: boolean;
  isLoadingPreferences: boolean;
  isLoadingActivity: boolean;
  isLoadingCompanyUsers: boolean; // Add loading state for company users
  
  // Error states
  profileError: string | null;
  preferencesError: string | null;
  activityError: string | null;
  companyUsersError: string | null; // Add error state for company users
  
  // Actions
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (userData: UpdateUserProfileData) => Promise<User>;
  updateUserPreferences: (preferences: UpdateUserPreferencesData) => Promise<void>;
  uploadUserAvatar: (file: File) => Promise<User>;
  fetchUserPreferences: () => Promise<void>;
  updateUserPreferencesData: (preferences: UpdateUserPreferencesData) => Promise<void>;
  fetchUserActivityLogs: (params?: PaginationParams) => Promise<void>;
  changeUserPassword: (passwordData: ChangePasswordData) => Promise<void>;
  fetchCompanyUsers: (companyId: string) => Promise<void>; // Add company users fetch method
  
  // Cache management
  clearUserCache: () => void;
  refreshUserProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // State
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userPreferences, setUserPreferences] = useState<Record<string, unknown>>({});
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [companyUsers, setCompanyUsers] = useState<User[]>([]); // Add company users state
  // const [users, setUsers] = useState<User[]>([]); // Unused state
  // const [isLoading, setIsLoading] = useState(false); // Unused state
  // const [error, setError] = useState<string | null>(null); // Unused state
  // const [lastProfileFetch, setLastProfileFetch] = useState<number>(0); // Unused
  
  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [isLoadingCompanyUsers, setIsLoadingCompanyUsers] = useState(false); // Add loading state for company users
  
  // Error states
  const [profileError, setProfileError] = useState<string | null>(null);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [companyUsersError, setCompanyUsersError] = useState<string | null>(null); // Add error state for company users
  
  // Cache management
  // const [lastProfileFetch, setLastProfileFetch] = useState<number>(0); // Unused
  
  const { isAuthenticated, user } = useAuth();
  
  // Cache duration (5 minutes for user data)
  // const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes, Unused
  
  // Sync with auth context user
  useEffect(() => {
    if (user && !userProfile) {
      setUserProfile(user);
      setUserPreferences((user as User & { preferences?: Record<string, unknown> }).preferences || {});
    }
  }, [user, userProfile]);
  
  // Fetch user profile with caching
  const fetchUserProfile = useCallback(async (userId?: string) => {
    setIsLoadingProfile(true);
    setProfileError(null);
    try {
      const data = await api.user.getUserProfile(userId);
      setUserProfile(data);
      const cacheKey = userId ? `user_profile_${userId}` : "current_user_profile";
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : "Failed to load user profile. Please try again.";
      setProfileError(errorMessage);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);
  
  // Update user profile
  const updateUserProfile = useCallback(async (userData: UpdateUserProfileData): Promise<User> => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    if (!userProfile?.id) {
      throw new Error("User profile not available");
    }
    
    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      
      const updatedUser = await api.user.updateUserProfile(userData, userProfile.id);
      
      // Update local state
      setUserProfile(updatedUser);
      
      // Invalidate cache
      // setLastProfileFetch(0); // Unused
      
      console.log("User profile updated");
      return updatedUser;
    } catch (error: unknown) {
      console.error("Failed to update user profile:", error);
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [isAuthenticated, userProfile?.id]);
  
  // Update user preferences
  const updateUserPreferences = useCallback(async (preferences: UpdateUserPreferencesData): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    try {
      setIsLoadingPreferences(true);
      setPreferencesError(null);
      
      await api.user.updateUserPreferences(preferences);
      
      // Update local state
      setUserPreferences(prev => ({ ...prev, ...preferences }));
      
      // Update user profile if available
      if (userProfile) {
        setUserProfile(prev => prev ? { ...prev, preferences: { ...(prev as User & { preferences?: Record<string, unknown> }).preferences, ...preferences } } : null);
      }
      
      console.log("User preferences updated");
    } catch (error: unknown) {
      console.error("Failed to update user preferences:", error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Failed to update preferences. Please try again.";
      setPreferencesError(errorMessage);
      throw error;
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [isAuthenticated, userProfile]);
  
  // Upload user avatar - placeholder implementation
  const uploadUserAvatar = useCallback(async (/* file: File */): Promise<User> => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      
      // This would need to be implemented in the user service
      console.warn("uploadUserAvatar not implemented in user service yet");
      
      // Placeholder - would normally upload file and get updated user
      const updatedUser = userProfile!;
      setUserProfile(updatedUser);
      
      console.log("User avatar uploaded");
      return updatedUser;
    } catch (error: unknown) {
      console.error("Failed to upload user avatar:", error);
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [isAuthenticated, userProfile]);

  // Fetch user preferences
  const fetchUserPreferences = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoadingPreferences(true);
      setPreferencesError(null);
      
      const preferences = await api.user.getUserPreferences();
      setUserPreferences(preferences);
    } catch (error: unknown) {
      console.error("Failed to fetch user preferences:", error);
      if (error instanceof ApiError && error.statusCode === 404) {
        console.warn("User preferences endpoint not available on backend yet");
        setPreferencesError("User preferences feature not available yet");
      } else {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Failed to load preferences. Please try again.";
      setPreferencesError(errorMessage);
      }
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [isAuthenticated]);

  // Update user preferences data (alias for updateUserPreferences)
  const updateUserPreferencesData = useCallback(async (preferences: UpdateUserPreferencesData): Promise<void> => {
    return updateUserPreferences(preferences);
  }, [updateUserPreferences]);

  // Fetch user activity logs
  const fetchUserActivityLogs = useCallback(async (params?: PaginationParams) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoadingActivity(true);
      setActivityError(null);
      
      const activityData = await api.user.getUserActivity(undefined, params);
      // For now, just set the first activity item or null
      setUserActivity(activityData.data.length > 0 ? activityData.data[0] : null);
    } catch (error: unknown) {
      console.error("Failed to fetch user activity:", error);
      if (error instanceof ApiError && error.statusCode === 404) {
        console.warn("User activity endpoint not available on backend yet");
        setActivityError("User activity feature not available yet");
      } else {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Failed to load activity logs. Please try again.";
      setActivityError(errorMessage);
      }
    } finally {
      setIsLoadingActivity(false);
    }
  }, [isAuthenticated]);

  // Change user password
  const changeUserPassword = useCallback(async (passwordData: ChangePasswordData): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    try {
      await api.user.changePassword(passwordData);
      console.log("Password changed successfully");
    } catch (error: unknown) {
      console.error("Failed to change password:", error);
      throw error;
    }
  }, [isAuthenticated]);

  // Fetch company users
  const fetchCompanyUsers = useCallback(async (companyId: string): Promise<void> => {
    try {
      setIsLoadingCompanyUsers(true);
      setCompanyUsersError(null);
      
      const users = await api.user.getCompanyUsers(companyId);
      setCompanyUsers(users);
      console.log("Company users fetched successfully");
    } catch (error: unknown) {
      console.error("Failed to fetch company users:", error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Failed to load company users. Please try again.";
      setCompanyUsersError(errorMessage);
      throw error;
    } finally {
      setIsLoadingCompanyUsers(false);
    }
  }, []);
  
  // Cache management
  const clearUserCache = useCallback(() => {
    setUserProfile(null);
    setUserPreferences({});
    setUserActivity(null);
    setCompanyUsers([]);
    // setLastProfileFetch(0); // Unused
    console.log("User cache cleared");
  }, []);
  
  const refreshUserProfile = useCallback(async () => {
    // setLastProfileFetch(0); // Invalidate cache, Unused
    await fetchUserProfile();
  }, [fetchUserProfile]);
  
  // Auto-fetch user data on auth change
  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      fetchUserProfile();
    } else if (!isAuthenticated) {
      clearUserCache();
    }
  }, [isAuthenticated, userProfile, fetchUserProfile, clearUserCache]);
  
  const value: UserContextType = {
    // User state
    userProfile,
    userPreferences,
    userActivity,
    companyUsers,
    
    // Loading states
    isLoadingProfile,
    isLoadingPreferences,
    isLoadingActivity,
    isLoadingCompanyUsers,
    
    // Error states
    profileError,
    preferencesError,
    activityError,
    companyUsersError,
    
    // Actions
    fetchUserProfile,
    updateUserProfile,
    updateUserPreferences,
    uploadUserAvatar,
    fetchUserPreferences,
    updateUserPreferencesData,
    fetchUserActivityLogs,
    changeUserPassword,
    fetchCompanyUsers,
    
    // Cache management
    clearUserCache,
    refreshUserProfile,
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserContext;
