import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCRM } from "@/hooks/useCRM";
import type { Account, CreateAccountData, UpdateAccountData } from "@/apis/types";

export const useAccounts = () => {
  const { toast } = useToast();
  const { 
    accounts: apiAccounts, 
    isLoadingAccounts, 
    accountsError,
    fetchAccounts: fetchAccountsFromAPI, 
    createAccount: createAccountFromAPI, 
    updateAccount: updateAccountFromAPI, 
    deleteAccount: deleteAccountFromAPI
  } = useCRM();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [formLoading, setFormLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<CreateAccountData>({
    name: "",
    industry: "",
    website: "",
    notes: ""
  });

  // Show error toast if there's an API error
  useEffect(() => {
    if (accountsError) {
      toast({
        title: "Error",
        description: accountsError,
        variant: "destructive",
      });
    }
  }, [accountsError, toast]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const accountData = {
        ...formData,
        industry: formData.industry || undefined,
        website: formData.website || undefined,
        notes: formData.notes || undefined
      };
      await createAccountFromAPI(accountData);
      await fetchAccountsFromAPI();
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
      console.error("Error creating account:", error);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAccount = async (accountId: string, updateData: UpdateAccountData) => {
    try {
      setFormLoading(true);
      await updateAccountFromAPI(accountId, updateData);
      await fetchAccountsFromAPI();
      toast({
        title: "Success",
        description: "Account updated successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
      console.error("Error updating account:", error);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccountFromAPI(accountId);
      await fetchAccountsFromAPI();
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
      console.error("Error deleting account:", error);
      return false;
    }
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      industry: "",
      website: "",
      notes: ""
    });
  };

  // Filter accounts based on search term and industry filter
  const filteredAccounts = apiAccounts.filter(account => {
    // Search filter
    const matchesSearch = 
      (account.name && account.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (account.industry && account.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (account.website && account.website.toLowerCase().includes(searchTerm.toLowerCase()));

    // Industry filter
    const matchesIndustry = 
      industryFilter === "all" || 
      (industryFilter === "none" && !account.industry) ||
      (industryFilter !== "all" && industryFilter !== "none" && account.industry === industryFilter);

    return matchesSearch && matchesIndustry;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, industryFilter]);

  return {
    // State
    accounts: paginatedAccounts,
    allAccounts: filteredAccounts,
    loading: isLoadingAccounts,
    formLoading,
    searchTerm,
    industryFilter,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    formData,
    
    // Actions
    setSearchTerm,
    setIndustryFilter,
    setCurrentPage,
    setFormData,
    handleCreateAccount,
    handleEditAccount,
    handleDeleteAccount,
    resetFormData,
    refreshAccounts: () => fetchAccountsFromAPI(),
  };
}; 