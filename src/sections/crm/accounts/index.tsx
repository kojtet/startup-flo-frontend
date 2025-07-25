import { useState } from "react";
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { crmSidebarSections } from "@/components/sidebars/CRMSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building, Plus, Loader2 } from "lucide-react";
import { AccountForm } from "./AccountForm";
import { AccountCard } from "./AccountCard";
import { AccountFilters } from "./AccountFilters";
import { AccountPagination } from "./AccountPagination";
import { useAccounts } from "./useAccounts";
import type { Account, UpdateAccountData } from "@/apis/types";

export default function AccountsPage() {
  const {
    accounts,
    allAccounts,
    loading,
    formLoading,
    searchTerm,
    industryFilter,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    formData,
    setSearchTerm,
    setIndustryFilter,
    setCurrentPage,
    setFormData,
    handleCreateAccount,
    handleEditAccount,
    handleDeleteAccount,
    resetFormData,
  } = useAccounts();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const openEditDialog = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      industry: account.industry || "",
      website: account.website || "",
      notes: account.notes || ""
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
      setEditingAccount(null);
      resetFormData();
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    const success = await handleCreateAccount(e);
    if (success) {
      handleCreateDialogOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    const updateData: UpdateAccountData = {
      name: formData.name,
      industry: formData.industry,
      website: formData.website,
      notes: formData.notes
    };
    
    const success = await handleEditAccount(editingAccount.id, updateData);
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
              <Building className="h-8 w-8" />
              Accounts
            </h1>
            <p className="text-gray-600 mt-2">Manage your customer accounts and organizations</p>
          </div>
          
          <div>
            <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpen}>
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
                <AccountForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  onSubmit={handleCreateSubmit} 
                  formLoading={formLoading}
                  onCancel={() => handleCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <AccountFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          industryFilter={industryFilter}
          setIndustryFilter={setIndustryFilter}
          accounts={allAccounts}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading accounts...</span>
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
              <p className="text-gray-600 text-center">
                {searchTerm || industryFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first account."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {accounts.map((account) => (
              <AccountCard 
                key={account.id} 
                account={account} 
                onEdit={openEditDialog}
                onDelete={handleDeleteAccount}
              />
            ))}
          </div>
        )}

        <AccountPagination 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={allAccounts.length}
        />

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
            </DialogHeader>
            <AccountForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleEditSubmit} 
              isEdit={true} 
              formLoading={formLoading} 
              onCancel={() => handleEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 