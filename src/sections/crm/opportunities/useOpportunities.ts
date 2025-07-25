import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCRM } from "@/hooks/useCRM";
import type { Opportunity, CreateOpportunityData, UpdateOpportunityData } from "@/apis/types";

export const useOpportunities = () => {
  const { toast } = useToast();
  const { 
    opportunities: apiOpportunities, 
    isLoadingOpportunities, 
    opportunitiesError,
    accounts: apiAccounts,
    contacts: apiContacts,
    stages: apiStages,
    fetchOpportunities: fetchOpportunitiesFromAPI, 
    createOpportunity: createOpportunityFromAPI, 
    updateOpportunity: updateOpportunityFromAPI, 
    deleteOpportunity: deleteOpportunityFromAPI,
    moveOpportunityToStage: moveOpportunityToStageFromAPI
  } = useCRM();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [formLoading, setFormLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<CreateOpportunityData>({
    account_id: "",
    contact_id: "",
    name: "",
    description: "",
    amount: 0,
    stage_id: "",
    owner_id: "",
    status: "open",
    expected_close: "",
    probability: 0
  });

  // Show error toast if there's an API error
  useEffect(() => {
    if (opportunitiesError) {
      toast({
        title: "Error",
        description: opportunitiesError,
        variant: "destructive",
      });
    }
  }, [opportunitiesError, toast]);

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const opportunityData = {
        ...formData,
        description: formData.description || undefined,
        owner_id: formData.owner_id || undefined,
        probability: formData.probability || 0
      };
      await createOpportunityFromAPI(opportunityData);
      await fetchOpportunitiesFromAPI();
      toast({
        title: "Success",
        description: "Opportunity created successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create opportunity",
        variant: "destructive",
      });
      console.error("Error creating opportunity:", error);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditOpportunity = async (opportunityId: string, updateData: UpdateOpportunityData) => {
    try {
      setFormLoading(true);
      await updateOpportunityFromAPI(opportunityId, updateData);
      await fetchOpportunitiesFromAPI();
      toast({
        title: "Success",
        description: "Opportunity updated successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update opportunity",
        variant: "destructive",
      });
      console.error("Error updating opportunity:", error);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    try {
      await deleteOpportunityFromAPI(opportunityId);
      await fetchOpportunitiesFromAPI();
      toast({
        title: "Success",
        description: "Opportunity deleted successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete opportunity",
        variant: "destructive",
      });
      console.error("Error deleting opportunity:", error);
      return false;
    }
  };

  const handleMoveStage = async (opportunityId: string, stageId: string) => {
    try {
      await moveOpportunityToStageFromAPI(opportunityId, { stage_id: stageId });
      await fetchOpportunitiesFromAPI();
      toast({
        title: "Success",
        description: "Opportunity moved to new stage",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move opportunity",
        variant: "destructive",
      });
      console.error("Error moving opportunity:", error);
      return false;
    }
  };

  const resetFormData = () => {
    setFormData({
      account_id: "",
      contact_id: "",
      name: "",
      description: "",
      amount: 0,
      stage_id: "",
      owner_id: "",
      status: "open",
      expected_close: "",
      probability: 0
    });
  };

  // Filter opportunities based on search term and stage filter
  const filteredOpportunities = apiOpportunities.filter(opportunity => {
    // Search filter
    const matchesSearch = 
      (opportunity.name && opportunity.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opportunity.account?.name && opportunity.account.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opportunity.contact && `${opportunity.contact.first_name} ${opportunity.contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));

    // Stage filter
    const matchesStage = 
      stageFilter === "all" || 
      (stageFilter !== "all" && opportunity.stage_id === stageFilter);

    return matchesSearch && matchesStage;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOpportunities = filteredOpportunities.slice(startIndex, endIndex);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter]);

  return {
    // State
    opportunities: paginatedOpportunities,
    allOpportunities: filteredOpportunities,
    loading: isLoadingOpportunities,
    formLoading,
    searchTerm,
    stageFilter,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    formData,
    accounts: apiAccounts,
    contacts: apiContacts,
    stages: apiStages,
    
    // Actions
    setSearchTerm,
    setStageFilter,
    setCurrentPage,
    setFormData,
    handleCreateOpportunity,
    handleEditOpportunity,
    handleDeleteOpportunity,
    handleMoveStage,
    resetFormData,
    refreshOpportunities: () => fetchOpportunitiesFromAPI(),
  };
}; 