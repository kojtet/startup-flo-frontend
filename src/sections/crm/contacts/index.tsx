import { useState } from "react";
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { crmSidebarSections } from "@/components/sidebars/CRMSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users2, Plus, Loader2 } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { ContactCard } from "./ContactCard";
import { ContactFilters } from "./ContactFilters";
import { ContactPagination } from "./ContactPagination";
import { useContacts } from "./useContacts";
import type { Contact, UpdateContactData } from "@/apis/types";

export default function ContactsPage() {
  const {
    contacts,
    allContacts,
    loading,
    formLoading,
    searchTerm,
    accountFilter,
    leadFilter,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    formData,
    leads,
    accounts,
    setSearchTerm,
    setAccountFilter,
    setLeadFilter,
    setCurrentPage,
    setFormData,
    handleCreateContact,
    handleEditContact,
    handleDeleteContact,
    resetFormData,
  } = useContacts();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone || "",
      position: contact.position || "",
      lead_id: contact.lead_id || "",
      account_id: contact.account_id || ""
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
      setEditingContact(null);
      resetFormData();
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    const success = await handleCreateContact(e);
    if (success) {
      handleCreateDialogOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    const updateData: UpdateContactData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      position: formData.position,
      lead_id: formData.lead_id,
      account_id: formData.account_id
    };
    
    const success = await handleEditContact(editingContact.id, updateData);
    if (success) {
      handleEditDialogOpen(false);
    }
  };

  return (
    <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management" >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users2 className="h-8 w-8" />
              Contacts & Accounts
            </h1>
            <p className="text-gray-600 mt-2">Manage your customer contacts and their relationships</p>
          </div>
          
          <div>
            <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Contact</DialogTitle>
                </DialogHeader>
                <ContactForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  onSubmit={handleCreateSubmit} 
                  formLoading={formLoading}
                  onCancel={() => handleCreateDialogOpen(false)}
                  leads={leads}
                  accounts={accounts}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <ContactFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          accountFilter={accountFilter}
          setAccountFilter={setAccountFilter}
          leadFilter={leadFilter}
          setLeadFilter={setLeadFilter}
          accounts={accounts}
          leads={leads}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading contacts...</span>
          </div>
        ) : contacts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600 text-center">
                {searchTerm || accountFilter !== "all" || leadFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first contact."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {contacts.map((contact) => (
              <ContactCard 
                key={contact.id} 
                contact={contact} 
                onEdit={openEditDialog}
                onDelete={handleDeleteContact}
              />
            ))}
          </div>
        )}

        <ContactPagination 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={allContacts.length}
        />

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
            </DialogHeader>
            <ContactForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleEditSubmit} 
              isEdit={true} 
              formLoading={formLoading} 
              onCancel={() => handleEditDialogOpen(false)}
              leads={leads}
              accounts={accounts}
            />
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 