import { useState } from "react";
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { crmSidebarSections } from "@/components/sidebars/CRMSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, Plus, Loader2 } from "lucide-react";
import { CampaignForm } from "./CampaignForm";
import { CampaignCard } from "./CampaignCard";
import { CampaignFilters } from "./CampaignFilters";
import { CampaignPagination } from "./CampaignPagination";
import { useCampaigns } from "./useCampaigns";
import type { Campaign, UpdateCampaignData } from "@/apis/types";
import { MultiStepCampaignForm } from "./MultiStepCampaignForm";

export default function CampaignsInbox() {
  const {
    campaigns,
    isLoadingCampaigns,
    campaignsError,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    launchCampaign,
    pauseCampaign,
    completeCampaign,
    cancelCampaign
  } = useCampaigns();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: Campaign['type'];
    status: Campaign['status'];
    start_date: string;
    end_date: string;
    budget: number;
    target_audience: string;
    priority: Campaign['priority'];
    tags: string[];
    assigned_to: string;
    notes: string;
    end_goals: any[];
  }>({
    name: "",
    description: "",
    type: "email",
    status: "draft",
    start_date: "",
    end_date: "",
    budget: 0,
    target_audience: "",
    priority: "medium",
    tags: [],
    assigned_to: "",
    notes: "",
    end_goals: []
  });

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await createCampaign(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        type: "email",
        status: "draft",
        start_date: "",
        end_date: "",
        budget: 0,
        target_audience: "",
        priority: "medium",
        tags: [],
        assigned_to: "",
        notes: "",
        end_goals: []
      });
      // Refresh campaigns
      fetchCampaigns({ 
        status: statusFilter, 
        priority: priorityFilter, 
        type: typeFilter,
        search: searchTerm 
      });
    } catch (error: any) {
      console.error("Error creating campaign:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    try {
      setFormLoading(true);
      const updateData: UpdateCampaignData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: formData.budget,
        target_audience: formData.target_audience,
        priority: formData.priority,
        tags: formData.tags,
        assigned_to: formData.assigned_to,
        notes: formData.notes,
        end_goals: formData.end_goals
      };
      
      await updateCampaign(editingCampaign.id, updateData);
      setIsEditDialogOpen(false);
      setEditingCampaign(null);
      // Refresh campaigns
      fetchCampaigns({ 
        status: statusFilter, 
        priority: priorityFilter, 
        type: typeFilter,
        search: searchTerm 
      });
    } catch (error: any) {
      console.error("Error updating campaign:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await deleteCampaign(campaignId);
      // Refresh campaigns
      fetchCampaigns({ 
        status: statusFilter, 
        priority: priorityFilter, 
        type: typeFilter,
        search: searchTerm 
      });
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
    }
  };

  const handleLaunchCampaign = async (campaignId: string) => {
    try {
      await launchCampaign(campaignId);
      // Refresh campaigns
      fetchCampaigns({ 
        status: statusFilter, 
        priority: priorityFilter, 
        type: typeFilter,
        search: searchTerm 
      });
    } catch (error: any) {
      console.error("Error launching campaign:", error);
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await pauseCampaign(campaignId);
      // Refresh campaigns
      fetchCampaigns({ 
        status: statusFilter, 
        priority: priorityFilter, 
        type: typeFilter,
        search: searchTerm 
      });
    } catch (error: any) {
      console.error("Error pausing campaign:", error);
    }
  };

  const handleCompleteCampaign = async (campaignId: string) => {
    try {
      await completeCampaign(campaignId);
      // Refresh campaigns
      fetchCampaigns({ 
        status: statusFilter, 
        priority: priorityFilter, 
        type: typeFilter,
        search: searchTerm 
      });
    } catch (error: any) {
      console.error("Error completing campaign:", error);
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    try {
      await cancelCampaign(campaignId);
      // Refresh campaigns
      fetchCampaigns({ 
        status: statusFilter, 
        priority: priorityFilter, 
        type: typeFilter,
        search: searchTerm 
      });
    } catch (error: any) {
      console.error("Error cancelling campaign:", error);
    }
  };

  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      type: campaign.type,
      status: campaign.status,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      budget: campaign.budget,
      target_audience: campaign.target_audience || "",
      priority: campaign.priority || "medium",
      tags: campaign.tags || [],
      assigned_to: campaign.assigned_to || "",
      notes: campaign.notes || "",
      end_goals: campaign.end_goals || []
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateDialogOpen = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (open) {
      setFormData({
        name: "",
        description: "",
        type: "email",
        status: "draft",
        start_date: "",
        end_date: "",
        budget: 0,
        target_audience: "",
        priority: "medium",
        tags: [],
        assigned_to: "",
        notes: "",
        end_goals: []
      });
    }
  };

  const handleEditDialogOpen = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingCampaign(null);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    fetchCampaigns({ 
      status: value, 
      priority: priorityFilter, 
      type: typeFilter,
      search: searchTerm 
    });
  };

  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value);
    setCurrentPage(1);
    fetchCampaigns({ 
      status: statusFilter, 
      priority: value, 
      type: typeFilter,
      search: searchTerm 
    });
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
    fetchCampaigns({ 
      status: statusFilter, 
      priority: priorityFilter, 
      type: value,
      search: searchTerm 
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchCampaigns({ 
      status: statusFilter, 
      priority: priorityFilter, 
      type: typeFilter,
      search: value 
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
    fetchCampaigns({});
  };

  if (campaignsError) {
    return (
      <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{campaignsError}</p>
            <Button onClick={() => fetchCampaigns({ 
              status: statusFilter, 
              priority: priorityFilter, 
              type: typeFilter,
              search: searchTerm 
            })}>
              Retry
            </Button>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management" >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Send className="h-8 w-8" />
              Campaigns
            </h1>
            <p className="text-gray-600 mt-2">Manage your marketing campaigns and track performance</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="m-4 sm:m-8">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto">
                <MultiStepCampaignForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  onSubmit={handleCreateCampaign} 
                  formLoading={formLoading}
                  onCancel={() => handleCreateDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <CampaignFilters 
          searchTerm={searchTerm}
          setSearchTerm={handleSearchChange}
          statusFilter={statusFilter}
          setStatusFilter={handleStatusFilterChange}
          priorityFilter={priorityFilter}
          setPriorityFilter={handlePriorityFilterChange}
          typeFilter={typeFilter}
          setTypeFilter={handleTypeFilterChange}
          onClearFilters={handleClearFilters}
        />

        {isLoadingCampaigns ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading campaigns...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Send className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-600 text-center">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first campaign."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                onEdit={openEditDialog}
                onDelete={handleDeleteCampaign}
                onLaunch={handleLaunchCampaign}
                onPause={handlePauseCampaign}
                onComplete={handleCompleteCampaign}
                onCancel={handleCancelCampaign}
              />
            ))}
          </div>
        )}

        <CampaignPagination 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
        />

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpen}>
          <DialogContent className="m-4 sm:m-8">
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              <MultiStepCampaignForm 
                formData={formData} 
                setFormData={setFormData} 
                onSubmit={handleEditCampaign} 
                isEdit={true} 
                formLoading={formLoading} 
                onCancel={() => handleEditDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 