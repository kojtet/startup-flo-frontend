import React, { useState, useEffect } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { financeSidebarSections } from '@/components/sidebars/FinanceSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/apis';
import type { Transfer, CreateTransferData, UpdateTransferData, FinancialAccount } from '@/apis/types';
import { Plus, Edit, Trash2, ArrowLeftRight, ArrowRight, Search, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [formData, setFormData] = useState<CreateTransferData>({
    from_account_id: '',
    to_account_id: '',
    amount: 0,
    description: '',
    transfer_date: new Date().toISOString().split('T')[0],
    reference: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transfersResponse, accountsResponse] = await Promise.all([
        api.finance.getTransfers(),
        api.finance.getAccounts()
      ]);
      setTransfers(transfersResponse || []);
      setAccounts(accountsResponse || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.from_account_id === formData.to_account_id) {
      toast({
        title: "Error",
        description: "Cannot transfer to the same account",
        variant: "destructive"
      });
      return;
    }

    try {
      const newTransfer = await api.finance.createTransfer(formData);
      setTransfers(prev => [newTransfer, ...prev]);
      setIsCreateDialogOpen(false);
      setFormData({
        from_account_id: '',
        to_account_id: '',
        amount: 0,
        description: '',
        transfer_date: new Date().toISOString().split('T')[0],
        reference: ''
      });
      toast({
        title: "Success",
        description: "Transfer created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create transfer",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransfer) return;

    try {
      const updateData: UpdateTransferData = {
        from_account_id: formData.from_account_id,
        to_account_id: formData.to_account_id,
        amount: formData.amount,
        description: formData.description,
        transfer_date: formData.transfer_date,
        reference: formData.reference
      };

      const updatedTransfer = await api.finance.updateTransfer(selectedTransfer.id, updateData);
      setTransfers(prev => prev.map(transfer => 
        transfer.id === selectedTransfer.id ? updatedTransfer : transfer
      ));
      setIsEditDialogOpen(false);
      setSelectedTransfer(null);
      toast({
        title: "Success",
        description: "Transfer updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transfer",
        variant: "destructive"
      });
    }
  };

  const handleCancelTransfer = async (transferId: string) => {
    if (!confirm('Are you sure you want to cancel this transfer?')) return;

    try {
      await api.finance.cancelTransfer(transferId);
      setTransfers(prev => prev.map(transfer => 
        transfer.id === transferId 
          ? { ...transfer, status: 'cancelled', cancelled_date: new Date().toISOString() }
          : transfer
      ));
      toast({
        title: "Success",
        description: "Transfer cancelled successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel transfer",
        variant: "destructive"
      });
    }
  };

  const handleCompleteTransfer = async (transferId: string) => {
    try {
      await api.finance.completeTransfer(transferId);
      setTransfers(prev => prev.map(transfer => 
        transfer.id === transferId 
          ? { ...transfer, status: 'completed', completed_date: new Date().toISOString() }
          : transfer
      ));
      toast({
        title: "Success",
        description: "Transfer completed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete transfer",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTransfer = async (transferId: string) => {
    if (!confirm('Are you sure you want to delete this transfer?')) return;

    try {
      await api.finance.deleteTransfer(transferId);
      setTransfers(prev => prev.filter(transfer => transfer.id !== transferId));
      toast({
        title: "Success",
        description: "Transfer deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transfer",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setFormData({
      from_account_id: transfer.from_account_id,
      to_account_id: transfer.to_account_id,
      amount: transfer.amount,
      description: transfer.description,
      transfer_date: transfer.transfer_date,
      reference: transfer.reference || ''
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return ArrowLeftRight;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'Unknown Account';
  };

  const filteredTransfers = transfers.filter(transfer => {
    const fromAccount = getAccountName(transfer.from_account_id);
    const toAccount = getAccountName(transfer.to_account_id);
    const matchesSearch = fromAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         toAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalTransferAmount = transfers.reduce((sum, transfer) => sum + transfer.amount, 0);
  const completedTransfers = transfers.filter(t => t.status === 'completed').length;
  const pendingTransfers = transfers.filter(t => t.status === 'pending').length;

  return (
    <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Money Transfers</h1>
          <p className="text-muted-foreground">
            Transfer money between your accounts and track transaction history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transferred</CardTitle>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalTransferAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transfers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTransfers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingTransfers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transfers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateTransfer}>
                <DialogHeader>
                  <DialogTitle>Create New Transfer</DialogTitle>
                  <DialogDescription>
                    Transfer money from one account to another.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="from_account">From Account</Label>
                    <Select
                      value={formData.from_account_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, from_account_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} (${account.balance.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="to_account">To Account</Label>
                    <Select
                      value={formData.to_account_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, to_account_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} (${account.balance.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="transfer_date">Transfer Date</Label>
                    <Input
                      id="transfer_date"
                      type="date"
                      value={formData.transfer_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, transfer_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="Optional reference number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Transfer description or memo"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Transfer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transfers List */}
        {loading ? (
          <div className="text-center py-8">Loading transfers...</div>
        ) : (
          <div className="grid gap-4">
            {filteredTransfers.map((transfer) => {
              const StatusIcon = getStatusIcon(transfer.status);
              const fromAccount = getAccountName(transfer.from_account_id);
              const toAccount = getAccountName(transfer.to_account_id);
              
              return (
                <Card key={transfer.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <StatusIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{fromAccount}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{toAccount}</span>
                            <Badge className={getStatusColor(transfer.status)}>
                              {transfer.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {transfer.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transfer.transfer_date).toLocaleDateString()}
                            {transfer.reference && ` • Ref: ${transfer.reference}`}
                          </p>
                          {transfer.completed_date && (
                            <p className="text-xs text-green-600">
                              Completed: {new Date(transfer.completed_date).toLocaleDateString()}
                            </p>
                          )}
                          {transfer.cancelled_date && (
                            <p className="text-xs text-red-600">
                              Cancelled: {new Date(transfer.cancelled_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${transfer.amount.toLocaleString()}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {transfer.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteTransfer(transfer.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelTransfer(transfer.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {transfer.status !== 'completed' && transfer.status !== 'cancelled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(transfer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTransfer(transfer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredTransfers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No transfers found
              </div>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleUpdateTransfer}>
              <DialogHeader>
                <DialogTitle>Edit Transfer</DialogTitle>
                <DialogDescription>
                  Update transfer details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-from_account">From Account</Label>
                  <Select
                    value={formData.from_account_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, from_account_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} (${account.balance.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-to_account">To Account</Label>
                  <Select
                    value={formData.to_account_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, to_account_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} (${account.balance.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-transfer_date">Transfer Date</Label>
                  <Input
                    id="edit-transfer_date"
                    type="date"
                    value={formData.transfer_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, transfer_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-reference">Reference</Label>
                  <Input
                    id="edit-reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Transfer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
}
