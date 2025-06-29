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
import type { Campaign, CreateCampaignData, UpdateCampaignData } from "@/apis/types";
import { 
  Send, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Users, 
  Calendar,
  TrendingUp,
  Eye,
  MousePointer,
  Target,
  Edit,
  Trash2,
  Loader2,
  Play,
  Pause,
  BarChart3
} from "lucide-react";

export default function Campaigns() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  // Form state
  const [formData, setFormData] = useState<CreateCampaignData>({
    name: "",
    description: "",
    type: "email",
    status: "draft",
    start_date: "",
    end_date: "",
    budget: 0,
    target_audience: ""
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const campaignsData = await api.crm.getCampaigns(params);
      setCampaigns(campaignsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh campaigns when status filter changes
  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const newCampaign = await api.crm.createCampaign(formData);
      setCampaigns(prev => [newCampaign, ...prev]);
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        type: "email",
        status: "draft",
        start_date: "",
        end_date: "",
        budget: 0,
        target_audience: ""
      });
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
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
        target_audience: formData.target_audience
      };
      
      const updatedCampaign = await api.crm.updateCampaign(editingCampaign.id, updateData);
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === editingCampaign.id ? updatedCampaign : campaign
      ));
      setIsEditDialogOpen(false);
      setEditingCampaign(null);
      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      });
      console.error("Error updating campaign:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await api.crm.deleteCampaign(campaignId);
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
      console.error("Error deleting campaign:", error);
    }
  };

  const handleLaunchCampaign = async (campaignId: string) => {
    try {
      const updatedCampaign = await api.crm.launchCampaign(campaignId);
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? updatedCampaign : campaign
      ));
      toast({
        title: "Success",
        description: "Campaign launched successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to launch campaign",
        variant: "destructive",
      });
      console.error("Error launching campaign:", error);
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const updatedCampaign = await api.crm.pauseCampaign(campaignId);
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? updatedCampaign : campaign
      ));
      toast({
        title: "Success",
        description: "Campaign paused successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause campaign",
        variant: "destructive",
      });
      console.error("Error pausing campaign:", error);
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
      target_audience: campaign.target_audience || ""
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "active": return "bg-green-100 text-green-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "social": return <Users className="h-4 w-4" />;
      case "display": return <Eye className="h-4 w-4" />;
      case "search": return <Target className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateProgress = (campaign: Campaign) => {
    if (!campaign.start_date || !campaign.end_date) return 0;
    
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / total) * 100);
  };

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const CampaignForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Campaign Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          placeholder="e.g., Q4 Product Launch Campaign"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Campaign description and objectives..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Campaign Type *</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Campaign['type'] }))}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email Marketing</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="display">Display Advertising</SelectItem>
              <SelectItem value="search">Search Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Campaign['status'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget">Budget *</Label>
          <Input
            id="budget"
            type="number"
            min="0"
            step="0.01"
            value={formData.budget}
            onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
            required
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="target_audience">Target Audience</Label>
          <Input
            id="target_audience"
            value={formData.target_audience}
            onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
            placeholder="e.g., Enterprise customers, SMBs, etc."
          />
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
          {isEdit ? "Update Campaign" : "Create Campaign"}
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
              <Send className="h-8 w-8" />
              Campaigns
            </h1>
            <p className="text-gray-600 mt-2">Manage your marketing campaigns and track performance</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <CampaignForm onSubmit={handleCreateCampaign} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input 
              placeholder="Search campaigns..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading campaigns...</span>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Send className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-600 text-center">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first campaign."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getTypeIcon(campaign.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          <p className="text-gray-600 capitalize">{campaign.type} Campaign</p>
                        </div>
                      </div>
                      
                      {campaign.description && (
                        <p className="text-gray-700 mb-4">{campaign.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatCurrency(campaign.budget)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{new Date(campaign.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{new Date(campaign.end_date).toLocaleDateString()}</span>
                        </div>
                        {campaign.target_audience && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{campaign.target_audience}</span>
                          </div>
                        )}
                      </div>

                      {/* Campaign Progress */}
                      {campaign.status === "active" && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Campaign Progress</span>
                            <span className="font-medium">{calculateProgress(campaign)}%</span>
                          </div>
                          <Progress value={calculateProgress(campaign)} className="h-2" />
                        </div>
                      )}

                      {/* Campaign Metrics */}
                      {campaign.impressions !== undefined && (
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{campaign.impressions?.toLocaleString() || 0}</div>
                            <div className="text-sm text-gray-600">Impressions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{campaign.clicks?.toLocaleString() || 0}</div>
                            <div className="text-sm text-gray-600">Clicks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {campaign.clicks && campaign.impressions ? 
                                ((campaign.clicks / campaign.impressions) * 100).toFixed(2) + '%' : '0%'}
                            </div>
                            <div className="text-sm text-gray-600">CTR</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status.toUpperCase()}
                      </Badge>
                      <div className="flex gap-1">
                        {campaign.status === "draft" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleLaunchCampaign(campaign.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        {campaign.status === "active" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handlePauseCampaign(campaign.id)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(campaign)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      View Analytics
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-1" />
                      Audience
                    </Button>
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
              <DialogTitle>Edit Campaign</DialogTitle>
            </DialogHeader>
            <CampaignForm onSubmit={handleEditCampaign} isEdit={true} />
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 