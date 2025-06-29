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
import type { Contact, Account, CreateContactData, CreateAccountData, UpdateContactData, UpdateAccountData } from "@/apis/types";
import { 
  Users2, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin,
  User,
  Building,
  Calendar,
  Activity,
  Edit,
  Trash2,
  Loader2,
  Globe
} from "lucide-react";

export default function ContactsAndAccounts() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("contacts");
  
  // Contact state
  const [isCreateContactDialogOpen, setIsCreateContactDialogOpen] = useState(false);
  const [isEditContactDialogOpen, setIsEditContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactFormLoading, setContactFormLoading] = useState(false);
  
  // Account state
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountFormLoading, setAccountFormLoading] = useState(false);

  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  // Contact form state
  const [contactFormData, setContactFormData] = useState<CreateContactData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    account_id: ""
  });

  // Account form state
  const [accountFormData, setAccountFormData] = useState<CreateAccountData>({
    name: "",
    industry: "",
    website: "",
    notes: ""
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchContacts();
    fetchAccounts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const contactsData = await api.crm.getContacts();
      setContacts(contactsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const accountsData = await api.crm.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch accounts",
        variant: "destructive",
      });
      console.error("Error fetching accounts:", error);
    }
  };

  // Contact CRUD operations
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setContactFormLoading(true);
      const newContact = await api.crm.createContact(contactFormData);
      setContacts(prev => [newContact, ...prev]);
      setIsCreateContactDialogOpen(false);
      setContactFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        position: "",
        account_id: ""
      });
      toast({
        title: "Success",
        description: "Contact created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive",
      });
      console.error("Error creating contact:", error);
    } finally {
      setContactFormLoading(false);
    }
  };

  const handleEditContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    try {
      setContactFormLoading(true);
      const updateData: UpdateContactData = {
        first_name: contactFormData.first_name,
        last_name: contactFormData.last_name,
        email: contactFormData.email,
        phone: contactFormData.phone,
        position: contactFormData.position,
        account_id: contactFormData.account_id || undefined
      };
      
      const updatedContact = await api.crm.updateContact(editingContact.id, updateData);
      setContacts(prev => prev.map(contact => 
        contact.id === editingContact.id ? updatedContact : contact
      ));
      setIsEditContactDialogOpen(false);
      setEditingContact(null);
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
      console.error("Error updating contact:", error);
    } finally {
      setContactFormLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await api.crm.deleteContact(contactId);
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
      console.error("Error deleting contact:", error);
    }
  };

  // Account CRUD operations
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAccountFormLoading(true);
      const newAccount = await api.crm.createAccount(accountFormData);
      setAccounts(prev => [newAccount, ...prev]);
      setIsCreateAccountDialogOpen(false);
      setAccountFormData({
        name: "",
        industry: "",
        website: "",
        notes: ""
      });
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
      console.error("Error creating account:", error);
    } finally {
      setAccountFormLoading(false);
    }
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      setAccountFormLoading(true);
      const updateData: UpdateAccountData = {
        name: accountFormData.name,
        industry: accountFormData.industry,
        website: accountFormData.website,
        notes: accountFormData.notes
      };
      
      const updatedAccount = await api.crm.updateAccount(editingAccount.id, updateData);
      setAccounts(prev => prev.map(account => 
        account.id === editingAccount.id ? updatedAccount : account
      ));
      setIsEditAccountDialogOpen(false);
      setEditingAccount(null);
      toast({
        title: "Success",
        description: "Account updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
      console.error("Error updating account:", error);
    } finally {
      setAccountFormLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await api.crm.deleteAccount(accountId);
      setAccounts(prev => prev.filter(account => account.id !== accountId));
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
      console.error("Error deleting account:", error);
    }
  };

  const openEditContactDialog = (contact: Contact) => {
    setEditingContact(contact);
    setContactFormData({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone || "",
      position: contact.position || "",
      account_id: contact.account_id || ""
    });
    setIsEditContactDialogOpen(true);
  };

  const openEditAccountDialog = (account: Account) => {
    setEditingAccount(account);
    setAccountFormData({
      name: account.name,
      industry: account.industry || "",
      website: account.website || "",
      notes: account.notes || ""
    });
    setIsEditAccountDialogOpen(true);
  };

  // Filter data based on search term
  const filteredContacts = contacts.filter(contact =>
    contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.position && contact.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.industry && account.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const ContactForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={contactFormData.first_name}
            onChange={(e) => setContactFormData(prev => ({ ...prev, first_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={contactFormData.last_name}
            onChange={(e) => setContactFormData(prev => ({ ...prev, last_name: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={contactFormData.email}
            onChange={(e) => setContactFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={contactFormData.phone}
            onChange={(e) => setContactFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={contactFormData.position}
            onChange={(e) => setContactFormData(prev => ({ ...prev, position: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="account_id">Account</Label>
          <Select 
            value={contactFormData.account_id} 
            onValueChange={(value) => setContactFormData(prev => ({ ...prev, account_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Account</SelectItem>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
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
              setIsEditContactDialogOpen(false);
            } else {
              setIsCreateContactDialogOpen(false);
            }
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={contactFormLoading}>
          {contactFormLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Update Contact" : "Create Contact"}
        </Button>
      </div>
    </form>
  );

  const AccountForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Company Name *</Label>
        <Input
          id="name"
          value={accountFormData.name}
          onChange={(e) => setAccountFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select 
            value={accountFormData.industry} 
            onValueChange={(value) => setAccountFormData(prev => ({ ...prev, industry: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={accountFormData.website}
            onChange={(e) => setAccountFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={accountFormData.notes}
          onChange={(e) => setAccountFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes about this account..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              setIsEditAccountDialogOpen(false);
            } else {
              setIsCreateAccountDialogOpen(false);
            }
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={accountFormLoading}>
          {accountFormLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Update Account" : "Create Account"}
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
              <Users2 className="h-8 w-8" />
              Contacts & Accounts
            </h1>
            <p className="text-gray-600 mt-2">Manage your contacts and company accounts</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input 
              placeholder="Search contacts & accounts..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
              <TabsTrigger value="accounts">Accounts ({accounts.length})</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {activeTab === "contacts" && (
                <Dialog open={isCreateContactDialogOpen} onOpenChange={setIsCreateContactDialogOpen}>
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
                    <ContactForm onSubmit={handleCreateContact} />
                  </DialogContent>
                </Dialog>
              )}
              
              {activeTab === "accounts" && (
                <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Account</DialogTitle>
                    </DialogHeader>
                    <AccountForm onSubmit={handleCreateAccount} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <TabsContent value="contacts" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading contacts...</span>
              </div>
            ) : filteredContacts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                  <p className="text-gray-600 text-center">
                    {searchTerm 
                      ? "Try adjusting your search criteria."
                      : "Get started by creating your first contact."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredContacts.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {contact.first_name} {contact.last_name}
                              </h3>
                              <p className="text-gray-600">{contact.email}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {contact.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{contact.phone}</span>
                              </div>
                            )}
                            {contact.position && (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{contact.position}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{new Date(contact.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openEditContactDialog(contact)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                        {contact.phone && (
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Activity className="h-4 w-4 mr-1" />
                          Activities
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accounts" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading accounts...</span>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
                  <p className="text-gray-600 text-center">
                    {searchTerm 
                      ? "Try adjusting your search criteria."
                      : "Get started by creating your first account."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredAccounts.map((account) => (
                  <Card key={account.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Building className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{account.name}</h3>
                              {account.industry && (
                                <p className="text-gray-600 capitalize">{account.industry}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {account.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-400" />
                                <a 
                                  href={account.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  {account.website.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{new Date(account.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {account.notes && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                {account.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openEditAccountDialog(account)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteAccount(account.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button size="sm" variant="outline">
                          <User className="h-4 w-4 mr-1" />
                          View Contacts
                        </Button>
                        <Button size="sm" variant="outline">
                          <Activity className="h-4 w-4 mr-1" />
                          Activities
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Contact Dialog */}
        <Dialog open={isEditContactDialogOpen} onOpenChange={setIsEditContactDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
            </DialogHeader>
            <ContactForm onSubmit={handleEditContact} isEdit={true} />
          </DialogContent>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
            </DialogHeader>
            <AccountForm onSubmit={handleEditAccount} isEdit={true} />
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 