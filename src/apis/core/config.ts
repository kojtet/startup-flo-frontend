import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://startup-flo-backend.onrender.com";

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: false,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "startup_flo_auth_token",
  REFRESH_TOKEN: "startup_flo_refresh_token",
  USER_DATA: "startup_flo_user_data",
} as const;

export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000,
  MEDIUM: 15 * 60 * 1000,
  LONG: 60 * 60 * 1000,
};

export const DEFAULT_QUERY_OPTIONS = {
  staleTime: CACHE_DURATIONS.SHORT,
  cacheTime: CACHE_DURATIONS.MEDIUM,
  refetchOnWindowFocus: true,
  retry: (failureCount: number, error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
        if (error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
            return false;
        }
    }
    return failureCount < 3;
  },
};
