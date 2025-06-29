import React, { useState, useEffect } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { useAuth } from '@/contexts/AuthContext';
import { procurementSidebarSections } from '@/components/sidebars/ProcurementSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import api from '@/apis';
import type { Vendor } from '@/apis/types';
import {
  FileClock,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  Download,
  Bell,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface Contract {
  id: string;
  contract_number: string;
  title: string;
  vendor_id: string;
  contract_type: 'service' | 'supply' | 'maintenance' | 'license' | 'other';
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';
  start_date: string;
  end_date: string;
  value: number;
  currency: string;
  auto_renewal: boolean;
  renewal_notice_days: number;
  description?: string;
  terms_conditions?: string;
  payment_terms?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
}

export default function ContractsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expiryFilter, setExpiryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [formData, setFormData] = useState({
    title: '',
    vendor_id: '',
    contract_type: 'service' as Contract['contract_type'],
    start_date: '',
    end_date: '',
    value: 0,
    auto_renewal: false,
    renewal_notice_days: 30,
    description: '',
    terms_conditions: '',
    payment_terms: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch vendors
        const vendorsData = await api.vendor.getVendors();
        setVendors(vendorsData);

        // Mock contracts data
        const mockContracts: Contract[] = [
          {
            id: '1',
            contract_number: 'CT-2024-001',
            title: 'Software Licensing Agreement',
            vendor_id: 'vendor-1',
            contract_type: 'license',
            status: 'active',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            value: 50000,
            currency: 'USD',
            auto_renewal: true,
            renewal_notice_days: 60,
            description: 'Annual software licensing for productivity suite',
            payment_terms: 'Net 30',
            created_by: 'user-1',
            created_at: '2023-12-15T10:00:00Z',
            updated_at: '2023-12-15T10:00:00Z'
          },
          {
            id: '2',
            contract_number: 'CT-2024-002',
            title: 'Office Cleaning Services',
            vendor_id: 'vendor-2',
            contract_type: 'service',
            status: 'active',
            start_date: '2024-01-15',
            end_date: '2024-07-15',
            value: 18000,
            currency: 'USD',
            auto_renewal: false,
            renewal_notice_days: 30,
            description: 'Daily office cleaning and maintenance services',
            payment_terms: 'Monthly in advance',
            created_by: 'user-1',
            created_at: '2024-01-01T09:00:00Z',
            updated_at: '2024-01-01T09:00:00Z'
          },
          {
            id: '3',
            contract_number: 'CT-2023-015',
            title: 'IT Equipment Maintenance',
            vendor_id: 'vendor-3',
            contract_type: 'maintenance',
            status: 'expired',
            start_date: '2023-06-01',
            end_date: '2024-01-31',
            value: 25000,
            currency: 'USD',
            auto_renewal: false,
            renewal_notice_days: 45,
            description: 'Comprehensive IT equipment maintenance and support',
            payment_terms: 'Quarterly',
            created_by: 'user-2',
            created_at: '2023-05-15T14:30:00Z',
            updated_at: '2024-02-01T09:00:00Z'
          },
          {
            id: '4',
            contract_number: 'CT-2024-003',
            title: 'Office Supplies Contract',
            vendor_id: 'vendor-4',
            contract_type: 'supply',
            status: 'active',
            start_date: '2024-02-01',
            end_date: '2024-04-15',
            value: 12000,
            currency: 'USD',
            auto_renewal: true,
            renewal_notice_days: 14,
            description: 'Quarterly office supplies and stationery',
            payment_terms: 'Upon delivery',
            created_by: 'user-1',
            created_at: '2024-01-25T11:15:00Z',
            updated_at: '2024-01-25T11:15:00Z'
          }
        ];

        setContracts(mockContracts);
        
        toast({
          title: "Success",
          description: "Contracts loaded successfully",
        });
      } catch (error) {
        console.error('Error fetching contracts:', error);
        toast({
          title: "Error",
          description: "Failed to load contracts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateContractNumber = () => {
    const year = new Date().getFullYear();
    const count = contracts.length + 1;
    return `CT-${year}-${count.toString().padStart(3, '0')}`;
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newContract: Contract = {
        id: Date.now().toString(),
        contract_number: generateContractNumber(),
        title: formData.title,
        vendor_id: formData.vendor_id,
        contract_type: formData.contract_type,
        status: 'draft',
        start_date: formData.start_date,
        end_date: formData.end_date,
        value: formData.value,
        currency: 'USD',
        auto_renewal: formData.auto_renewal,
        renewal_notice_days: formData.renewal_notice_days,
        description: formData.description,
        terms_conditions: formData.terms_conditions,
        payment_terms: formData.payment_terms,
        created_by: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setContracts([...contracts, newContract]);
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: "Contract created successfully",
      });
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: "Error",
        description: "Failed to create contract",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (contractId: string, newStatus: Contract['status']) => {
    try {
      setContracts(contracts.map(contract => 
        contract.id === contractId 
          ? { ...contract, status: newStatus, updated_at: new Date().toISOString() }
          : contract
      ));
      
      toast({
        title: "Success",
        description: `Contract ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Error updating contract status:', error);
      toast({
        title: "Error",
        description: "Failed to update contract status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      vendor_id: '',
      contract_type: 'service',
      start_date: '',
      end_date: '',
      value: 0,
      auto_renewal: false,
      renewal_notice_days: 30,
      description: '',
      terms_conditions: '',
      payment_terms: ''
    });
  };

  const getStatusBadgeColor = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'terminated': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'renewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeBadgeColor = (type: Contract['contract_type']) => {
    switch (type) {
      case 'service': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supply': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'license': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4 text-gray-600" />;
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'terminated': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'renewed': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiryDate = new Date(endDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (contract: Contract) => {
    const daysUntilExpiry = getDaysUntilExpiry(contract.end_date);
    
    if (contract.status === 'expired') return 'expired';
    if (daysUntilExpiry < 0) return 'overdue';
    if (daysUntilExpiry <= contract.renewal_notice_days) return 'expiring-soon';
    return 'active';
  };

  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getVendorName(contract.vendor_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.contract_type === typeFilter;
    
    let matchesExpiry = true;
    if (expiryFilter !== 'all') {
      const expiryStatus = getExpiryStatus(contract);
      matchesExpiry = expiryStatus === expiryFilter;
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesExpiry;
  });

  const metrics = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    expired: contracts.filter(c => c.status === 'expired').length,
    expiringSoon: contracts.filter(c => getExpiryStatus(c) === 'expiring-soon').length,
    totalValue: contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0),
    autoRenewal: contracts.filter(c => c.auto_renewal && c.status === 'active').length
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
            <h1 className="text-3xl font-bold tracking-tight">Contracts & Expiry</h1>
            <p className="text-muted-foreground">
              Manage vendor contracts and track expiration dates
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
                  Create Contract
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Contract</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateContract} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="title">Contract Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>
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
                      <Label htmlFor="contract_type">Contract Type</Label>
                      <Select 
                        value={formData.contract_type} 
                        onValueChange={(value: Contract['contract_type']) => setFormData({...formData, contract_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="supply">Supply</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="license">License</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="value">Contract Value</Label>
                      <Input
                        id="value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="renewal_notice_days">Renewal Notice (Days)</Label>
                      <Input
                        id="renewal_notice_days"
                        type="number"
                        min="1"
                        value={formData.renewal_notice_days}
                        onChange={(e) => setFormData({...formData, renewal_notice_days: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      id="auto_renewal"
                      type="checkbox"
                      checked={formData.auto_renewal}
                      onChange={(e) => setFormData({...formData, auto_renewal: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="auto_renewal">Enable Auto-renewal</Label>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Input
                      id="payment_terms"
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                      placeholder="e.g., Net 30, Monthly in advance"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Contract</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Alert for expiring contracts */}
        {metrics.expiringSoon > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-yellow-800">Contracts Expiring Soon</h4>
                  <p className="text-sm text-yellow-600">
                    {metrics.expiringSoon} contract{metrics.expiringSoon !== 1 ? 's' : ''} require{metrics.expiringSoon === 1 ? 's' : ''} your attention for renewal.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExpiryFilter('expiring-soon')}
                  className="ml-auto"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileClock className="w-5 h-5 text-blue-600" />
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
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Active</p>
                  <p className="text-xl font-bold">{metrics.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Expired</p>
                  <p className="text-xl font-bold">{metrics.expired}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Expiring Soon</p>
                  <p className="text-xl font-bold">{metrics.expiringSoon}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Auto-renewal</p>
                  <p className="text-xl font-bold">{metrics.autoRenewal}</p>
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
                  <p className="text-xs font-medium text-muted-foreground">Active Value</p>
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
                    placeholder="Search contracts..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                    <SelectItem value="renewed">Renewed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="supply">Supply</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={expiryFilter} onValueChange={setExpiryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Contracts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contracts</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => {
            const expiryStatus = getExpiryStatus(contract);
            const daysUntilExpiry = getDaysUntilExpiry(contract.end_date);
            
            return (
              <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold mb-1">
                        {contract.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">
                        {contract.contract_number} • {getVendorName(contract.vendor_id)}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant="outline"
                          className={getStatusBadgeColor(contract.status)}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(contract.status)}
                            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                          </div>
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={getTypeBadgeColor(contract.contract_type)}
                        >
                          {contract.contract_type.charAt(0).toUpperCase() + contract.contract_type.slice(1)}
                        </Badge>
                        {contract.auto_renewal && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Auto-renewal
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-foreground">${contract.value.toLocaleString()} {contract.currency}</span>
                    </div>
                    
                    {/* Expiry warning */}
                    {expiryStatus === 'expiring-soon' && (
                      <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Expires in {daysUntilExpiry} days</span>
                      </div>
                    )}
                    
                    {expiryStatus === 'expired' && (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-2 py-1 rounded text-xs">
                        <XCircle className="w-3 h-3" />
                        <span>Expired {Math.abs(daysUntilExpiry)} days ago</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setViewingContract(contract)}
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
                      value={contract.status} 
                      onValueChange={(value: Contract['status']) => handleStatusChange(contract.id, value)}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                        <SelectItem value="renewed">Renewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredContracts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileClock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || expiryFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first contract'
                }
              </p>
              {(!searchTerm && statusFilter === 'all' && typeFilter === 'all' && expiryFilter === 'all') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Contract
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* View Contract Dialog */}
        {viewingContract && (
          <Dialog open={!!viewingContract} onOpenChange={() => setViewingContract(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{viewingContract.contract_number} - {viewingContract.title}</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusBadgeColor(viewingContract.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(viewingContract.status)}
                            {viewingContract.status.charAt(0).toUpperCase() + viewingContract.status.slice(1)}
                          </div>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                      <div className="mt-1">
                        <Badge className={getTypeBadgeColor(viewingContract.contract_type)}>
                          {viewingContract.contract_type.charAt(0).toUpperCase() + viewingContract.contract_type.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Vendor</Label>
                    <p className="mt-1 text-lg font-semibold">{getVendorName(viewingContract.vendor_id)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                      <p className="mt-1">{new Date(viewingContract.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                      <p className="mt-1">{new Date(viewingContract.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contract Value</Label>
                    <p className="mt-1 text-2xl font-bold">${viewingContract.value.toLocaleString()} {viewingContract.currency}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Auto-renewal</Label>
                      <p className="mt-1">{viewingContract.auto_renewal ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Renewal Notice</Label>
                      <p className="mt-1">{viewingContract.renewal_notice_days} days</p>
                    </div>
                  </div>
                  
                  {viewingContract.description && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="mt-1">{viewingContract.description}</p>
                    </div>
                  )}
                  
                  {viewingContract.payment_terms && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Payment Terms</Label>
                      <p className="mt-1">{viewingContract.payment_terms}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="terms" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Terms & Conditions</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                      {viewingContract.terms_conditions ? (
                        <p className="whitespace-pre-wrap">{viewingContract.terms_conditions}</p>
                      ) : (
                        <p className="text-muted-foreground italic">No terms and conditions specified</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="timeline" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Contract Created</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(viewingContract.created_at).toLocaleString()}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    
                    {viewingContract.status !== 'draft' && (
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Contract Activated</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(viewingContract.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        getDaysUntilExpiry(viewingContract.end_date) <= 0 
                          ? 'bg-red-100' 
                          : getDaysUntilExpiry(viewingContract.end_date) <= viewingContract.renewal_notice_days
                          ? 'bg-yellow-100'
                          : 'bg-gray-100'
                      }`}>
                        <Calendar className={`w-5 h-5 ${
                          getDaysUntilExpiry(viewingContract.end_date) <= 0 
                            ? 'text-red-600' 
                            : getDaysUntilExpiry(viewingContract.end_date) <= viewingContract.renewal_notice_days
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Contract End Date</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(viewingContract.end_date).toLocaleDateString()}
                        </p>
                        {getDaysUntilExpiry(viewingContract.end_date) > 0 && (
                          <p className="text-sm font-medium">
                            {getDaysUntilExpiry(viewingContract.end_date)} days remaining
                          </p>
                        )}
                      </div>
                      {getDaysUntilExpiry(viewingContract.end_date) <= 0 ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : getDaysUntilExpiry(viewingContract.end_date) <= viewingContract.renewal_notice_days ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
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