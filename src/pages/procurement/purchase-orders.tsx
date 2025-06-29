import React, { useState, useEffect } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { useAuth } from '@/contexts/AuthContext';
import { procurementSidebarSections } from '@/components/sidebars/ProcurementSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingCart,
  Plus,
  FileText,
  Truck,
  Package,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function PurchaseOrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ExtensibleLayout
        moduleSidebar={procurementSidebarSections}
        moduleTitle="Procurement"
        user={user}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout
      moduleSidebar={procurementSidebarSections}
      moduleTitle="Procurement"
      user={user}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">
              Create and manage purchase orders with vendors
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create PO
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total POs</p>
                  <p className="text-xl font-bold">45</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">In Transit</p>
                  <p className="text-xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Delivered</p>
                  <p className="text-xl font-bold">25</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">PO-2024-001</h4>
                  <p className="text-sm text-muted-foreground">Office Equipment • TechCorp Solutions • $125,000</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Delivered</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">PO-2024-002</h4>
                  <p className="text-sm text-muted-foreground">Furniture • Furniture World • $45,000</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">In Transit</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">PO-2024-003</h4>
                  <p className="text-sm text-muted-foreground">Office Supplies • Office Inc • $12,000</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">PO-2024-004</h4>
                  <p className="text-sm text-muted-foreground">Cleaning Services • Clean Pro • $8,000</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ExtensibleLayout>
  );
};
    e.preventDefault();
    try {
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      
      const newPO: PurchaseOrder = {
        id: Date.now().toString(),
        po_number: generatePONumber(),
        vendor_id: formData.vendor_id,
        status: 'draft',
        priority: formData.priority,
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: formData.expected_delivery,
        total_amount: totalAmount,
        currency: 'USD',
        items: formData.items.map((item, index) => ({
          id: (index + 1).toString(),
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          specifications: item.specifications
        })),
        notes: formData.notes,
        created_by: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setPurchaseOrders([...purchaseOrders, newPO]);
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (poId: string, newStatus: PurchaseOrder['status']) => {
    try {
      setPurchaseOrders(purchaseOrders.map(po => 
        po.id === poId 
          ? { 
              ...po, 
              status: newStatus, 
              updated_at: new Date().toISOString(),
              ...(newStatus === 'delivered' ? { actual_delivery: new Date().toISOString().split('T')[0] } : {})
            }
          : po
      ));
      
      toast({
        title: "Success",
        description: `Purchase order ${newStatus.replace('_', ' ')} successfully`,
      });
    } catch (error) {
      console.error('Error updating PO status:', error);
      toast({
        title: "Error",
        description: "Failed to update purchase order status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      vendor_id: '',
      expected_delivery: '',
      priority: 'medium',
      notes: '',
      items: [{ description: '', quantity: 1, unit_price: 0, specifications: '' }]
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit_price: 0, specifications: '' }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const getStatusBadgeColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority: PurchaseOrder['priority']) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4 text-gray-600" />;
      case 'sent': return <Send className="w-4 h-4 text-blue-600" />;
      case 'acknowledged': return <CheckCircle className="w-4 h-4 text-yellow-600" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-600" />;
      case 'delivered': return <Package className="w-4 h-4 text-green-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getVendorName(po.vendor_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    const matchesVendor = vendorFilter === 'all' || po.vendor_id === vendorFilter;
    
    return matchesSearch && matchesStatus && matchesVendor;
  });

  const metrics = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter(po => po.status === 'draft').length,
    sent: purchaseOrders.filter(po => po.status === 'sent').length,
    acknowledged: purchaseOrders.filter(po => po.status === 'acknowledged').length,
    shipped: purchaseOrders.filter(po => po.status === 'shipped').length,
    delivered: purchaseOrders.filter(po => po.status === 'delivered').length,
    totalValue: purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0)
  };

  if (isLoading) {
    return (
      <ExtensibleLayout
        moduleSidebar={procurementSidebarSections}
        moduleTitle="Procurement"
        user={user}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout
      moduleSidebar={procurementSidebarSections}
      moduleTitle="Procurement"
      user={user}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">
              Create and manage purchase orders with vendors
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create PO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create New Purchase Order</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePO} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendor">Vendor *</Label>
                      <Select 
                        value={formData.vendor_id} 
                        onValueChange={(value) => setFormData({...formData, vendor_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map(vendor => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expected_delivery">Expected Delivery</Label>
                      <Input
                        id="expected_delivery"
                        type="date"
                        value={formData.expected_delivery}
                        onChange={(e) => setFormData({...formData, expected_delivery: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: PurchaseOrder['priority']) => setFormData({...formData, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Items Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Items</h3>
                      <Button type="button" variant="outline" onClick={addItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                    
                    {formData.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Item {index + 1}</h4>
                          {formData.items.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label>Description *</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                              required
                            />
                          </div>
                          <div>
                            <Label>Unit Price *</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Specifications</Label>
                          <Textarea
                            value={item.specifications}
                            onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                            rows={2}
                          />
                        </div>
                        
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">
                            Total: ${(item.quantity * item.unit_price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-right border-t pt-4">
                      <span className="text-lg font-semibold">
                        Grand Total: ${formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Purchase Order</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{metrics.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Draft</p>
                  <p className="text-xl font-bold">{metrics.draft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Acknowledged</p>
                  <p className="text-xl font-bold">{metrics.acknowledged}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Shipped</p>
                  <p className="text-xl font-bold">{metrics.shipped}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Delivered</p>
                  <p className="text-xl font-bold">{metrics.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Value</p>
                  <p className="text-lg font-bold">${metrics.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search purchase orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPOs.map((po) => (
            <Card key={po.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-1">
                      {po.po_number}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">
                      {getVendorName(po.vendor_id)}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant="outline"
                        className={getStatusBadgeColor(po.status)}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(po.status)}
                          {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                        </div>
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={getPriorityBadgeColor(po.priority)}
                      >
                        {po.priority.charAt(0).toUpperCase() + po.priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Order: {new Date(po.order_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="w-4 h-4" />
                    <span>Expected: {new Date(po.expected_delivery).toLocaleDateString()}</span>
                  </div>
                  {po.actual_delivery && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>Delivered: {new Date(po.actual_delivery).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-foreground">${po.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>{po.items.length} item{po.items.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setViewingPO(po)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Select 
                    value={po.status} 
                    onValueChange={(value: PurchaseOrder['status']) => handleStatusChange(po.id, value)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPOs.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No purchase orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || vendorFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first purchase order'
                }
              </p>
              {(!searchTerm && statusFilter === 'all' && vendorFilter === 'all') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First PO
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* View PO Dialog */}
        {viewingPO && (
          <Dialog open={!!viewingPO} onOpenChange={() => setViewingPO(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{viewingPO.po_number} - {getVendorName(viewingPO.vendor_id)}</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="items">Items ({viewingPO.items.length})</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusBadgeColor(viewingPO.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(viewingPO.status)}
                            {viewingPO.status.charAt(0).toUpperCase() + viewingPO.status.slice(1)}
                          </div>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                      <div className="mt-1">
                        <Badge className={getPriorityBadgeColor(viewingPO.priority)}>
                          {viewingPO.priority.charAt(0).toUpperCase() + viewingPO.priority.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Order Date</Label>
                      <p className="mt-1">{new Date(viewingPO.order_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Expected Delivery</Label>
                      <p className="mt-1">{new Date(viewingPO.expected_delivery).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {viewingPO.actual_delivery && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Actual Delivery</Label>
                      <p className="mt-1">{new Date(viewingPO.actual_delivery).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                    <p className="mt-1 text-2xl font-bold">${viewingPO.total_amount.toLocaleString()} {viewingPO.currency}</p>
                  </div>
                  
                  {viewingPO.notes && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                      <p className="mt-1">{viewingPO.notes}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="items" className="space-y-4">
                  <div className="space-y-4">
                    {viewingPO.items.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-2">
                            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                            <p className="mt-1 font-medium">{item.description}</p>
                            {item.specifications && (
                              <p className="text-sm text-muted-foreground mt-1">{item.specifications}</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Quantity</Label>
                            <p className="mt-1">{item.quantity}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Unit Price</Label>
                            <p className="mt-1">${item.unit_price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Item Total:</span>
                            <span className="font-semibold">${item.total_price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Grand Total:</span>
                        <span>${viewingPO.total_amount.toLocaleString()} {viewingPO.currency}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tracking" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Order Created</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(viewingPO.created_at).toLocaleString()}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    
                    {viewingPO.status !== 'draft' && (
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Send className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Order Sent to Vendor</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(viewingPO.updated_at).toLocaleString()}
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                    
                    {['acknowledged', 'shipped', 'delivered'].includes(viewingPO.status) && (
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <CheckCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Order Acknowledged</h4>
                          <p className="text-sm text-muted-foreground">Vendor confirmed the order</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                    
                    {['shipped', 'delivered'].includes(viewingPO.status) && (
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Truck className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Order Shipped</h4>
                          <p className="text-sm text-muted-foreground">Items are in transit</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                    
                    {viewingPO.status === 'delivered' && (
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Order Delivered</h4>
                          <p className="text-sm text-muted-foreground">
                            {viewingPO.actual_delivery && new Date(viewingPO.actual_delivery).toLocaleString()}
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ExtensibleLayout>
  );
} 