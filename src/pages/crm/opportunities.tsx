import { useState, useEffect } from "react";
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { crmSidebarSections } from "@/components/sidebars/CRMSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/apis";
import type { Opportunity, CreateOpportunityData, UpdateOpportunityData, Account, Contact, Stage } from "@/apis/types";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar,
  User,
  Building,
  TrendingUp,
  Clock,
  Edit,
  Trash2,
  Loader2,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

export default function Opportunities() {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  // Form state
  const [formData, setFormData] = useState<CreateOpportunityData>({
    account_id: "",
    contact_id: "",
    name: "",
    amount: 0,
    stage_id: "",
    owner_id: "",
    status: "open",
    expected_close: ""
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchOpportunities();
    fetchAccounts();
    fetchContacts();
    fetchStages();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = stageFilter !== "all" ? { stage_id: stageFilter } : {};
      const opportunitiesData = await api.crm.getOpportunities(params);
      setOpportunities(opportunitiesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch opportunities",
        variant: "destructive",
      });
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const accountsData = await api.crm.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchContacts = async () => {
    try {
      const contactsData = await api.crm.getContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchStages = async () => {
    try {
      const stagesData = await api.crm.getStages();
      setStages(stagesData);
    } catch (error) {
      console.error("Error fetching stages:", error);
    }
  };

  // Refresh opportunities when stage filter changes
  useEffect(() => {
    fetchOpportunities();
  }, [stageFilter]);

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const newOpportunity = await api.crm.createOpportunity(formData);
      setOpportunities(prev => [newOpportunity, ...prev]);
      setIsCreateDialogOpen(false);
      setFormData({
        account_id: "",
        contact_id: "",
        name: "",
        amount: 0,
        stage_id: "",
        owner_id: "",
        status: "open",
        expected_close: ""
      });
      toast({
        title: "Success",
        description: "Opportunity created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create opportunity",
        variant: "destructive",
      });
      console.error("Error creating opportunity:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpportunity) return;

    try {
      setFormLoading(true);
      const updateData: UpdateOpportunityData = {
        account_id: formData.account_id,
        contact_id: formData.contact_id,
        name: formData.name,
        amount: formData.amount,
        stage_id: formData.stage_id,
        owner_id: formData.owner_id,
        status: formData.status as Opportunity['status'],
        expected_close: formData.expected_close
      };
      
      const updatedOpportunity = await api.crm.updateOpportunity(editingOpportunity.id, updateData);
      setOpportunities(prev => prev.map(opportunity => 
        opportunity.id === editingOpportunity.id ? updatedOpportunity : opportunity
      ));
      setIsEditDialogOpen(false);
      setEditingOpportunity(null);
      toast({
        title: "Success",
        description: "Opportunity updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update opportunity",
        variant: "destructive",
      });
      console.error("Error updating opportunity:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    try {
      await api.crm.deleteOpportunity(opportunityId);
      setOpportunities(prev => prev.filter(opportunity => opportunity.id !== opportunityId));
      toast({
        title: "Success",
        description: "Opportunity deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete opportunity",
        variant: "destructive",
      });
      console.error("Error deleting opportunity:", error);
    }
  };

  const handleMoveStage = async (opportunityId: string, stageId: string) => {
    try {
      const updatedOpportunity = await api.crm.moveOpportunityToStage(opportunityId, { stage_id: stageId });
      setOpportunities(prev => prev.map(opportunity => 
        opportunity.id === opportunityId ? updatedOpportunity : opportunity
      ));
      toast({
        title: "Success",
        description: "Opportunity moved to new stage",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move opportunity",
        variant: "destructive",
      });
      console.error("Error moving opportunity:", error);
    }
  };

  const openEditDialog = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      account_id: opportunity.account_id,
      contact_id: opportunity.contact_id,
      name: opportunity.name,
      amount: opportunity.amount,
      stage_id: opportunity.stage_id,
      owner_id: opportunity.owner_id,
      status: opportunity.status,
      expected_close: opportunity.expected_close
    });
    setIsEditDialogOpen(true);
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

  // Filter opportunities based on search term
  const filteredOpportunities = opportunities.filter(opportunity =>
    opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAccountName(opportunity.account_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management" user={user}>
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
              <OpportunityForm onSubmit={handleCreateOpportunity} />
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading opportunities...</span>
          </div>
        ) : filteredOpportunities.length === 0 ? (
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
            {filteredOpportunities.map((opportunity) => (
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Opportunity</DialogTitle>
            </DialogHeader>
            <OpportunityForm onSubmit={handleEditOpportunity} isEdit={true} />
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 