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
import type { Invoice, Bill, CreateInvoiceData, UpdateInvoiceData, CreateBillData, UpdateBillData } from '@/apis/types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InvoicesBillsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const [isEditInvoiceDialogOpen, setIsEditInvoiceDialogOpen] = useState(false);
  const [isEditBillDialogOpen, setIsEditBillDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [invoiceFormData, setInvoiceFormData] = useState<CreateInvoiceData>({
    invoice_number: '',
    client_name: '',
    client_email: '',
    amount: 0,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issue_date: new Date().toISOString().split('T')[0],
    description: '',
    items: []
  });
  const [billFormData, setBillFormData] = useState<CreateBillData>({
    bill_number: '',
    vendor_name: '',
    vendor_email: '',
    amount: 0,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issue_date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'utilities'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesResponse, billsResponse] = await Promise.all([
        api.finance.getInvoices(),
        api.finance.getBills()
      ]);
      setInvoices(invoicesResponse || []);
      setBills(billsResponse || []);
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
        invoice_number: '',
        client_name: '',
        client_email: '',
        amount: 0,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        issue_date: new Date().toISOString().split('T')[0],
        description: '',
        items: []
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

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBill = await api.finance.createBill(billFormData);
      setBills(prev => [newBill, ...prev]);
      setIsBillDialogOpen(false);
      setBillFormData({
        bill_number: '',
        vendor_name: '',
        vendor_email: '',
        amount: 0,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        issue_date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'utilities'
      });
      toast({
        title: "Success",
        description: "Bill created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create bill",
        variant: "destructive"
      });
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await api.finance.sendInvoice(invoiceId);
      setInvoices(prev => prev.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status: 'sent', sent_date: new Date().toISOString() }
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

  const handleMarkPaid = async (type: 'invoice' | 'bill', id: string) => {
    try {
      if (type === 'invoice') {
        await api.finance.markInvoicePaid(id);
        setInvoices(prev => prev.map(invoice => 
          invoice.id === id 
            ? { ...invoice, status: 'paid', paid_date: new Date().toISOString() }
            : invoice
        ));
      } else {
        await api.finance.markBillPaid(id);
        setBills(prev => prev.map(bill => 
          bill.id === id 
            ? { ...bill, status: 'paid', paid_date: new Date().toISOString() }
            : bill
        ));
      }
      toast({
        title: "Success",
        description: `${type === 'invoice' ? 'Invoice' : 'Bill'} marked as paid`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to mark ${type} as paid`,
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

  const handleDeleteBill = async (billId: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    try {
      await api.finance.deleteBill(billId);
      setBills(prev => prev.filter(bill => bill.id !== billId));
      toast({
        title: "Success",
        description: "Bill deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bill",
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
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalBillAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;
  const paidBills = bills.filter(b => b.status === 'paid').length;

  return (
    <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Invoices & Bills</h1>
          <p className="text-muted-foreground">
            Manage your invoices and bills, track payments and due dates
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBillAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {bills.length} bills
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
              <CardTitle className="text-sm font-medium">Paid Bills</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidBills}</div>
              <p className="text-xs text-muted-foreground">
                of {bills.length} total
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
                placeholder="Search invoices & bills..."
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
        </div>

        {/* Tabs for Invoices and Bills */}
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Invoice Management</h2>
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
                        <Label htmlFor="invoice-number">Invoice Number</Label>
                        <Input
                          id="invoice-number"
                          value={invoiceFormData.invoice_number}
                          onChange={(e) => setInvoiceFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                          placeholder="INV-001"
                          required
                        />
                      </div>
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
                        <Label htmlFor="client-email">Client Email</Label>
                        <Input
                          id="client-email"
                          type="email"
                          value={invoiceFormData.client_email}
                          onChange={(e) => setInvoiceFormData(prev => ({ ...prev, client_email: e.target.value }))}
                          placeholder="client@example.com"
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
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="issue-date">Issue Date</Label>
                          <Input
                            id="issue-date"
                            type="date"
                            value={invoiceFormData.issue_date}
                            onChange={(e) => setInvoiceFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="due-date">Due Date</Label>
                          <Input
                            id="due-date"
                            type="date"
                            value={invoiceFormData.due_date}
                            onChange={(e) => setInvoiceFormData(prev => ({ ...prev, due_date: e.target.value }))}
                            required
                          />
                        </div>
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
                              <h3 className="font-semibold">{invoice.invoice_number}</h3>
                              <Badge className={getStatusColor(invoice.status)}>
                                {invoice.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {invoice.client_name} • {invoice.client_email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Issued: {new Date(invoice.issue_date).toLocaleDateString()} 
                              • Due: {new Date(invoice.due_date).toLocaleDateString()}
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
                                onClick={() => handleMarkPaid('invoice', invoice.id)}
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
          </TabsContent>

          <TabsContent value="bills" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Bill Management</h2>
              <Dialog open={isBillDialogOpen} onOpenChange={setIsBillDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bill
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleCreateBill}>
                    <DialogHeader>
                      <DialogTitle>Add New Bill</DialogTitle>
                      <DialogDescription>
                        Record a new bill from a vendor or service provider.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bill-number">Bill Number</Label>
                        <Input
                          id="bill-number"
                          value={billFormData.bill_number}
                          onChange={(e) => setBillFormData(prev => ({ ...prev, bill_number: e.target.value }))}
                          placeholder="BILL-001"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="vendor-name">Vendor Name</Label>
                        <Input
                          id="vendor-name"
                          value={billFormData.vendor_name}
                          onChange={(e) => setBillFormData(prev => ({ ...prev, vendor_name: e.target.value }))}
                          placeholder="Vendor Company"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="vendor-email">Vendor Email</Label>
                        <Input
                          id="vendor-email"
                          type="email"
                          value={billFormData.vendor_email}
                          onChange={(e) => setBillFormData(prev => ({ ...prev, vendor_email: e.target.value }))}
                          placeholder="vendor@example.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bill-amount">Amount</Label>
                        <Input
                          id="bill-amount"
                          type="number"
                          step="0.01"
                          value={billFormData.amount}
                          onChange={(e) => setBillFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bill-category">Category</Label>
                        <Select
                          value={billFormData.category}
                          onValueChange={(value: any) => setBillFormData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="rent">Rent</SelectItem>
                            <SelectItem value="insurance">Insurance</SelectItem>
                            <SelectItem value="supplies">Supplies</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="bill-issue-date">Issue Date</Label>
                          <Input
                            id="bill-issue-date"
                            type="date"
                            value={billFormData.issue_date}
                            onChange={(e) => setBillFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="bill-due-date">Due Date</Label>
                          <Input
                            id="bill-due-date"
                            type="date"
                            value={billFormData.due_date}
                            onChange={(e) => setBillFormData(prev => ({ ...prev, due_date: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bill-description">Description</Label>
                        <Textarea
                          id="bill-description"
                          value={billFormData.description}
                          onChange={(e) => setBillFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Services or products received..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Bill</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading bills...</div>
            ) : (
              <div className="grid gap-4">
                {filteredBills.map((bill) => (
                  <Card key={bill.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <Clock className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{bill.bill_number}</h3>
                              <Badge className={getStatusColor(bill.status)}>
                                {bill.status.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {bill.category.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {bill.vendor_name}
                              {bill.vendor_email && ` • ${bill.vendor_email}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Issued: {new Date(bill.issue_date).toLocaleDateString()} 
                              • Due: {new Date(bill.due_date).toLocaleDateString()}
                            </p>
                            {bill.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {bill.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            ${bill.amount.toLocaleString()}
                          </div>
                          <div className="flex gap-2 mt-2">
                            {bill.status !== 'paid' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkPaid('bill', bill.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBill(bill.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredBills.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No bills found
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ExtensibleLayout>
  );
}
