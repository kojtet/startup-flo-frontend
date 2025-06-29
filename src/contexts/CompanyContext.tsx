import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/apis";
import { useAuth } from "./AuthContext";
import type {
  Company,
  CompanyMember,
  // CreateCompanyMemberData, // Unused
  UpdateCompanyData,
  // UpdateCompanyMemberRoleData, // Unused
  // Department, // Unused
  // CreateDepartmentData, // Unused
  // UpdateDepartmentData, // Unused
  // PaginatedResponse, // Unused
  // User, // Unused
  PaginationParams, // Added to satisfy fetchCompanyMembers
} from "@/apis/types";
import { ApiError } from "@/apis/core/errors";

interface CompanyContextType {
  company: Company | null;
  companyMembers: CompanyMember[];
  isLoadingCompany: boolean;
  isLoadingMembers: boolean;
  companyError: string | null;
  membersError: string | null;
  membersPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  fetchCompany: (companyId: string) => Promise<void>;
  fetchCompanyMembers: (companyId: string, params?: PaginationParams) => Promise<void>;
  updateCompany: (companyId: string, companyData: UpdateCompanyData) => Promise<Company>;
  clearCompanyCache: () => void;
  refreshCompany: (companyId: string) => Promise<void>;
  refreshMembers: (companyId: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [membersPagination, setMembersPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  const { isAuthenticated } = useAuth();

  const fetchCompany = useCallback(async (companyId: string) => {
    setIsLoadingCompany(true);
    setCompanyError(null);
    try {
      const data = await api.company.getCompanyDetails(companyId);
      setCompany(data);
      localStorage.setItem(`company_${companyId}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err) {
      console.error("Failed to fetch company details:", err);
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : "Failed to load company details. Please try again.";
      setCompanyError(errorMessage);
    } finally {
      setIsLoadingCompany(false);
    }
  }, []);

  const fetchCompanyMembers = useCallback(async (companyId: string, params?: PaginationParams) => {
    setIsLoadingMembers(true);
    setMembersError(null);
    try {
      const data = await api.company.getCompanyMembers(companyId, params);
      setCompanyMembers(data.data);
      setMembersPagination({
        page: data.meta.currentPage,
        limit: data.meta.perPage,
        total: data.meta.totalItems,
        pages: data.meta.totalPages,
      });
      localStorage.setItem(`company_members_${companyId}_${JSON.stringify(params)}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err) {
      console.error("Failed to fetch company members:", err);
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : "Failed to load company members. Please try again.";
      setMembersError(errorMessage);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  const updateCompany = useCallback(async (companyId: string, companyData: UpdateCompanyData): Promise<Company> => {
    setIsLoadingCompany(true);
    setCompanyError(null);
    try {
      const updatedCompany = await api.company.updateCompanyDetails(companyId, companyData);
      setCompany(updatedCompany);
      localStorage.setItem(`company_${companyId}`, JSON.stringify({ data: updatedCompany, timestamp: Date.now() }));
      return updatedCompany;
    } catch (err) {
      console.error("Failed to update company:", err);
      throw err;
    } finally {
      setIsLoadingCompany(false);
    }
  }, []);

  const clearCompanyCache = useCallback(() => {
    setCompany(null);
    setCompanyMembers([]);
    setMembersPagination(null);
    console.log("Company cache cleared");
  }, []);

  const refreshCompany = useCallback(async (companyId: string) => {
    await fetchCompany(companyId);
  }, [fetchCompany]);

  const refreshMembers = useCallback(async (companyId: string) => {
    await fetchCompanyMembers(companyId);
  }, [fetchCompanyMembers]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearCompanyCache();
    }
  }, [isAuthenticated, clearCompanyCache]);

  const value: CompanyContextType = {
    company,
    companyMembers,
    isLoadingCompany,
    isLoadingMembers,
    companyError,
    membersError,
    membersPagination,
    fetchCompany,
    fetchCompanyMembers,
    updateCompany,
    clearCompanyCache,
    refreshCompany,
    refreshMembers,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};

export default CompanyContext;
