import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
    ReactNode,
    useMemo,
  } from "react";
  import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
  import { jwtDecode } from "jwt-decode";
  import { apiClient } from "@/apis/core/client";
  
  /***************************************
   * CONFIGURATION                       *
   **************************************/
  const API_BASE_URL = "https://startup-flo-backend.onrender.com";
  
  const STORAGE_KEYS = {
    accessToken: "sf_access_token",
    refreshToken: "sf_refresh_token",
    user: "sf_user",
  };
  
  /***************************************
   * TYPE DEFINITIONS                    *
   **************************************/
  export interface User {
    id: string;
    email: string;
    company_id: string;
    role: string;
    is_verified?: boolean;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  }
  
  interface Tokens {
    accessToken: string;
    refreshToken: string;
    /** ISO strings from server – optional fall‑back to JWT exp */
    accessTokenExpires?: string;
    refreshTokenExpires?: string;
    tokenType: "Bearer";
  }
  
  type Nullable<T> = T | null;
  
  interface AuthContextType {
  user: Nullable<User>;
  loading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { email: string; password: string; companyName: string }) => Promise<void>;
  logout: () => void;
  /** Manually trigger a token refresh */
  refreshTokens: () => Promise<void>;
  error: { message: string } | null;
}
  
  /***************************************
   * INTERNAL UTILS                      *
   **************************************/
  interface JWTPayload {
    /** expiry (seconds since epoch) */
    exp: number;
    iat: number;
  }
  
  const readStorage = <T,>(key: string): Nullable<T> => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) {
      return null;
    }
  };
  
  const writeStorage = (key: string, value: unknown) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  };
  
  const removeStorage = (key: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  };
  
  /***************************************
   * AXIOS INSTANCE & INTERCEPTORS       *
   **************************************/
  // All references to apiClient now use the imported instance, which supports setAuthToken.
  
  /***************************************
   * AUTH PROVIDER IMPLEMENTATION        *
   **************************************/
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Nullable<User>>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [refreshTimerId, setRefreshTimerId] = useState<number | undefined>(undefined);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  
  // Use refs to avoid circular dependencies
  const refreshTokensRef = useRef<() => Promise<void>>();
  const logoutRef = useRef<() => void>();
  
    const logout = useCallback(() => {
      removeStorage(STORAGE_KEYS.accessToken);
      removeStorage(STORAGE_KEYS.refreshToken);
      removeStorage(STORAGE_KEYS.user);
      setUser(null);
      if (refreshTimerId) window.clearTimeout(refreshTimerId);
      apiClient.setAuthToken(null);
    }, [refreshTimerId]);
  
    const scheduleTokenRefresh = useCallback((accessToken: string, accessTokenExpires?: string) => {
      if (refreshTimerId) {
        window.clearTimeout(refreshTimerId);
      }
  
      let expiresAtMs: number;
  
      if (accessTokenExpires) {
        expiresAtMs = new Date(accessTokenExpires).getTime();
      } else {
        const { exp } = jwtDecode<JWTPayload>(accessToken);
        expiresAtMs = exp * 1000;
      }
  
      // Don't schedule refresh if token is already expired or expires very soon
      const timeUntilExpiry = expiresAtMs - Date.now();
      if (timeUntilExpiry <= 0) {
        console.warn('Token is already expired, not scheduling refresh');
        return;
      }
  
      // Refresh 60 seconds before expiry, but at least 5 seconds from now
      const timeout = Math.max(timeUntilExpiry - 60_000, 5_000);
      const id = window.setTimeout(() => {
        // Only attempt refresh if we still have a user (not logged out)
        if (user && refreshTokensRef.current) {
          refreshTokensRef.current().catch(() => {
            // If refresh failed, log out silently
            if (logoutRef.current) {
              logoutRef.current();
            }
          });
        }
      }, timeout);
  
      setRefreshTimerId(id);
    }, [refreshTimerId, user]);
  
    const refreshTokens = useCallback(async () => {
      const refreshToken = readStorage<string>(STORAGE_KEYS.refreshToken);
      if (!refreshToken) throw new Error("No refresh token available");
  
      const res: AxiosResponse<{ tokens: Tokens; user: User }> = await apiClient.post("/auth/refresh", {
        refreshToken,
      });
      
      // Directly persist the session without circular dependency
      writeStorage(STORAGE_KEYS.accessToken, res.data.tokens.accessToken);
      writeStorage(STORAGE_KEYS.refreshToken, res.data.tokens.refreshToken);
      writeStorage(STORAGE_KEYS.user, res.data.user);
  
      apiClient.setAuthToken(res.data.tokens.accessToken); // <-- Ensure token is set after refresh
      setUser(res.data.user);
      scheduleTokenRefresh(res.data.tokens.accessToken, res.data.tokens.accessTokenExpires);
    }, [scheduleTokenRefresh]);
  
    // Update refs when functions change
    useEffect(() => {
      logoutRef.current = logout;
    }, [logout]);
  
    useEffect(() => {
      refreshTokensRef.current = refreshTokens;
    }, [refreshTokens]);
  
    /** Persist tokens + user to localStorage and set axios header */
    const persistSession = useCallback((tokens: Tokens, usr: User) => {
      writeStorage(STORAGE_KEYS.accessToken, tokens.accessToken);
      writeStorage(STORAGE_KEYS.refreshToken, tokens.refreshToken);
      writeStorage(STORAGE_KEYS.user, usr);
  
      apiClient.setAuthToken(tokens.accessToken); // <-- Ensure token is set after login/register/refresh
      setUser(usr);
      scheduleTokenRefresh(tokens.accessToken, tokens.accessTokenExpires);
    }, [scheduleTokenRefresh]);
  
    /***********************************
     * PUBLIC ACTIONS                   *
     ***********************************/
    const login = async (credentials: { email: string; password: string }) => {
      setLoading(true);
      setError(null);
      try {
        const res: AxiosResponse<{ tokens: Tokens; user: User }> = await apiClient.post("/auth/login", {
          email: credentials.email,
          password: credentials.password,
        });
        persistSession(res.data.tokens, res.data.user);
      } catch (err) {
        if (err instanceof Error) {
          setError({ message: err.message });
        } else {
          setError({ message: "Login failed" });
        }
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const register = async (credentials: { email: string; password: string; companyName: string }) => {
      setLoading(true);
      setError(null);
      try {
        const res: AxiosResponse<{ tokens: Tokens; user: User }> = await apiClient.post("/auth/register", {
          email: credentials.email,
          password: credentials.password,
          companyName: credentials.companyName,
        });
        persistSession(res.data.tokens, res.data.user);
      } catch (err) {
        if (err instanceof Error) {
          setError({ message: err.message });
        } else {
          setError({ message: "Registration failed" });
        }
        throw err;
      } finally {
        setLoading(false);
      }
    };
  

  
    /***********************************
     * STARTUP: HYDRATE & SETUP         *
     ***********************************/
    useEffect(() => {
      // Hydrate user data from localStorage
      const storedUser = readStorage<User>(STORAGE_KEYS.user);
      const accessToken = readStorage<string>(STORAGE_KEYS.accessToken);
      
      if (storedUser && accessToken) {
        setUser(storedUser);
        apiClient.setAuthToken(accessToken); // <-- Ensure token is set on hydration
        // Schedule refresh based on existing token
        scheduleTokenRefresh(accessToken);
      }
      
      // Mark as hydrated after first render
      setIsHydrated(true);
    }, []);
  
    // (Optional) If you want to add interceptors, do so in the ApiClient class itself.
  
      const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isHydrated,
    login,
    register,
    logout,
    refreshTokens,
    error,
  };

  // Export the configured API client for use in other hooks
  (value as any).apiClient = apiClient;
  
    const memoizedValue = useMemo(() => value, [
      user,
      loading,
      isHydrated,
      error
    ]);
    (memoizedValue as any).apiClient = apiClient;
    return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
  };
  
  /***************************************
   * CONSUMER HOOK                       *
   **************************************/
  export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
  }
  