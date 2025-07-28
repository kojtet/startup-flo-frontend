import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductNav } from '@/components/ui/product-nav';
import { PromoBanner } from '@/components/ui/promo-banner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText,
  Download,
  Plus,
  Trash2,
  ArrowRight,
  Calculator,
  DollarSign
} from 'lucide-react';

export default function InvoiceMakerPage() {
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    items: [
      { description: '', quantity: 1, rate: 0, amount: 0 }
    ],
    notes: '',
    terms: ''
  });

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setInvoiceData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calculate amount
      if (field === 'quantity' || field === 'rate') {
        const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
        const rate = field === 'rate' ? Number(value) : newItems[index].rate;
        newItems[index].amount = quantity * rate;
      }
      
      return { ...prev, items: newItems };
    });
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const generateInvoice = () => {
    // In a real app, this would generate a PDF
    alert('Invoice generated! This would create a downloadable PDF in a real application.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Promo Banner */}
      <div className="fixed top-0 w-full z-50">
        <PromoBanner />
      </div>
      
      {/* Product Navigation Bar */}
      <div className="fixed top-16 w-full z-40">
        <ProductNav currentProduct="startup-flo" />
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-36 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Startup Flo</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-60 pb-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            🆓 Free Invoice Maker
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Free Invoice Maker
            <span className="text-blue-600 block">Professional Invoices</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create professional invoices instantly with our free invoice maker. 
            No registration required, completely free to use.
          </p>
        </div>
      </section>

      {/* Invoice Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-6 w-6" />
                  Create Your Invoice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Invoice Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      placeholder="INV-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Invoice Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={invoiceData.date}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={invoiceData.companyName}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Your Company Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyEmail">Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={invoiceData.companyEmail}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, companyEmail: e.target.value }))}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone">Phone</Label>
                      <Input
                        id="companyPhone"
                        value={invoiceData.companyPhone}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, companyPhone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyAddress">Address</Label>
                      <Textarea
                        id="companyAddress"
                        value={invoiceData.companyAddress}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, companyAddress: e.target.value }))}
                        placeholder="Your company address"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={invoiceData.clientName}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Client Company Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Client Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={invoiceData.clientEmail}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="client@email.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="clientAddress">Client Address</Label>
                      <Textarea
                        id="clientAddress"
                        value={invoiceData.clientAddress}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, clientAddress: e.target.value }))}
                        placeholder="Client address"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Invoice Items</h3>
                    <Button onClick={addItem} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {invoiceData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-6">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                            min="1"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Rate ($)</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', Number(e.target.value))}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Amount</Label>
                          <div className="p-2 bg-gray-50 rounded border text-sm">
                            ${item.amount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-1">
                          <Button
                            onClick={() => removeItem(index)}
                            variant="ghost"
                            size="sm"
                            disabled={invoiceData.items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (10%):</span>
                        <span>${calculateTax().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes and Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      value={invoiceData.terms}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, terms: e.target.value }))}
                      placeholder="Payment terms..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center">
                  <Button onClick={generateInvoice} size="lg" className="px-8">
                    <Download className="mr-2 h-5 w-5" />
                    Generate Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Use Our Free Invoice Maker?
            </h2>
            <p className="text-xl text-gray-600">
              Professional invoices made simple and completely free
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Professional Templates</h3>
                <p className="text-gray-600">Clean, professional invoice templates that make a great impression.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Auto Calculations</h3>
                <p className="text-gray-600">Automatic calculations for totals, taxes, and discounts.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Download</h3>
                <p className="text-gray-600">Download your invoice as PDF instantly, ready to send to clients.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Need More Business Tools?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Upgrade to Startup Flo for complete business management including invoicing, 
            project management, HR, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => router.push('/auth/register')}
              className="text-lg px-8 py-3"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 