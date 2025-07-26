import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCRM } from "@/hooks/useCRM";
import type { Lead, CreateLeadData, UpdateLeadData, Category } from "@/apis/types";

export const useLeads = () => {
  const { toast } = useToast();
  const { 
    leads: apiLeads, 
    isLoadingLeads, 
    leadsError,
    fetchLeads: fetchLeadsFromAPI, 
    createLead: createLeadFromAPI, 
    updateLead: updateLeadFromAPI, 
    deleteLead: deleteLeadFromAPI,
    convertLeadToOpportunity: convertLeadToOpportunityFromAPI,
    categories,
    isLoadingCategories,
    categoriesError,
    fetchCategories: fetchCategoriesFromAPI,
    createCategory: createCategoryFromAPI,
    updateCategory: updateCategoryFromAPI,
    deleteCategory: deleteCategoryFromAPI,
    stages,
    isLoadingStages,
    stagesError,
    fetchStages: fetchStagesFromAPI,
    accounts,
    isLoadingAccounts,
    accountsError,
    fetchAccounts: fetchAccountsFromAPI,
    contacts,
    isLoadingContacts,
    contactsError,
    fetchContacts: fetchContactsFromAPI
  } = useCRM();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formLoading, setFormLoading] = useState(false);
  const [sortKey, setSortKey] = useState<string>("created_at"); // default to created_at if available
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<CreateLeadData>({
    name: "",
    email: "",
    phone: "",
    source: "",
    status: "new",
    company: "",
    title: "",
    category_id: ""
  });

  // Fetch leads when status filter changes
  useEffect(() => {
    const params: any = {};
    if (statusFilter !== "all") params.status = statusFilter;
    if (categoryFilter !== "all") params.category_id = categoryFilter;
    fetchLeadsFromAPI(params);
  }, [statusFilter, categoryFilter, fetchLeadsFromAPI]);

  // Fetch stages, accounts, and contacts on mount
  useEffect(() => {
    fetchStagesFromAPI();
    fetchAccountsFromAPI();
    fetchContactsFromAPI();
  }, [fetchStagesFromAPI, fetchAccountsFromAPI, fetchContactsFromAPI]);

  // Show error toast if there's an API error
  useEffect(() => {
    if (leadsError) {
      toast({
        title: "Error",
        description: leadsError,
        variant: "destructive",
      });
    }
  }, [leadsError, toast]);

  useEffect(() => {
    if (categoriesError) {
      toast({
        title: "Error",
        description: categoriesError,
        variant: "destructive",
      });
    }
  }, [categoriesError, toast]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await createLeadFromAPI(formData);
      await fetchLeadsFromAPI();
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
      console.error("Error creating lead:", error);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditLead = async (leadId: string, updateData: UpdateLeadData) => {
    try {
      setFormLoading(true);
      await updateLeadFromAPI(leadId, updateData);
      await fetchLeadsFromAPI();
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
      console.error("Error updating lead:", error);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLeadFromAPI(leadId);
      await fetchLeadsFromAPI();
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
      console.error("Error deleting lead:", error);
      return false;
    }
  };

  const handleConvertLead = async (leadId: string, opportunityData: {
    name: string;
    amount: number;
    account_id: string;
    contact_id: string;
    stage_id: string;
    expected_close: string;
  }) => {
    try {
      setFormLoading(true);
      console.log('Converting lead with data:', { leadId, opportunityData });
      const result = await convertLeadToOpportunityFromAPI(leadId, opportunityData);
      await fetchLeadsFromAPI();
      toast({
        title: "Success",
        description: "Opportunity created successfully from lead",
      });
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to convert lead to opportunity";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error converting lead:", error);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      source: "",
      status: "new",
      company: "",
      title: "",
      category_id: ""
    });
  };

  // Filter leads based on search term
  const filteredLeads = apiLeads.filter(lead =>
    (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.phone && lead.phone.includes(searchTerm)) ||
    (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.title && lead.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sorting logic
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aValue = a[sortKey] ?? "";
    let bValue = b[sortKey] ?? "";
    // If sorting by name/email/company/title, compare as strings
    if (["name", "email", "company", "title", "status"].includes(sortKey)) {
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    // If sorting by created_at or other date, compare as dates
    if (sortKey === "created_at" && aValue && bValue) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      return sortDirection === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
    }
    // Default fallback
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  return {
    // State
    leads: paginatedLeads,
    allLeads: sortedLeads,
    loading: isLoadingLeads,
    formLoading,
    searchTerm,
    statusFilter,
    categoryFilter,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    formData,
    categories,
    isLoadingCategories,
    stages,
    isLoadingStages,
    accounts,
    isLoadingAccounts,
    contacts,
    isLoadingContacts,
    sortKey,
    sortDirection,
    // Actions
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setCurrentPage,
    setFormData,
    setSortKey,
    setSortDirection,
    handleCreateLead,
    handleEditLead,
    handleDeleteLead,
    handleConvertLead,
    resetFormData,
    refreshLeads: () => fetchLeadsFromAPI(),
    refreshCategories: () => fetchCategoriesFromAPI(),
    createCategory: createCategoryFromAPI,
    updateCategory: updateCategoryFromAPI,
    deleteCategory: deleteCategoryFromAPI,
  };
}; 