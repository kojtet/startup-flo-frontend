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
  FileQuestion,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Loader2,
  RefreshCw,
  DollarSign,
  Package
} from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'sent' | 'received' | 'evaluated' | 'awarded' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  deadline: string;
  budget_range: {
    min: number;
    max: number;
  };
  vendors: string[];
  quotes_received: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Quote {
  id: string;
  rfq_id: string;
  vendor_id: string;
  amount: number;
  delivery_time: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
  submitted_at: string;
  vendor?: Vendor;
}

export default function RFQsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingRFQ, setViewingRFQ] = useState<RFQ | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    deadline: '',
    budget_min: 0,
    budget_max: 0,
    priority: 'medium' as RFQ['priority'],
    selected_vendors: [] as string[]
  });

  // Mock data for demonstration
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch vendors first
        const vendorsData = await api.vendor.getVendors();
        setVendors(vendorsData);

        // Mock RFQ data
        const mockRFQs: RFQ[] = [
          {
            id: '1',
            title: 'Office Furniture Procurement',
            description: 'Request for quotes on office furniture including desks, chairs, and storage solutions',
            status: 'sent',
            priority: 'medium',
            category: 'Furniture',
            deadline: '2024-02-15',
            budget_range: { min: 50000, max: 75000 },
            vendors: ['vendor-1', 'vendor-2', 'vendor-3'],
            quotes_received: 2,
            created_by: 'user-1',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-20T14:30:00Z'
          },
          {
            id: '2',
            title: 'IT Equipment Upgrade',
            description: 'Procurement of laptops, monitors, and networking equipment',
            status: 'evaluated',
            priority: 'high',
            category: 'Technology',
            deadline: '2024-02-20',
            budget_range: { min: 100000, max: 150000 },
            vendors: ['vendor-2', 'vendor-4'],
            quotes_received: 2,
            created_by: 'user-1',
            created_at: '2024-01-10T09:00:00Z',
            updated_at: '2024-01-25T16:45:00Z'
          }
        ];

        const mockQuotes: Quote[] = [
          {
            id: '1',
            rfq_id: '1',
            vendor_id: 'vendor-1',
            amount: 65000,
            delivery_time: '3 weeks',
            notes: 'Premium quality furniture with 5-year warranty',
            status: 'pending',
            submitted_at: '2024-01-18T11:00:00Z'
          },
          {
            id: '2',
            rfq_id: '1',
            vendor_id: 'vendor-2',
            amount: 58000,
            delivery_time: '4 weeks',
            notes: 'Standard furniture with competitive pricing',
            status: 'pending',
            submitted_at: '2024-01-19T14:00:00Z'
          }
        ];

        setRfqs(mockRFQs);
        setQuotes(mockQuotes);
        
        toast({
          title: "Success",
          description: "RFQ data loaded successfully",
        });
      } catch (error) {
        console.error('Error fetching RFQ data:', error);
        toast({
          title: "Error",
          description: "Failed to load RFQ data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRFQ: RFQ = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        status: 'draft',
        priority: formData.priority,
        category: formData.category,
        deadline: formData.deadline,
        budget_range: {
          min: formData.budget_min,
          max: formData.budget_max
        },
        vendors: formData.selected_vendors,
        quotes_received: 0,
        created_by: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setRfqs([...rfqs, newRFQ]);
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: "RFQ created successfully",
      });
    } catch (error) {
      console.error('Error creating RFQ:', error);
      toast({
        title: "Error",
        description: "Failed to create RFQ",
        variant: "destructive",
      });
    }
  };

  const handleSendRFQ = async (rfqId: string) => {
    try {
      setRfqs(rfqs.map(rfq => 
        rfq.id === rfqId 
          ? { ...rfq, status: 'sent' as const, updated_at: new Date().toISOString() }
          : rfq
      ));
      
      toast({
        title: "Success",
        description: "RFQ sent to vendors successfully",
      });
    } catch (error) {
      console.error('Error sending RFQ:', error);
      toast({
        title: "Error",
        description: "Failed to send RFQ",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      deadline: '',
      budget_min: 0,
      budget_max: 0,
      priority: 'medium',
      selected_vendors: []
    });
  };

  const getStatusBadgeColor = (status: RFQ['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'received': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'evaluated': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'awarded': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority: RFQ['priority']) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: RFQ['status']) => {
    switch (status) {
      case 'draft': return <FileQuestion className="w-4 h-4 text-gray-600" />;
      case 'sent': return <Send className="w-4 h-4 text-blue-600" />;
      case 'received': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'evaluated': return <BarChart3 className="w-4 h-4 text-purple-600" />;
      case 'awarded': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  };

  const filteredRFQs = rfqs.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfq.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || rfq.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const metrics = {
    total: rfqs.length,
    draft: rfqs.filter(r => r.status === 'draft').length,
    sent: rfqs.filter(r => r.status === 'sent').length,
    received: rfqs.filter(r => r.status === 'received').length,
    evaluated: rfqs.filter(r => r.status === 'evaluated').length,
    awarded: rfqs.filter(r => r.status === 'awarded').length
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Request for Quotes (RFQs)</h1>
            <p className="text-muted-foreground">
              Create and manage RFQs for procurement processes
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create RFQ
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileQuestion className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total RFQs</p>
                  <p className="text-xl font-bold">{metrics.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Sent</p>
                  <p className="text-xl font-bold">{metrics.sent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">{metrics.received}</p>
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
                  <p className="text-xs font-medium text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">{metrics.awarded}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent RFQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Office Furniture Procurement</h4>
                  <p className="text-sm text-muted-foreground">Desks, chairs, and storage solutions</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Sent</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">IT Equipment Upgrade</h4>
                  <p className="text-sm text-muted-foreground">Laptops and networking equipment</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Cleaning Services Contract</h4>
                  <p className="text-sm text-muted-foreground">Office cleaning and maintenance</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ExtensibleLayout>
  );
} 