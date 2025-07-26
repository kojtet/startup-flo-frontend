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
  MapPin,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { ActivityForm } from "@/sections/crm/activities/ActivityForm";

export default function Activities() {
  console.log('Activities render');
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
  const [sortKey, setSortKey] = useState<string>("due_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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

  // Dialog open/close handlers (pattern from AccountForm)
  const handleCreateDialogOpen = (open: boolean) => {
    setIsCreateActivityDialogOpen(open);
  };

  const handleEditDialogOpen = (open: boolean) => {
    setIsEditActivityDialogOpen(open);
    if (!open) {
      setEditingActivity(null);
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
    }
  };

  // Reset form data only when the create dialog is first opened
  useEffect(() => {
    if (isCreateActivityDialogOpen) {
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
    }
  }, [isCreateActivityDialogOpen]);

  // Refresh activities when type filter changes
  useEffect(() => {
    const params = typeFilter !== "all" ? { type: typeFilter } : {};
    fetchActivities(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

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
      handleCreateDialogOpen(false);
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
      handleEditDialogOpen(false);
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
    handleEditDialogOpen(true);
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

  // Sorting logic
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    let aValue = a[sortKey] ?? "";
    let bValue = b[sortKey] ?? "";
    // If sorting by title or priority, compare as strings
    if (["title", "priority"].includes(sortKey)) {
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    // If sorting by due_date or created_at, compare as dates
    if (["due_date", "created_at"].includes(sortKey) && aValue && bValue) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      return sortDirection === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
    }
    // Default fallback
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActivities = sortedActivities.slice(startIndex, endIndex);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, priorityFilter, sortKey, sortDirection]);

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
            <Dialog open={isCreateActivityDialogOpen} onOpenChange={handleCreateDialogOpen}>
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
                <ActivityForm 
                  onSubmit={handleCreateActivity} 
                  isEdit={false} 
                  activityFormData={activityFormData} 
                  setActivityFormData={setActivityFormData} 
                  activityFormLoading={activityFormLoading} 
                  setActivityFormLoading={setActivityFormLoading} 
                  leads={leads} 
                  contacts={contacts} 
                  accounts={accounts} 
                  opportunities={opportunities} 
                  handleEditDialogOpen={handleEditDialogOpen} 
                  setEditingActivity={setEditingActivity} 
                  editingActivity={editingActivity} 
                  toast={toast} 
                  fetchActivities={fetchActivities} 
                  createActivity={createActivity} 
                  updateActivity={updateActivity} 
                  deleteActivity={deleteActivity} 
                  markActivityAsCompleted={markActivityAsCompleted} 
                  openEditActivityDialog={openEditActivityDialog} 
                  getActivityIcon={getActivityIcon} 
                  getStatusColor={getStatusColor} 
                  getPriorityColor={getPriorityColor} 
                  getContactName={getContactName} 
                  getOpportunityName={getOpportunityName} 
                  getLeadName={getLeadName} 
                  getAccountName={getAccountName} 
                />
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
         {/* Sort Dropdown */}
         <Select value={sortKey} onValueChange={setSortKey}>
           <SelectTrigger className="w-40">
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="due_date">Sort by Due Date</SelectItem>
             <SelectItem value="title">Sort by Title</SelectItem>
             <SelectItem value="priority">Sort by Priority</SelectItem>
             <SelectItem value="created_at">Sort by Created Date</SelectItem>
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

        {paginatedActivities.length === 0 ? (
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
            {paginatedActivities.map((activity) => {
              // Get related data
              const contact = contacts.find(c => c.id === activity.contact_id);
              const account = accounts.find(a => a.id === activity.account_id);
              const opportunity = opportunities.find(o => o.id === activity.opportunity_id);
              // Gradient backgrounds for icon
              const typeGradient =
                activity.type === 'call' ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white' :
                activity.type === 'email' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' :
                activity.type === 'meeting' ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white' :
                activity.type === 'task' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
              // Status dot color
              const statusDotColor =
                activity.status === 'completed' ? 'bg-green-500' :
                activity.status === 'overdue' ? 'bg-red-500' :
                'bg-blue-200';
              // Avatar for contact (initials fallback, no avatar_url field in Contact type)
              const contactAvatar = contact
                ? <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">{contact.first_name?.[0]}{contact.last_name?.[0]}</div>
                : <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"><User className="w-4 h-4" /></div>;
              return (
                <Card
                  key={activity.id}
                  className="relative group transition-all border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.015] bg-white overflow-hidden duration-200"
                >
                  {/* Status dot in top-left */}
                  <div className="absolute left-4 top-4 z-20">
                    <span className={`inline-block w-3 h-3 rounded-full border-2 border-white shadow ${statusDotColor}`} />
                  </div>
                  <CardContent className="flex flex-col md:flex-row items-stretch gap-4 p-5 min-h-0">
                    {/* Left: Icon and Type */}
                    <div className="flex flex-col items-center justify-center mr-2 min-w-[48px]">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 shadow-md ${typeGradient} transition-transform group-hover:scale-110 border-2 border-white`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <span className="text-xs font-semibold capitalize text-gray-500 mt-1 tracking-wide">{activity.type}</span>
                    </div>

                    {/* Center: Main Info */}
                    <div className="flex-1 flex flex-col gap-1 justify-center min-w-0">
                      <div className="flex items-center gap-2 mb-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate leading-tight" title={activity.title}>{activity.title}</h3>
                        {activity.status === 'overdue' && (
                          <span className="ml-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold animate-pulse">Overdue</span>
                        )}
                        {account && (
                          <span className="ml-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 truncate max-w-[100px]" title={account.name}>{account.name}</span>
                        )}
                      </div>
                      {activity.description && (
                        <p className="text-gray-500 text-sm mb-0 line-clamp-2 leading-tight">{activity.description}</p>
                      )}
                      {/* Meta info pill group */}
                      <div className="flex flex-wrap gap-1 text-xs mt-1">
                        <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-0.5 font-semibold text-gray-800">
                          <Clock className="h-4 w-4 text-gray-400" aria-label="Due date" />
                          <span>{new Date(activity.due_date).toLocaleDateString()}</span>
                        </div>
                        {activity.location && (
                          <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-0.5">
                            <MapPin className="h-4 w-4 text-gray-400" aria-label="Location" />
                            <span>{activity.location}</span>
                          </div>
                        )}
                        {contact && (
                          <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-0.5">
                            {contactAvatar}
                            <div className="flex flex-col leading-tight">
                              <span className="font-bold text-xs text-gray-900">{contact.first_name} {contact.last_name}</span>
                              {(contact.email || contact.phone) && (
                                <span className="font-semibold text-xs text-gray-800">
                                  {contact.email}{contact.email && contact.phone ? ' • ' : ''}{contact.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {opportunity && (
                          <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-0.5 font-semibold text-gray-800">
                            <Building className="h-4 w-4 text-gray-400" aria-label="Opportunity" />
                            <span title={opportunity.name}>{opportunity.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Status, Priority, Actions */}
                    <div className="flex flex-col items-end justify-between min-w-[70px] gap-2">
                      <div className="flex gap-1 mb-1">
                        <Badge className={`rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm ${getStatusColor(activity.status || 'pending')}`}>{(activity.status || 'pending').toUpperCase()}</Badge>
                        <Badge className={`rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm ${getPriorityColor(activity.priority)}`}>{activity.priority.toUpperCase()}</Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        {activity.status !== "completed" && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleCompleteActivity(activity.id)}
                            className="text-green-600 hover:bg-green-50 transition-colors"
                            title="Mark as completed"
                            aria-label="Mark as completed"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => openEditActivityDialog(activity)} title="Edit" aria-label="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Edit Activity Dialog */}
        <Dialog open={isEditActivityDialogOpen} onOpenChange={handleEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Activity</DialogTitle>
            </DialogHeader>
            <ActivityForm 
              onSubmit={handleEditActivity} 
              isEdit={true} 
              activityFormData={activityFormData} 
              setActivityFormData={setActivityFormData} 
              activityFormLoading={activityFormLoading} 
              setActivityFormLoading={setActivityFormLoading} 
              leads={leads} 
              contacts={contacts} 
              accounts={accounts} 
              opportunities={opportunities} 
              handleEditDialogOpen={handleEditDialogOpen} 
              setEditingActivity={setEditingActivity} 
              editingActivity={editingActivity} 
              toast={toast} 
              fetchActivities={fetchActivities} 
              createActivity={createActivity} 
              updateActivity={updateActivity} 
              deleteActivity={deleteActivity} 
              markActivityAsCompleted={markActivityAsCompleted} 
              openEditActivityDialog={openEditActivityDialog} 
              getActivityIcon={getActivityIcon} 
              getStatusColor={getStatusColor} 
              getPriorityColor={getPriorityColor} 
              getContactName={getContactName} 
              getOpportunityName={getOpportunityName} 
              getLeadName={getLeadName} 
              getAccountName={getAccountName} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 