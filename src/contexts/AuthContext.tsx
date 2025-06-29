import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { apiClient, API_ENDPOINTS, STORAGE_KEYS } from "@/apis";
import { api } from "@/apis";
import type { User, LoginCredentials, RegisterCredentials /* ForgotPasswordCredentials, ResetPasswordCredentials, UpdateProfileData */ } from "@/apis/types"; // Removed unused types
// Removed: import type { AxiosError } from "axios";
import { ApiError } from "@/apis/core/errors";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // isLoading: boolean; // Duplicate of loading
  error: Error | null;
  isAuthenticated: boolean;
  token: string | null;
  companyId: string | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState { // Added AuthState interface based on usage
  user: User | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  token: string | null;
}

const initialAuthState: AuthState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  token: null,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  // const [user, setUser] = useState<User | null>(null); // Managed by authState
  // const [companyId, setCompanyId] = useState<string | null>(null); // Managed by authState
  // const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Managed by authState
  // const [isLoading, setIsLoading] = useState<boolean>(true); // Managed by authState
  // const [error, setError] = useState<Error | null>(null); // Managed by authState
  // const [authInitialized, setAuthInitialized] = useState<boolean>(false); // Unused

  const initializeAuth = useCallback(async () => {
    console.log("🔐 Initializing auth...");
    setAuthState(prev => ({ ...prev, loading: true }));
    
    // First, check if we have a stored token
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    console.log("🔑 Stored token found:", !!storedToken);
    
    if (!storedToken) {
      // No token found, user is not authenticated
      console.log("❌ No token found, setting as unauthenticated");
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        token: null,
      }));
      apiClient.setAuthToken(null);
      setIsInitializing(false);
      return;
    }

    // Set the token before making API calls
    console.log("🔄 Setting token in API client");
    apiClient.setAuthToken(storedToken);
    
    try {
      // Now try to get user data with the token
      console.log("📡 Making getMe API call...");
      const userData = await api.auth.getMe();
      console.log("✅ User data retrieved:", { id: userData.id, email: userData.email, company_id: userData.company_id });
      setAuthState(prev => ({
        ...prev,
        user: userData,
        isAuthenticated: true,
        loading: false,
        error: null,
        token: storedToken,
      }));
    } catch (err) {
      console.error("❌ Failed to get user data, token may be invalid:", err);
      console.error("❌ Error details:", {
        message: err instanceof Error ? err.message : 'Unknown error',
        name: err instanceof Error ? err.name : 'Unknown',
        stack: err instanceof Error ? err.stack : 'No stack'
      });
      
      // Check if it's an authentication error (401, 403, or session expired)
      const isAuthError = err instanceof Error && (
        err.message.toLowerCase().includes('session expired') ||
        err.message.toLowerCase().includes('unauthorized') ||
        err.message.toLowerCase().includes('authentication failed')
      );
      
      console.log("🔍 Is auth error:", isAuthError);
      
      // Only set error if it's not an auth error (which is expected for expired tokens)
      const errorToSet = isAuthError ? null : (err instanceof Error ? err : new Error("Authentication failed"));
      
      // Token is invalid, clear it silently
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: errorToSet,
        token: null,
      }));
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      apiClient.resetAuthState();
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const refreshUser = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const userData = await api.auth.getMe();
      setAuthState(prev => ({ ...prev, user: userData, loading: false, error: null }));
    } catch (err) {
      console.error("Failed to refresh user data, potentially logged out:", err);
      
      // Check if it's an authentication error (expected for expired tokens)
      const isAuthError = err instanceof Error && (
        err.message.toLowerCase().includes('session expired') ||
        err.message.toLowerCase().includes('unauthorized') ||
        err.message.toLowerCase().includes('authentication failed')
      );
      
      // Only set error if it's not an auth error (which is expected for expired tokens)
      const errorToSet = isAuthError ? null : (err instanceof Error ? err : new Error("Refresh failed"));
      
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: errorToSet,
      }));
      
      // Clear tokens on auth errors
      if (isAuthError) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        apiClient.resetAuthState();
      }
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (authState.isAuthenticated) {
        refreshUser();
      }
    }, 15 * 60 * 1000); 
    return () => clearInterval(intervalId);
  }, [authState.isAuthenticated, refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    console.log("🔐 Starting login process...");
    // Clear any existing tokens and errors before attempting login
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    setIsInitializing(false); // Prevent conflicts with initialization
    
    // Clear any existing tokens to prevent "Session expired" errors during login
    console.log("🧹 Clearing existing tokens...");
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    apiClient.resetAuthState();
    
    try {
      console.log("📡 Making login API call...");
      const authData = await api.auth.login(credentials); // Assuming login returns AuthResponse
      console.log("✅ Login successful:", { user: authData.user.id, email: authData.user.email });
      setAuthState({
        user: authData.user,
        token: authData.tokens.accessToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      apiClient.setAuthToken(authData.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authData.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.tokens.refreshToken);
      return authData.user;
    } catch (err) {
      console.error("❌ Login failed:", err);
      const apiError = err as ApiError;
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message ? new Error(apiError.message) : new Error("Login failed"),
        isAuthenticated: false,
        user: null,
        token: null,
      }));
      throw apiError;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<User> => {
    // Clear any existing tokens and errors before attempting registration
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    setIsInitializing(false); // Prevent conflicts with initialization
    
    // Clear any existing tokens to prevent "Session expired" errors during registration
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    apiClient.resetAuthState();
    
    try {
      const authData = await api.auth.signup(credentials); // Using signup method
      setAuthState({
        user: authData.user,
        token: authData.tokens.accessToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      apiClient.setAuthToken(authData.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authData.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.tokens.refreshToken);
      return authData.user;
    } catch (err) {
      const apiError = err as ApiError;
       setAuthState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message ? new Error(apiError.message) : new Error("Registration failed"),
        isAuthenticated: false,
        user: null,
        token: null,
      }));
      throw apiError;
    }
  }, []);

  const logout = async () => {
    try {
      if (authState.token) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setAuthState({ 
        user: null, 
        loading: false, 
        error: null, 
        isAuthenticated: false, 
        token: null 
      });
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      apiClient.setAuthToken(null);
    }
  };

  const value: AuthContextType = {
    user: authState.user,
    loading: authState.loading,
    // isLoading: authState.loading, // Removed duplicate
    error: authState.error,
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
    companyId: authState.user?.company_id || null,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
