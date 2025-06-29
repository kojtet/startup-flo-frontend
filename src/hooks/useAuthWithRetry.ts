import { useState, useCallback } from 'react';
import { api } from '@/apis';
import { LoginCredentials, User, AuthResponse, RegisterCredentials as SignupCredentials } from '@/apis/types';
import { ApiError } from '@/apis/core/errors';

interface AuthState {
  isLoading: boolean;
  isRetrying: boolean;
  error: string | null;
  retryCount: number;
  suggestion: string | null;
  canRetry: boolean;
}

interface AuthHookReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (credentials: SignupCredentials) => Promise<User>;
  retry: () => Promise<User | void>;
  clearError: () => void;
  reset: () => void;
}

export const useAuthWithRetry = (): AuthHookReturn => {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    isRetrying: false,
    error: null,
    retryCount: 0,
    suggestion: null,
    canRetry: false,
  });

  const [lastAttempt, setLastAttempt] = useState<{
    type: 'login' | 'signup';
    credentials: LoginCredentials | SignupCredentials;
  } | null>(null);

  // const [user, setUser] = useState<User | null>(null); // Unused state variables

  const updateState = (updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleAuthError = useCallback((error: unknown, defaultMessage?: string): string => {
    const msg = defaultMessage || "An unexpected error occurred.";
    if (error instanceof ApiError) {
      console.log('🔍 Handling auth error:', error);
      
      const isRetryable = error.retryable !== false;
      const suggestion = error.suggestion || 'Please try again.';
      
      updateState({
        isLoading: false,
        isRetrying: false,
        error: error.message || msg,
        suggestion,
        canRetry: isRetryable,
      });
      return error.message || msg;
    } else {
      console.log('🔍 Handling auth error:', error);
      
      const isRetryable = false;
      const suggestion = 'Please try again.';
      
      updateState({
        isLoading: false,
        isRetrying: false,
        error: msg,
        suggestion,
        canRetry: isRetryable,
      });
      return msg;
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    updateState({ isLoading: true, error: null, retryCount: 0 });
    setLastAttempt({ type: 'login', credentials });
    try {
      const response = await api.auth.login(credentials); // Assuming api.auth.login returns AuthResponse
      updateState({ isLoading: false, error: null, canRetry: false });
      return response.user; // Return user from AuthResponse
    } catch (error) {
      handleAuthError(error, "Login failed.");
      throw error;
    }
  }, [handleAuthError]); // Removed api.auth, authConfig dependencies

  const signup = useCallback(async (credentials: SignupCredentials): Promise<User> => {
    updateState({ isLoading: true, error: null, retryCount: 0 });
    setLastAttempt({ type: 'signup', credentials });
    try {
      const response = await api.auth.signup(credentials); // Assuming api.auth.signup returns AuthResponse
      updateState({ isLoading: false, error: null, canRetry: false });
      return response.user; // Return user from AuthResponse
    } catch (error) {
      handleAuthError(error, "Signup failed.");
      throw error;
    }
  }, [handleAuthError]); // Removed api.auth, authConfig dependencies

  // refreshUserWithRetry removed as it's not part of the hook's return type and seems out of scope for this hook's primary purpose.
  // It's better handled in AuthContext.

  const retry = useCallback(async (): Promise<User | void> => {
    if (!lastAttempt || !state.canRetry) {
      console.warn('⚠️ Cannot retry - no previous attempt or not retryable');
      return;
    }

    console.log(`🔄 Retrying ${lastAttempt.type} (attempt ${state.retryCount + 1})`);
    
    updateState({
      isRetrying: true,
      error: null,
      retryCount: state.retryCount + 1,
    });

    try {
      let response: AuthResponse;
      if (lastAttempt.type === 'login') {
        response = await api.auth.login(lastAttempt.credentials as LoginCredentials);
      } else {
        response = await api.auth.signup(lastAttempt.credentials as SignupCredentials);
      }

      console.log(`✅ ${lastAttempt.type} retry successful`);
      
      updateState({
        isLoading: false,
        isRetrying: false,
        error: null,
        suggestion: null,
        canRetry: false,
      });
      
      return response.user; // Return user from AuthResponse
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error(`❌ ${lastAttempt.type} retry failed:`, error);
      handleAuthError(error);
      throw error;
    }
  }, [lastAttempt, state.canRetry, state.retryCount, handleAuthError]);

  const clearError = useCallback(() => {
    updateState({
      error: null,
      suggestion: null,
      canRetry: false,
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isRetrying: false,
      error: null,
      retryCount: 0,
      suggestion: null,
      canRetry: false,
    });
    setLastAttempt(null);
  }, []);

  return {
    ...state,
    login,
    signup,
    retry,
    clearError,
    reset,
  };
};

export default useAuthWithRetry; 
