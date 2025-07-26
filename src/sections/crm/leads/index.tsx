import { useState } from "react";
import { useRouter } from "next/router";
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { crmSidebarSections } from "@/components/sidebars/CRMSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Inbox, Plus, Loader2 } from "lucide-react";
import { LeadForm } from "./LeadForm";
import { LeadCard } from "./LeadCard";
import { LeadFilters } from "./LeadFilters";
import { LeadPagination } from "./LeadPagination";
import { ConvertLeadForm } from "./ConvertLeadForm";
import { useLeads } from "./useLeads";
import type { Lead, UpdateLeadData } from "@/apis/types";

export default function LeadsInbox() {
  const router = useRouter();
  const {
    leads,
    allLeads,
    loading,
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
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setCurrentPage,
    setFormData,
    handleCreateLead,
    handleEditLead,
    handleDeleteLead,
    handleConvertLead,
    resetFormData,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
  } = useLeads();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  const openEditDialog = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || "",
      source: lead.source || "",
      status: lead.status,
      company: lead.company || "",
      title: lead.title || "",
      category_id: lead.category_id || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateDialogOpen = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (open) {
      resetFormData();
    }
  };

  const handleEditDialogOpen = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingLead(null);
      resetFormData();
    }
  };

  const openConvertDialog = (lead: Lead) => {
    setConvertingLead(lead);
    setIsConvertDialogOpen(true);
  };

  const handleConvertDialogOpen = (open: boolean) => {
    setIsConvertDialogOpen(open);
    if (!open) {
      setConvertingLead(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    const success = await handleCreateLead(e);
    if (success) {
      handleCreateDialogOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    const updateData: UpdateLeadData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      source: formData.source,
      status: formData.status as Lead['status'],
      company: formData.company,
      title: formData.title,
         category_id: formData.category_id
    };
    
    const success = await handleEditLead(editingLead.id, updateData);
    if (success) {
      handleEditDialogOpen(false);
    }
  };

  const handleConvertSubmit = async (opportunityData: {
    name: string;
    amount: number;
    account_id: string;
    contact_id: string;
    stage_id: string;
    expected_close: string;
  }) => {
    if (!convertingLead) return;

    const success = await handleConvertLead(convertingLead.id, opportunityData);
    if (success) {
      handleConvertDialogOpen(false);
      // Redirect to opportunities page after successful conversion
      router.push('/crm/opportunities');
    }
  };

  return (
    <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management" >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Inbox className="h-8 w-8" />
              Leads Inbox
            </h1>
            <p className="text-gray-600 mt-2">Manage and track your incoming leads</p>
          </div>
          
          <div>
            <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Lead</DialogTitle>
                </DialogHeader>
                <LeadForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  onSubmit={handleCreateSubmit} 
                  formLoading={formLoading}
                  onCancel={() => handleCreateDialogOpen(false)}
                  categories={categories}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <LeadFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          sortKey={sortKey}
          setSortKey={setSortKey}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Inbox className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600 text-center">
                {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first lead."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {leads.map((lead) => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                onEdit={openEditDialog}
                onDelete={handleDeleteLead}
                onConvert={openConvertDialog}
              />
            ))}
          </div>
        )}

        <LeadPagination 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={allLeads.length}
        />

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <LeadForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleEditSubmit} 
              isEdit={true} 
              formLoading={formLoading} 
              onCancel={() => handleEditDialogOpen(false)}
              categories={categories}
            />
          </DialogContent>
        </Dialog>

        {/* Convert Dialog */}
        <Dialog open={isConvertDialogOpen} onOpenChange={handleConvertDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert Lead to Opportunity</DialogTitle>
            </DialogHeader>
            {convertingLead && (
              <ConvertLeadForm 
                onSubmit={handleConvertSubmit}
                onCancel={() => handleConvertDialogOpen(false)}
                loading={formLoading}
                accounts={accounts}
                contacts={contacts}
                stages={stages}
                leadName={convertingLead.name}
                leadCompany={convertingLead.company}
                leadEmail={convertingLead.email}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 