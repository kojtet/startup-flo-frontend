import { useState } from "react";
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { crmSidebarSections } from "@/components/sidebars/CRMSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useOpportunities } from "@/sections/crm/opportunities/useOpportunities";
import { OpportunityPagination } from "@/sections/crm/opportunities/OpportunityPagination";
import type { Opportunity, UpdateOpportunityData } from "@/apis/types";
import { 
  Briefcase, 
  Plus, 
  Search, 
  DollarSign, 
  Calendar,
  User,
  Building,
  TrendingUp,
  Clock,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

export default function Opportunities() {
  const {
    opportunities,
    allOpportunities,
    loading,
    formLoading,
    searchTerm,
    stageFilter,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    formData,
    accounts,
    contacts,
    stages,
    setSearchTerm,
    setStageFilter,
    setCurrentPage,
    setFormData,
    handleCreateOpportunity,
    handleEditOpportunity,
    handleDeleteOpportunity,
    handleMoveStage,
    resetFormData,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
  } = useOpportunities();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  const openEditDialog = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      account_id: opportunity.account_id,
      contact_id: opportunity.contact_id,
      name: opportunity.name,
      description: opportunity.description || "",
      amount: opportunity.amount,
      stage_id: opportunity.stage_id,
      owner_id: opportunity.owner_id,
      status: opportunity.status,
      expected_close: opportunity.expected_close,
      probability: opportunity.probability
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
      setEditingOpportunity(null);
      resetFormData();
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    const success = await handleCreateOpportunity(e);
    if (success) {
      handleCreateDialogOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpportunity) return;

    const updateData: UpdateOpportunityData = {
      account_id: formData.account_id,
      contact_id: formData.contact_id,
      name: formData.name,
      description: formData.description,
      amount: formData.amount,
      stage_id: formData.stage_id,
      owner_id: formData.owner_id,
      status: formData.status,
      expected_close: formData.expected_close,
      probability: formData.probability
    };
    
    const success = await handleEditOpportunity(editingOpportunity.id, updateData);
    if (success) {
      handleEditDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800";
      case "closed_won": return "bg-green-100 text-green-800";
      case "closed_lost": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStageName = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.name : "Unknown";
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : "Unknown Account";
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : "Unknown Contact";
  };

  const OpportunityForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Opportunity Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          placeholder="e.g., Q4 Software License Deal"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the opportunity..."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="account_id">Account *</Label>
          <Select 
            value={formData.account_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, account_id: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="contact_id">Primary Contact *</Label>
          <Select 
            value={formData.contact_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, contact_id: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map(contact => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Deal Value *</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            required
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="expected_close">Expected Close Date *</Label>
          <Input
            id="expected_close"
            type="date"
            value={formData.expected_close}
            onChange={(e) => setFormData(prev => ({ ...prev, expected_close: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stage_id">Stage *</Label>
          <Select 
            value={formData.stage_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, stage_id: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map(stage => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Opportunity['status'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="probability">Probability (%)</Label>
        <Input
          id="probability"
          type="number"
          min="0"
          max="100"
          value={formData.probability}
          onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
          placeholder="50"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              setIsEditDialogOpen(false);
            } else {
              setIsCreateDialogOpen(false);
            }
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={formLoading}>
          {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Update Opportunity" : "Create Opportunity"}
        </Button>
      </div>
    </form>
  );

  return (
    <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management" >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-8 w-8" />
              Opportunities
            </h1>
            <p className="text-gray-600 mt-2">Track and manage your sales opportunities</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Opportunity</DialogTitle>
              </DialogHeader>
              <OpportunityForm onSubmit={handleCreateSubmit} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input 
              placeholder="Search opportunities..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {stages.map(stage => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Sort Dropdown */}
          <Select value={sortKey} onValueChange={setSortKey}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Sort by Created Date</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="amount">Sort by Amount</SelectItem>
              <SelectItem value="expected_close">Sort by Close Date</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            className="w-10 flex items-center justify-center"
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            aria-label={sortDirection === "asc" ? "Sort ascending" : "Sort descending"}
          >
            {sortDirection === "asc" ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading opportunities...</span>
          </div>
        ) : opportunities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-600 text-center">
                {searchTerm || stageFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first opportunity."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{opportunity.name}</h3>
                          <p className="text-gray-600">{getAccountName(opportunity.account_id)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">{formatCurrency(opportunity.amount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{getContactName(opportunity.contact_id)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{getStageName(opportunity.stage_id)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{new Date(opportunity.expected_close).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(opportunity.status)}>
                        {opportunity.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(opportunity)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteOpportunity(opportunity.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stage Movement Controls */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule Meeting
                      </Button>
                      <Button size="sm" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        View Pipeline
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={async () => {
                          const currentStageIndex = stages.findIndex(s => s.id === opportunity.stage_id);
                          if (currentStageIndex > 0) {
                            await handleMoveStage(opportunity.id, stages[currentStageIndex - 1].id);
                          }
                        }}
                        disabled={stages.findIndex(s => s.id === opportunity.stage_id) === 0}
                      >
                        <ChevronLeft className="h-3 w-3 mr-1" />
                        Previous
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={async () => {
                          const currentStageIndex = stages.findIndex(s => s.id === opportunity.stage_id);
                          if (currentStageIndex < stages.length - 1) {
                            await handleMoveStage(opportunity.id, stages[currentStageIndex + 1].id);
                          }
                        }}
                        disabled={stages.findIndex(s => s.id === opportunity.stage_id) === stages.length - 1}
                      >
                        Next
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <OpportunityPagination 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={allOpportunities.length}
        />

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Opportunity</DialogTitle>
            </DialogHeader>
            <OpportunityForm onSubmit={handleEditSubmit} isEdit={true} />
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 