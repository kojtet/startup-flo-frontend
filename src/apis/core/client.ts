import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_CONFIG, STORAGE_KEYS } from "./config";
import { NetworkError, UnauthorizedError, handleApiError } from "./errors";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

export interface ApiConfigOverride extends AxiosRequestConfig {
  [key: string]: unknown;
}

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private currentAuthToken: string | null = null;
  private onAuthError?: () => Promise<void>;

  constructor(config: AxiosRequestConfig = API_CONFIG, onAuthError?: () => Promise<void>) {
    this.axiosInstance = axios.create(config);
    this.currentAuthToken = this.loadTokenFromStorage();
    if (this.currentAuthToken) {
      this.setAuthToken(this.currentAuthToken);
    }
    this.onAuthError = onAuthError;
    this.initializeInterceptors();
  }

  private loadTokenFromStorage(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    return null;
  }

  private saveTokenToStorage(token: string | null): void {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    }
  }

  public setAuthToken(token: string | null): void {
    this.currentAuthToken = token;
    this.saveTokenToStorage(token);
    if (token) {
      this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common["Authorization"];
    }
  }

  public getAuthToken(): string | null {
    return this.currentAuthToken;
  }

  public resetAuthState(): void {
    console.log("🔄 Resetting API client auth state...");
    this.currentAuthToken = null;
    this.saveTokenToStorage(null);
    delete this.axiosInstance.defaults.headers.common["Authorization"];
    console.log("✅ API client auth state reset complete");
  }

  private initializeInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.currentAuthToken && !config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${this.currentAuthToken}`;
        }
        return config;
      },
      (error: unknown) => {
        return Promise.reject(new NetworkError("Network error during request setup", error instanceof Error ? error : undefined));
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: unknown) => {
        const originalRequest = (error as AxiosError)?.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
              isRefreshing = true;
              try {
                console.warn("Token refresh attempt (not implemented yet). Logging out as fallback.");
                
                if (this.onAuthError) {
                  await this.onAuthError();
                }
                const errorData = axiosError.response?.data as { message?: string };
                return Promise.reject(new UnauthorizedError(errorData?.message || "Session expired. Please login again."));

              } catch (refreshError: unknown) {
                processFailedQueue(refreshError, null);
                 if (this.onAuthError) {
                  await this.onAuthError();
                }
                return Promise.reject(new UnauthorizedError("Session expired. Unable to refresh token."));
              } finally {
                isRefreshing = false;
              }
            }

            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
            .then(token => {
              if (originalRequest.headers) {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
              }
              return this.axiosInstance(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
          }
          return Promise.reject(handleApiError(axiosError));
        }
        return Promise.reject(handleApiError(error));
      }
    );
  }

  async get<T = unknown>(endpoint: string, config?: ApiConfigOverride): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(endpoint, config);
  }

  async post<T = unknown>(endpoint: string, data?: unknown, config?: ApiConfigOverride): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(endpoint, data, config);
  }

  async put<T = unknown>(endpoint: string, data?: unknown, config?: ApiConfigOverride): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(endpoint, data, config);
  }

  async delete<T = unknown>(endpoint: string, config?: ApiConfigOverride): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(endpoint, config);
  }

  async patch<T = unknown>(endpoint: string, data?: unknown, config?: ApiConfigOverride): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(endpoint, data, config);
  }
}

const processFailedQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiClient = new ApiClient();
