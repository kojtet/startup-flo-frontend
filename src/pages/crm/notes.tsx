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
import { useNotes } from "@/hooks/useNotes";
import type { Note, CreateNoteData, UpdateNoteData } from "@/apis/types";
import { 
  FileText, 
  Plus, 
  Search, 
  Paperclip,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Download,
  ChevronUp,
  ChevronDown
} from "lucide-react";

export default function Notes() {
  const { toast } = useToast();
  const {
    notes,
    isLoadingNotes,
    notesError,
    contacts,
    opportunities,
    leads,
    accounts,
    isLoadingRelated,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote
  } = useNotes();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Note state
  const [isCreateNoteDialogOpen, setIsCreateNoteDialogOpen] = useState(false);
  const [isEditNoteDialogOpen, setIsEditNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteFormLoading, setNoteFormLoading] = useState(false);

  // Note form state
  const [noteFormData, setNoteFormData] = useState<CreateNoteData>({
    type: "text",
    content: "",
    entity_type: "contact",
    entity_id: "",
    file_url: "",
    file_name: "",
    file_type: "",
    file_size: 0
  });

  // Refresh notes when type filter changes
  useEffect(() => {
    const params = typeFilter !== "all" ? { type: typeFilter } : {};
    fetchNotes(params);
  }, [typeFilter, fetchNotes]);

  // Note CRUD operations
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setNoteFormLoading(true);
      
      // Clean up empty string values to null for optional fields
      const cleanData = {
        ...noteFormData,
        file_url: noteFormData.file_url || undefined,
        file_name: noteFormData.file_name || undefined,
        file_type: noteFormData.file_type || undefined,
        file_size: noteFormData.file_size || undefined
      };

      await createNote(cleanData);
      setIsCreateNoteDialogOpen(false);
      setNoteFormData({
        type: "text",
        content: "",
        entity_type: "contact",
        entity_id: "",
        file_url: "",
        file_name: "",
        file_type: "",
        file_size: 0
      });
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      // Refresh notes
      fetchNotes();
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
      
      // Clean up empty string values to null for optional fields
      const cleanData = {
        ...noteFormData,
        file_url: noteFormData.file_url || undefined,
        file_name: noteFormData.file_name || undefined,
        file_type: noteFormData.file_type || undefined,
        file_size: noteFormData.file_size || undefined
      };

      await updateNote(editingNote.id, cleanData);
      setIsEditNoteDialogOpen(false);
      setEditingNote(null);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      // Refresh notes
      fetchNotes();
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
      await deleteNote(noteId);
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      // Refresh notes
      fetchNotes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
      console.error("Error deleting note:", error);
    }
  };

  const openEditNoteDialog = (note: Note) => {
    setEditingNote(note);
    setNoteFormData({
      type: note.type,
      content: note.content,
      entity_type: note.entity_type,
      entity_id: note.entity_id,
      file_url: note.file_url || "",
      file_name: note.file_name || "",
      file_type: note.file_type || "",
      file_size: note.file_size || 0
    });
    setIsEditNoteDialogOpen(true);
  };

  const getEntityName = (entityType: string, entityId: string) => {
    switch (entityType) {
      case "contact":
        const contact = contacts.find(c => c.id === entityId);
        return contact ? `${contact.first_name} ${contact.last_name}` : "Unknown Contact";
      case "opportunity":
        const opportunity = opportunities.find(o => o.id === entityId);
        return opportunity ? opportunity.name : "Unknown Opportunity";
      case "lead":
        const lead = leads.find(l => l.id === entityId);
        return lead ? lead.name : "Unknown Lead";
      case "account":
        const account = accounts.find(a => a.id === entityId);
        return account ? account.name : "Unknown Account";
      default:
        return "Unknown Entity";
    }
  };

  const getEntityOptions = (entityType: string) => {
    switch (entityType) {
      case "contact":
        return contacts.map(contact => ({
          id: contact.id,
          name: `${contact.first_name} ${contact.last_name}`
        }));
      case "opportunity":
        return opportunities.map(opportunity => ({
          id: opportunity.id,
          name: opportunity.name
        }));
      case "lead":
        return leads.map(lead => ({
          id: lead.id,
          name: lead.name
        }));
      case "account":
        return accounts.map(account => ({
          id: account.id,
          name: account.name
        }));
      default:
        return [];
    }
  };

  // Filter notes based on search term and entity type filter
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.file_name && note.file_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEntityType = entityTypeFilter === "all" || note.entity_type === entityTypeFilter;
    return matchesSearch && matchesEntityType;
  });

  // Sorting logic
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    let aValue = a[sortKey] ?? "";
    let bValue = b[sortKey] ?? "";
    // If sorting by content, type, or file_name, compare as strings
    if (["content", "type", "file_name"].includes(sortKey)) {
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    // If sorting by created_at, compare as dates
    if (sortKey === "created_at" && aValue && bValue) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      return sortDirection === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
    }
    // Default fallback
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedNotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotes = sortedNotes.slice(startIndex, endIndex);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, entityTypeFilter, sortKey, sortDirection]);

  // Show loading state
  if (isLoadingNotes) {
    return (
      <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading notes...</span>
        </div>
      </ExtensibleLayout>
    );
  }

  // Show error state
  if (notesError) {
    return (
      <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading notes: {notesError}</p>
            <Button onClick={() => fetchNotes()}>Retry</Button>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  const NoteForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Note Type *</Label>
          <Select 
            value={noteFormData.type} 
            onValueChange={(value) => setNoteFormData(prev => ({ ...prev, type: value as "text" | "attachment" }))}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="attachment">Attachment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="entity_type">Entity Type *</Label>
          <Select 
            value={noteFormData.entity_type} 
            onValueChange={(value) => {
              setNoteFormData(prev => ({ 
                ...prev, 
                entity_type: value as "opportunity" | "lead" | "contact" | "account",
                entity_id: "" // Reset entity_id when entity_type changes
              }));
            }}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contact">Contact</SelectItem>
              <SelectItem value="opportunity">Opportunity</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="account">Account</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="entity_id">Entity *</Label>
        <Select 
          value={noteFormData.entity_id || "none"} 
          onValueChange={(value) => setNoteFormData(prev => ({ ...prev, entity_id: value === "none" ? "" : value }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" disabled>Select an entity</SelectItem>
            {getEntityOptions(noteFormData.entity_type).map(entity => (
              <SelectItem key={entity.id} value={entity.id}>
                {entity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {noteFormData.type === "attachment" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="file_url">File URL</Label>
            <Input
              id="file_url"
              value={noteFormData.file_url}
              onChange={(e) => setNoteFormData(prev => ({ ...prev, file_url: e.target.value }))}
              placeholder="https://example.com/file.pdf"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="file_name">File Name</Label>
              <Input
                id="file_name"
                value={noteFormData.file_name}
                onChange={(e) => setNoteFormData(prev => ({ ...prev, file_name: e.target.value }))}
                placeholder="meeting_notes.pdf"
              />
            </div>
            <div>
              <Label htmlFor="file_type">File Type</Label>
              <Input
                id="file_type"
                value={noteFormData.file_type}
                onChange={(e) => setNoteFormData(prev => ({ ...prev, file_type: e.target.value }))}
                placeholder="application/pdf"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="file_size">File Size (bytes)</Label>
            <Input
              id="file_size"
              type="number"
              value={noteFormData.file_size}
              onChange={(e) => setNoteFormData(prev => ({ ...prev, file_size: parseInt(e.target.value) || 0 }))}
              placeholder="1024"
            />
          </div>
        </div>
      )}

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
    <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management" >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Notes
            </h1>
            <p className="text-gray-600 mt-2">Manage notes and attachments for your CRM entities</p>
          </div>
          
          <div>
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
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input 
              placeholder="Search notes..." 
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
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="attachment">Attachment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="contact">Contacts</SelectItem>
              <SelectItem value="opportunity">Opportunities</SelectItem>
              <SelectItem value="lead">Leads</SelectItem>
              <SelectItem value="account">Accounts</SelectItem>
            </SelectContent>
          </Select>
         {/* Sort Dropdown */}
         <Select value={sortKey} onValueChange={setSortKey}>
           <SelectTrigger className="w-40">
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="created_at">Sort by Created Date</SelectItem>
             <SelectItem value="content">Sort by Content</SelectItem>
             <SelectItem value="type">Sort by Type</SelectItem>
             <SelectItem value="file_name">Sort by File Name</SelectItem>
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

        {paginatedNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
              <p className="text-gray-600 text-center">
                {searchTerm || typeFilter !== "all" || entityTypeFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first note."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {paginatedNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          {note.type === "attachment" ? (
                            <Paperclip className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{note.type === "attachment" ? "Attachment" : "Text Note"}</h3>
                          <p className="text-gray-600">{note.entity_type} - {getEntityName(note.entity_type, note.entity_id)}</p>
                        </div>
                      </div>
                      
                      <div className="prose max-w-none mb-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                      
                      {note.type === "attachment" && note.file_url && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">{note.file_name || "Attachment"}</span>
                            {note.file_size && (
                              <span className="text-xs text-gray-500">
                                ({(note.file_size / 1024).toFixed(1)} KB)
                              </span>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => window.open(note.file_url, '_blank')}
                              className="ml-auto"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{note.entity_type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getEntityName(note.entity_type, note.entity_id)}</span>
                        </div>
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