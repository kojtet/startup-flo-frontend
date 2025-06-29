import { api } from "."; // Assuming this is how you get the api client instance
import type { AxiosError } from "axios"; // Keep if used, remove if not

export const auth = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/login', { username, password });
      return response.data;
    } catch (error: AxiosError) {
      throw error;
    }
  },
  logout: async () => {
    try {
      const response = await api.post('/logout');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError; // If AxiosError is used, keep the import
      // Handle or rethrow axiosError
      throw axiosError; // Example: rethrow
    }
  },
  register: async (username: string, password: string) => {
    try {
      const response = await api.post('/register', { username, password });
      return response.data;
    } catch (error: AxiosError) {
      throw error;
    }
  },
};
