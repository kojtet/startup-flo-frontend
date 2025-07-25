import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/hooks/useFinance";
import type { FinancialAccount, CreateFinancialAccountData, UpdateFinancialAccountData } from "@/apis/types";

const ITEMS_PER_PAGE = 10;

export function useAccounts() {
  const { toast } = useToast();
  const { 
    accounts: apiAccounts, 
    isLoadingAccounts, 
    accountsError,
    fetchAccounts: fetchAccountsFromAPI, 
    createAccount: createAccountFromAPI, 
    updateAccount: updateAccountFromAPI, 
    deleteAccount: deleteAccountFromAPI
  } = useFinance();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formLoading, setFormLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState<CreateFinancialAccountData>({
    name: '',
    type: 'bank',
    currency: 'USD',
    is_primary: false,
    balance: 0,
    description: ''
  });

  // Fetch accounts when type filter changes
  useEffect(() => {
    const params: any = {};
    if (typeFilter !== "all") params.type = typeFilter;
    fetchAccountsFromAPI(params);
  }, [typeFilter, fetchAccountsFromAPI]);

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

  // Filter and paginate accounts
  const filteredAccounts = apiAccounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredAccounts.length);
  const accounts = filteredAccounts.slice(startIndex, endIndex);

  // CRUD operations
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await createAccountFromAPI(formData);
      await fetchAccountsFromAPI();
      toast({
        title: "Success",
        description: "Account created successfully"
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive"
      });
      console.error("Error creating account:", error);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAccount = async (id: string, data: UpdateFinancialAccountData) => {
    try {
      setFormLoading(true);
      await updateAccountFromAPI(id, data);
      await fetchAccountsFromAPI();
      toast({
        title: "Success",
        description: "Account updated successfully"
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive"
      });
      console.error("Error updating account:", error);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await deleteAccountFromAPI(id);
      await fetchAccountsFromAPI();
      toast({
        title: "Success",
        description: "Account deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      });
      console.error("Error deleting account:", error);
    }
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      type: 'bank',
      currency: 'USD',
      is_primary: false,
      balance: 0,
      description: ''
    });
  };

  // Calculate summary statistics
  const totalBalance = apiAccounts.reduce((sum, account) => sum + account.balance, 0);
  const primaryAccount = apiAccounts.find(account => account.is_primary);
  const bankAccountsCount = apiAccounts.filter(account => account.type === 'bank').length;

  return {
    accounts,
    allAccounts: apiAccounts,
    loading: isLoadingAccounts,
    formLoading,
    searchTerm,
    typeFilter,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    formData,
    totalBalance,
    primaryAccount,
    bankAccountsCount,
    setSearchTerm,
    setTypeFilter,
    setCurrentPage,
    setFormData,
    handleCreateAccount,
    handleEditAccount,
    handleDeleteAccount,
    resetFormData,
  };
} 