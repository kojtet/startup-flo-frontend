import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useActivities } from "@/hooks/useActivities";
import type { Activity, CreateActivityData, UpdateActivityData } from "@/apis/types";
import { 
  Calendar, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Video,
  CheckCircle,
  Clock,
  User,
  Building,
  Edit,
  Trash2,
  Loader2,
  MapPin
} from "lucide-react";

export default function Activities() {
  const { toast } = useToast();
  const {
    activities,
    isLoadingActivities,
    activitiesError,
    contacts,
    opportunities,
    leads,
    accounts,
    isLoadingRelated,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    markActivityAsCompleted
  } = useActivities();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  // Activity state
  const [isCreateActivityDialogOpen, setIsCreateActivityDialogOpen] = useState(false);
  const [isEditActivityDialogOpen, setIsEditActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityFormLoading, setActivityFormLoading] = useState(false);

  // Activity form state
  const [activityFormData, setActivityFormData] = useState<CreateActivityData>({
    type: "call",
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    start_time: "",
    end_time: "",
    location: "",
    lead_id: "",
    contact_id: "",
    account_id: "",
    opportunity_id: "",
    assigned_to: ""
  });

  // Refresh activities when type filter changes
  useEffect(() => {
    const params = typeFilter !== "all" ? { type: typeFilter } : {};
    fetchActivities(params);
  }, [typeFilter, fetchActivities]);

  // Activity CRUD operations
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActivityFormLoading(true);
      
      // Clean up empty string values to null for optional fields
      const cleanData = {
        ...activityFormData,
        lead_id: activityFormData.lead_id || undefined,
        contact_id: activityFormData.contact_id || undefined,
        account_id: activityFormData.account_id || undefined,
        opportunity_id: activityFormData.opportunity_id || undefined,
        assigned_to: activityFormData.assigned_to || undefined,
        start_time: activityFormData.start_time || undefined,
        end_time: activityFormData.end_time || undefined,
        location: activityFormData.location || undefined,
        description: activityFormData.description || undefined
      };

      await createActivity(cleanData);
      setIsCreateActivityDialogOpen(false);
      setActivityFormData({
        type: "call",
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        start_time: "",
        end_time: "",
        location: "",
        lead_id: "",
        contact_id: "",
        account_id: "",
        opportunity_id: "",
        assigned_to: ""
      });
      toast({
        title: "Success",
        description: "Activity created successfully",
      });
      // Refresh activities
      fetchActivities();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
      console.error("Error creating activity:", error);
    } finally {
      setActivityFormLoading(false);
    }
  };

  const handleEditActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    try {
      setActivityFormLoading(true);
      
      // Clean up empty string values to null for optional fields
      const cleanData = {
        ...activityFormData,
        lead_id: activityFormData.lead_id || undefined,
        contact_id: activityFormData.contact_id || undefined,
        account_id: activityFormData.account_id || undefined,
        opportunity_id: activityFormData.opportunity_id || undefined,
        assigned_to: activityFormData.assigned_to || undefined,
        start_time: activityFormData.start_time || undefined,
        end_time: activityFormData.end_time || undefined,
        location: activityFormData.location || undefined,
        description: activityFormData.description || undefined
      };

      await updateActivity(editingActivity.id, cleanData);
      setIsEditActivityDialogOpen(false);
      setEditingActivity(null);
      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
      // Refresh activities
      fetchActivities();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive",
      });
      console.error("Error updating activity:", error);
    } finally {
      setActivityFormLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
      // Refresh activities
      fetchActivities();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
      console.error("Error deleting activity:", error);
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    try {
      await markActivityAsCompleted(activityId);
      toast({
        title: "Success",
        description: "Activity marked as completed",
      });
      // Refresh activities
      fetchActivities();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete activity",
        variant: "destructive",
      });
      console.error("Error completing activity:", error);
    }
  };

  const openEditActivityDialog = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityFormData({
      type: activity.type,
      title: activity.title,
      description: activity.description || "",
      priority: activity.priority,
      contact_id: activity.contact_id || "",
      opportunity_id: activity.opportunity_id || "",
      lead_id: activity.lead_id || "",
      account_id: activity.account_id || "",
      assigned_to: activity.assigned_to || "",
      due_date: activity.due_date,
      start_time: activity.start_time || "",
      end_time: activity.end_time || "",
      location: activity.location || ""
    });
    setIsEditActivityDialogOpen(true);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "meeting": return <Video className="h-4 w-4" />;
      case "task": return <CheckCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : "No Contact";
  };

  const getOpportunityName = (opportunityId: string) => {
    const opportunity = opportunities.find(o => o.id === opportunityId);
    return opportunity ? opportunity.name : "No Opportunity";
  };

  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.name : "No Lead";
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : "No Account";
  };

  // Filter activities based on search term and priority filter
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === "all" || activity.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Show loading state
  if (isLoadingActivities) {
    return (
      <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading activities...</span>
        </div>
      </ExtensibleLayout>
    );
  }

  // Show error state
  if (activitiesError) {
    return (
      <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading activities: {activitiesError}</p>
            <Button onClick={() => fetchActivities()}>Retry</Button>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  const ActivityForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Activity Type *</Label>
          <Select 
            value={activityFormData.type} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, type: value as "call" | "email" | "meeting" | "task" }))}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="task">Task</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={activityFormData.priority} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, priority: value as "low" | "medium" | "high" }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={activityFormData.title}
          onChange={(e) => setActivityFormData(prev => ({ ...prev, title: e.target.value }))}
          required
          placeholder="e.g., Follow-up call with client"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={activityFormData.description}
          onChange={(e) => setActivityFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Activity details..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="due_date">Due Date *</Label>
          <Input
            id="due_date"
            type="date"
            value={activityFormData.due_date}
            onChange={(e) => setActivityFormData(prev => ({ ...prev, due_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={activityFormData.location}
            onChange={(e) => setActivityFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Conference Room A"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_time">Start Time</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={activityFormData.start_time}
            onChange={(e) => setActivityFormData(prev => ({ ...prev, start_time: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="end_time">End Time</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={activityFormData.end_time}
            onChange={(e) => setActivityFormData(prev => ({ ...prev, end_time: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lead_id">Related Lead</Label>
          <Select 
            value={activityFormData.lead_id || "none"} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, lead_id: value === "none" ? "" : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Lead</SelectItem>
              {leads.map(lead => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="contact_id">Related Contact</Label>
          <Select 
            value={activityFormData.contact_id || "none"} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, contact_id: value === "none" ? "" : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Contact</SelectItem>
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
          <Label htmlFor="account_id">Related Account</Label>
          <Select 
            value={activityFormData.account_id || "none"} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, account_id: value === "none" ? "" : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Account</SelectItem>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="opportunity_id">Related Opportunity</Label>
          <Select 
            value={activityFormData.opportunity_id || "none"} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, opportunity_id: value === "none" ? "" : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select opportunity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Opportunity</SelectItem>
              {opportunities.map(opportunity => (
                <SelectItem key={opportunity.id} value={opportunity.id}>
                  {opportunity.name}
                </SelectItem>
              ))}
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
              setIsEditActivityDialogOpen(false);
            } else {
              setIsCreateActivityDialogOpen(false);
            }
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={activityFormLoading}>
          {activityFormLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Update Activity" : "Create Activity"}
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
              <Calendar className="h-8 w-8" />
              Activities
            </h1>
            <p className="text-gray-600 mt-2">Track and manage your customer activities</p>
          </div>
          
          <div>
            <Dialog open={isCreateActivityDialogOpen} onOpenChange={setIsCreateActivityDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Activity</DialogTitle>
                </DialogHeader>
                <ActivityForm onSubmit={handleCreateActivity} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input 
              placeholder="Search activities..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="call">Calls</SelectItem>
              <SelectItem value="email">Emails</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600 text-center">
                {searchTerm || typeFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first activity."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredActivities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{activity.title}</h3>
                          <p className="text-gray-600 capitalize">{activity.type}</p>
                        </div>
                      </div>
                      
                      {activity.description && (
                        <p className="text-gray-700 mb-4">{activity.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{new Date(activity.due_date).toLocaleDateString()}</span>
                        </div>
                        {activity.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{activity.location}</span>
                          </div>
                        )}
                        {activity.contact_id && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{getContactName(activity.contact_id)}</span>
                          </div>
                        )}
                        {activity.opportunity_id && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{getOpportunityName(activity.opportunity_id)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(activity.status || "pending")}>
                          {(activity.status || "pending").toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(activity.priority)}>
                          {activity.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        {activity.status !== "completed" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleCompleteActivity(activity.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openEditActivityDialog(activity)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Activity Dialog */}
        <Dialog open={isEditActivityDialogOpen} onOpenChange={setIsEditActivityDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Activity</DialogTitle>
            </DialogHeader>
            <ActivityForm onSubmit={handleEditActivity} isEdit={true} />
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 