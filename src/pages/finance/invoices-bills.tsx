import React, { useState, useEffect } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { financeSidebarSections } from '@/components/sidebars/FinanceSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/apis';
import type { Invoice, CreateInvoiceData, UpdateInvoiceData } from '@/apis/types';
import { Plus, Edit, Trash2, FileText, Clock, DollarSign, Calendar, Search, Filter, Send, CheckCircle } from 'lucide-react';
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

export default function InvoicesBillsPage() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();

  // Transform auth user to layout user format
  const user = authUser ? {
    name: authUser.first_name && authUser.last_name 
      ? `${authUser.first_name} ${authUser.last_name}` 
      : authUser.email,
    email: authUser.email,
    role: authUser.role || 'User',
    avatarUrl: authUser.avatar_url || undefined
  } : {
    name: '',
    email: '',
    role: '',
    avatarUrl: undefined
  };

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isEditInvoiceDialogOpen, setIsEditInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceFormData, setInvoiceFormData] = useState<CreateInvoiceData>({
    client_name: '',
    amount: 0,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const invoicesResponse = await api.finance.getInvoices();
      setInvoices(invoicesResponse || []);
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

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newInvoice = await api.finance.createInvoice(invoiceFormData);
      setInvoices(prev => [newInvoice, ...prev]);
      setIsInvoiceDialogOpen(false);
      setInvoiceFormData({
        client_name: '',
        amount: 0,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: ''
      });
      toast({
        title: "Success",
        description: "Invoice created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await api.finance.sendInvoice(invoiceId);
      setInvoices(prev => prev.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status: 'sent' }
          : invoice
      ));
      toast({
        title: "Success",
        description: "Invoice sent successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invoice",
        variant: "destructive"
      });
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      await api.finance.updateInvoiceStatus(invoiceId, { status: 'paid' });
      setInvoices(prev => prev.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status: 'paid' }
          : invoice
      ));
      toast({
        title: "Success",
        description: "Invoice marked as paid"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark invoice as paid",
        variant: "destructive"
      });
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await api.finance.deleteInvoice(invoiceId);
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      toast({
        title: "Success",
        description: "Invoice deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;

  return (
    <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting" >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your invoices and track payments
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInvoiceAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {invoices.length} invoices
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidInvoices}</div>
              <p className="text-xs text-muted-foreground">
                of {invoices.length} total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {invoices.filter(i => i.status !== 'paid').length}
              </div>
              <p className="text-xs text-muted-foreground">
                pending payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateInvoice}>
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>
                    Create a new invoice for your client.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input
                      id="client-name"
                      value={invoiceFormData.client_name}
                      onChange={(e) => setInvoiceFormData(prev => ({ ...prev, client_name: e.target.value }))}
                      placeholder="Client Company"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invoice-amount">Amount</Label>
                    <Input
                      id="invoice-amount"
                      type="number"
                      step="0.01"
                      value={invoiceFormData.amount}
                      onChange={(e) => setInvoiceFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={invoiceFormData.due_date}
                      onChange={(e) => setInvoiceFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={invoiceFormData.description}
                      onChange={(e) => setInvoiceFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Services provided..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Invoice</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Invoices List */}
        {loading ? (
          <div className="text-center py-8">Loading invoices...</div>
        ) : (
          <div className="grid gap-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{invoice.invoice_number || `Invoice #${invoice.id.slice(-6)}`}</h3>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {invoice.client_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </p>
                        {invoice.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {invoice.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        ${invoice.amount.toLocaleString()}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {invoice.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendInvoice(invoice.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.status !== 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkPaid(invoice.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredInvoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No invoices found
              </div>
            )}
          </div>
        )}
      </div>
    </ExtensibleLayout>
  );
}
