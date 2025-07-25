import { useState } from "react";
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { financeSidebarSections } from "@/components/sidebars/FinanceSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Wallet, TrendingUp, Plus, Loader2 } from "lucide-react";
import { AccountForm } from "./AccountForm";
import { AccountCard } from "./AccountCard";
import { AccountFilters } from "./AccountFilters";
import { AccountPagination } from "./AccountPagination";
import { useAccounts } from "./useAccounts";
import type { FinancialAccount, UpdateFinancialAccountData } from "@/apis/types";

export default function AccountsBalancesPage() {
  const {
    accounts,
    allAccounts,
    loading,
    formLoading,
    searchTerm,
    typeFilter,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    formData,
    totalBalance,
    primaryAccount,
    bankAccountsCount,
    setSearchTerm,
    setTypeFilter,
    setCurrentPage,
    setFormData,
    handleCreateAccount,
    handleEditAccount,
    handleDeleteAccount,
    resetFormData,
  } = useAccounts();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);

  const openEditDialog = (account: FinancialAccount) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      currency: account.currency,
      is_primary: account.is_primary,
      balance: account.balance,
      description: account.description || ""
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

    const updateData: UpdateFinancialAccountData = {
      name: formData.name,
      type: formData.type,
      currency: formData.currency,
      is_primary: formData.is_primary,
      balance: formData.balance,
      description: formData.description
    };
    
    const success = await handleEditAccount(editingAccount.id, updateData);
    if (success) {
      handleEditDialogOpen(false);
    }
  };

  return (
    <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="h-8 w-8" />
              Accounts & Balances
            </h1>
            <p className="text-gray-600 mt-2">Manage your financial accounts and track balances</p>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalBalance.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allAccounts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Primary Account</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {primaryAccount?.name || 'None set'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bankAccountsCount}</div>
            </CardContent>
          </Card>
        </div>

        <AccountFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading accounts...</span>
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
              <p className="text-gray-600 text-center">
                {searchTerm || typeFilter !== "all"
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