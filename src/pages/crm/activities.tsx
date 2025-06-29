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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/apis";
import type { Activity, Note, CreateActivityData, CreateNoteData, UpdateActivityData, UpdateNoteData, Contact, Opportunity } from "@/apis/types";
import { 
  List, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar,
  User,
  Building,
  MessageSquare,
  CheckCircle,
  Clock,
  FileText,
  Edit,
  Trash2,
  Loader2,
  Play,
  Pause,
  Video
} from "lucide-react";

export default function ActivitiesAndNotes() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("activities");
  
  // Activity state
  const [isCreateActivityDialogOpen, setIsCreateActivityDialogOpen] = useState(false);
  const [isEditActivityDialogOpen, setIsEditActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityFormLoading, setActivityFormLoading] = useState(false);
  
  // Note state
  const [isCreateNoteDialogOpen, setIsCreateNoteDialogOpen] = useState(false);
  const [isEditNoteDialogOpen, setIsEditNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteFormLoading, setNoteFormLoading] = useState(false);

  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  // Activity form state
  const [activityFormData, setActivityFormData] = useState<CreateActivityData>({
    type: "call",
    subject: "",
    description: "",
    contact_id: "",
    opportunity_id: "",
    due_date: "",
    status: "pending"
  });

  // Note form state
  const [noteFormData, setNoteFormData] = useState<CreateNoteData>({
    title: "",
    content: "",
    contact_id: "",
    opportunity_id: ""
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchActivities();
    fetchNotes();
    fetchContacts();
    fetchOpportunities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = typeFilter !== "all" ? { type: typeFilter } : {};
      const activitiesData = await api.crm.getActivities(params);
      setActivities(activitiesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const notesData = await api.crm.getNotes();
      setNotes(notesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      });
      console.error("Error fetching notes:", error);
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

  const fetchOpportunities = async () => {
    try {
      const opportunitiesData = await api.crm.getOpportunities();
      setOpportunities(opportunitiesData);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    }
  };

  // Refresh activities when type filter changes
  useEffect(() => {
    fetchActivities();
  }, [typeFilter]);

  // Activity CRUD operations
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActivityFormLoading(true);
      const newActivity = await api.crm.createActivity(activityFormData);
      setActivities(prev => [newActivity, ...prev]);
      setIsCreateActivityDialogOpen(false);
      setActivityFormData({
        type: "call",
        subject: "",
        description: "",
        contact_id: "",
        opportunity_id: "",
        due_date: "",
        status: "pending"
      });
      toast({
        title: "Success",
        description: "Activity created successfully",
      });
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
      const updateData: UpdateActivityData = {
        type: activityFormData.type,
        subject: activityFormData.subject,
        description: activityFormData.description,
        contact_id: activityFormData.contact_id || undefined,
        opportunity_id: activityFormData.opportunity_id || undefined,
        due_date: activityFormData.due_date,
        status: activityFormData.status
      };
      
      const updatedActivity = await api.crm.updateActivity(editingActivity.id, updateData);
      setActivities(prev => prev.map(activity => 
        activity.id === editingActivity.id ? updatedActivity : activity
      ));
      setIsEditActivityDialogOpen(false);
      setEditingActivity(null);
      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
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
      await api.crm.deleteActivity(activityId);
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
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
      const updatedActivity = await api.crm.completeActivity(activityId);
      setActivities(prev => prev.map(activity => 
        activity.id === activityId ? updatedActivity : activity
      ));
      toast({
        title: "Success",
        description: "Activity marked as completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete activity",
        variant: "destructive",
      });
      console.error("Error completing activity:", error);
    }
  };

  // Note CRUD operations
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setNoteFormLoading(true);
      const newNote = await api.crm.createNote(noteFormData);
      setNotes(prev => [newNote, ...prev]);
      setIsCreateNoteDialogOpen(false);
      setNoteFormData({
        title: "",
        content: "",
        contact_id: "",
        opportunity_id: ""
      });
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
      console.error("Error creating note:", error);
    } finally {
      setNoteFormLoading(false);
    }
  };

  const handleEditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    try {
      setNoteFormLoading(true);
      const updateData: UpdateNoteData = {
        title: noteFormData.title,
        content: noteFormData.content,
        contact_id: noteFormData.contact_id || undefined,
        opportunity_id: noteFormData.opportunity_id || undefined
      };
      
      const updatedNote = await api.crm.updateNote(editingNote.id, updateData);
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id ? updatedNote : note
      ));
      setIsEditNoteDialogOpen(false);
      setEditingNote(null);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
      console.error("Error updating note:", error);
    } finally {
      setNoteFormLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.crm.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
      console.error("Error deleting note:", error);
    }
  };

  const openEditActivityDialog = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityFormData({
      type: activity.type,
      subject: activity.subject,
      description: activity.description || "",
      contact_id: activity.contact_id || "",
      opportunity_id: activity.opportunity_id || "",
      due_date: activity.due_date,
      status: activity.status
    });
    setIsEditActivityDialogOpen(true);
  };

  const openEditNoteDialog = (note: Note) => {
    setEditingNote(note);
    setNoteFormData({
      title: note.title,
      content: note.content,
      contact_id: note.contact_id || "",
      opportunity_id: note.opportunity_id || ""
    });
    setIsEditNoteDialogOpen(true);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "meeting": return <Video className="h-4 w-4" />;
      case "task": return <CheckCircle className="h-4 w-4" />;
      default: return <List className="h-4 w-4" />;
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

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : "No Contact";
  };

  const getOpportunityName = (opportunityId: string) => {
    const opportunity = opportunities.find(o => o.id === opportunityId);
    return opportunity ? opportunity.name : "No Opportunity";
  };

  // Filter activities and notes based on search term
  const filteredActivities = activities.filter(activity =>
    activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ActivityForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Activity Type *</Label>
          <Select 
            value={activityFormData.type} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, type: value as Activity['type'] }))}
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
          <Label htmlFor="status">Status</Label>
          <Select 
            value={activityFormData.status} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, status: value as Activity['status'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          value={activityFormData.subject}
          onChange={(e) => setActivityFormData(prev => ({ ...prev, subject: e.target.value }))}
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
          <Label htmlFor="contact_id">Related Contact</Label>
          <Select 
            value={activityFormData.contact_id} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, contact_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Contact</SelectItem>
              {contacts.map(contact => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="opportunity_id">Related Opportunity</Label>
          <Select 
            value={activityFormData.opportunity_id} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, opportunity_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select opportunity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Opportunity</SelectItem>
              {opportunities.map(opportunity => (
                <SelectItem key={opportunity.id} value={opportunity.id}>
                  {opportunity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="due_date">Due Date *</Label>
        <Input
          id="due_date"
          type="datetime-local"
          value={activityFormData.due_date}
          onChange={(e) => setActivityFormData(prev => ({ ...prev, due_date: e.target.value }))}
          required
        />
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

  const NoteForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Note Title *</Label>
        <Input
          id="title"
          value={noteFormData.title}
          onChange={(e) => setNoteFormData(prev => ({ ...prev, title: e.target.value }))}
          required
          placeholder="e.g., Meeting Notes - Q4 Planning"
        />
      </div>

      <div>
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={noteFormData.content}
          onChange={(e) => setNoteFormData(prev => ({ ...prev, content: e.target.value }))}
          required
          placeholder="Write your note content here..."
          rows={6}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_id">Related Contact</Label>
          <Select 
            value={noteFormData.contact_id} 
            onValueChange={(value) => setNoteFormData(prev => ({ ...prev, contact_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Contact</SelectItem>
              {contacts.map(contact => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="opportunity_id">Related Opportunity</Label>
          <Select 
            value={noteFormData.opportunity_id} 
            onValueChange={(value) => setNoteFormData(prev => ({ ...prev, opportunity_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select opportunity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Opportunity</SelectItem>
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
              setIsEditNoteDialogOpen(false);
            } else {
              setIsCreateNoteDialogOpen(false);
            }
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={noteFormLoading}>
          {noteFormLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Update Note" : "Create Note"}
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
              <List className="h-8 w-8" />
              Activities & Notes
            </h1>
            <p className="text-gray-600 mt-2">Track your activities and manage notes</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input 
              placeholder="Search activities & notes..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab === "activities" && (
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
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {activeTab === "activities" && (
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
              )}
              
              {activeTab === "notes" && (
                <Dialog open={isCreateNoteDialogOpen} onOpenChange={setIsCreateNoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Note</DialogTitle>
                    </DialogHeader>
                    <NoteForm onSubmit={handleCreateNote} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <TabsContent value="activities" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading activities...</span>
              </div>
            ) : filteredActivities.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <List className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                  <p className="text-gray-600 text-center">
                    {searchTerm || typeFilter !== "all" 
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
                              <h3 className="font-semibold text-lg">{activity.subject}</h3>
                              <p className="text-gray-600 capitalize">{activity.type}</p>
                            </div>
                          </div>
                          
                          {activity.description && (
                            <p className="text-gray-700 mb-4">{activity.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{new Date(activity.due_date).toLocaleString()}</span>
                            </div>
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
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{new Date(activity.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status.toUpperCase()}
                          </Badge>
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
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading notes...</span>
              </div>
            ) : filteredNotes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                  <p className="text-gray-600 text-center">
                    {searchTerm 
                      ? "Try adjusting your search criteria."
                      : "Get started by creating your first note."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <FileText className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{note.title}</h3>
                              <p className="text-gray-600">Note</p>
                            </div>
                          </div>
                          
                          <div className="prose max-w-none mb-4">
                            <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {note.contact_id && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{getContactName(note.contact_id)}</span>
                              </div>
                            )}
                            {note.opportunity_id && (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{getOpportunityName(note.opportunity_id)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{new Date(note.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openEditNoteDialog(note)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Activity Dialog */}
        <Dialog open={isEditActivityDialogOpen} onOpenChange={setIsEditActivityDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Activity</DialogTitle>
            </DialogHeader>
            <ActivityForm onSubmit={handleEditActivity} isEdit={true} />
          </DialogContent>
        </Dialog>

        {/* Edit Note Dialog */}
        <Dialog open={isEditNoteDialogOpen} onOpenChange={setIsEditNoteDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <NoteForm onSubmit={handleEditNote} isEdit={true} />
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 