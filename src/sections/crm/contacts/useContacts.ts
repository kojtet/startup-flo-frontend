import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCRM } from "@/hooks/useCRM";
import type { Contact, CreateContactData, UpdateContactData } from "@/apis/types";

export const useContacts = () => {
  const { toast } = useToast();
  const { 
    contacts: apiContacts, 
    isLoadingContacts, 
    contactsError,
    leads: apiLeads,
    accounts: apiAccounts,
    fetchContacts: fetchContactsFromAPI, 
    createContact: createContactFromAPI, 
    updateContact: updateContactFromAPI, 
    deleteContact: deleteContactFromAPI
  } = useCRM();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [leadFilter, setLeadFilter] = useState("all");
  const [formLoading, setFormLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<CreateContactData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    lead_id: "",
    account_id: ""
  });

  // Show error toast if there's an API error
  useEffect(() => {
    if (contactsError) {
      toast({
        title: "Error",
        description: contactsError,
        variant: "destructive",
      });
    }
  }, [contactsError, toast]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const contactData = {
        ...formData,
        phone: formData.phone || undefined,
        position: formData.position || undefined,
        lead_id: formData.lead_id || undefined,
        account_id: formData.account_id || undefined
      };
      await createContactFromAPI(contactData);
      await fetchContactsFromAPI();
      toast({
        title: "Success",
        description: "Contact created successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive",
      });
      console.error("Error creating contact:", error);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditContact = async (contactId: string, updateData: UpdateContactData) => {
    try {
      setFormLoading(true);
      await updateContactFromAPI(contactId, updateData);
      await fetchContactsFromAPI();
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
      console.error("Error updating contact:", error);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContactFromAPI(contactId);
      await fetchContactsFromAPI();
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
      console.error("Error deleting contact:", error);
      return false;
    }
  };

  const resetFormData = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      position: "",
      lead_id: "",
      account_id: ""
    });
  };

  // Filter contacts based on search term and filters
  const filteredContacts = apiContacts.filter(contact => {
    // Search filter
    const matchesSearch = 
      (contact.first_name && contact.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.last_name && contact.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    // Account filter
    const matchesAccount = 
      accountFilter === "all" || 
      (accountFilter === "none" && !contact.account_id) ||
      (accountFilter !== "all" && accountFilter !== "none" && contact.account_id === accountFilter);

    // Lead filter
    const matchesLead = 
      leadFilter === "all" || 
      (leadFilter === "none" && !contact.lead_id) ||
      (leadFilter !== "all" && leadFilter !== "none" && contact.lead_id === leadFilter);

    return matchesSearch && matchesAccount && matchesLead;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, accountFilter, leadFilter]);

  return {
    // State
    contacts: paginatedContacts,
    allContacts: filteredContacts,
    loading: isLoadingContacts,
    formLoading,
    searchTerm,
    accountFilter,
    leadFilter,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    formData,
    leads: apiLeads,
    accounts: apiAccounts,
    
    // Actions
    setSearchTerm,
    setAccountFilter,
    setLeadFilter,
    setCurrentPage,
    setFormData,
    handleCreateContact,
    handleEditContact,
    handleDeleteContact,
    resetFormData,
    refreshContacts: () => fetchContactsFromAPI(),
  };
}; 