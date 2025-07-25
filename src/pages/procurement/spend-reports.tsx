import React, { useState, useEffect } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { useAuth } from '@/contexts/AuthContext';
import { procurementSidebarSections } from '@/components/sidebars/ProcurementSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/apis';
import type { Vendor } from '@/apis/types';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Filter,
  Search,
  PieChart,
  Users,
  Package,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface SpendData {
  id: string;
  vendor_id: string;
  vendor_name: string;
  category: string;
  amount: number;
  date: string;
  month: string;
  quarter: string;
  year: string;
  type: 'purchase_order' | 'contract' | 'invoice';
  status: 'pending' | 'approved' | 'paid';
}

interface SpendSummary {
  totalSpend: number;
  monthlySpend: number;
  quarterlySpend: number;
  yearlySpend: number;
  topVendors: { vendor_name: string; amount: number; percentage: number }[];
  spendByCategory: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; amount: number }[];
  quarterlyTrend: { quarter: string; amount: number }[];
}

export default function SpendReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Create user object for ExtensibleLayout
  const layoutUser = user ? {
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatar_url,
    companyId: user.company_id
  } : {
    name: '',
    email: '',
    role: '',
    avatarUrl: undefined,
    companyId: undefined
  };
  
  const [spendData, setSpendData] = useState<SpendData[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [summary, setSummary] = useState<SpendSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('year');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Date filters
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Mock data for demonstration
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch vendors
        const vendorsData = await api.vendor.getVendors();
        setVendors(vendorsData);

        // Mock spend data
        const mockSpendData: SpendData[] = [
          {
            id: '1',
            vendor_id: 'vendor-1',
            vendor_name: 'TechCorp Solutions',
            category: 'Technology',
            amount: 125000,
            date: '2024-01-15',
            month: '2024-01',
            quarter: '2024-Q1',
            year: '2024',
            type: 'purchase_order',
            status: 'paid'
          },
          {
            id: '2',
            vendor_id: 'vendor-2',
            vendor_name: 'Office Supplies Inc',
            category: 'Office Supplies',
            amount: 15000,
            date: '2024-01-20',
            month: '2024-01',
            quarter: '2024-Q1',
            year: '2024',
            type: 'contract',
            status: 'paid'
          },
          {
            id: '3',
            vendor_id: 'vendor-3',
            vendor_name: 'Furniture World',
            category: 'Furniture',
            amount: 45000,
            date: '2024-02-10',
            month: '2024-02',
            quarter: '2024-Q1',
            year: '2024',
            type: 'purchase_order',
            status: 'paid'
          },
          {
            id: '4',
            vendor_id: 'vendor-1',
            vendor_name: 'TechCorp Solutions',
            category: 'Technology',
            amount: 75000,
            date: '2024-02-25',
            month: '2024-02',
            quarter: '2024-Q1',
            year: '2024',
            type: 'invoice',
            status: 'pending'
          },
          {
            id: '5',
            vendor_id: 'vendor-4',
            vendor_name: 'Clean Pro Services',
            category: 'Services',
            amount: 8000,
            date: '2024-03-05',
            month: '2024-03',
            quarter: '2024-Q1',
            year: '2024',
            type: 'contract',
            status: 'approved'
          },
          {
            id: '6',
            vendor_id: 'vendor-2',
            vendor_name: 'Office Supplies Inc',
            category: 'Office Supplies',
            amount: 12000,
            date: '2024-03-15',
            month: '2024-03',
            quarter: '2024-Q1',
            year: '2024',
            type: 'purchase_order',
            status: 'paid'
          }
        ];

        setSpendData(mockSpendData);

        // Calculate summary
        const totalSpend = mockSpendData.reduce((sum, item) => sum + item.amount, 0);
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentQuarter = `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
        const currentYear = new Date().getFullYear().toString();

        const monthlySpend = mockSpendData
          .filter(item => item.month === currentMonth)
          .reduce((sum, item) => sum + item.amount, 0);

        const quarterlySpend = mockSpendData
          .filter(item => item.quarter === currentQuarter)
          .reduce((sum, item) => sum + item.amount, 0);

        const yearlySpend = mockSpendData
          .filter(item => item.year === currentYear)
          .reduce((sum, item) => sum + item.amount, 0);

        // Top vendors
        const vendorSpend = mockSpendData.reduce((acc, item) => {
          acc[item.vendor_name] = (acc[item.vendor_name] || 0) + item.amount;
          return acc;
        }, {} as Record<string, number>);

        const topVendors = Object.entries(vendorSpend)
          .map(([vendor_name, amount]) => ({
            vendor_name,
            amount,
            percentage: (amount / totalSpend) * 100
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        // Spend by category
        const categorySpend = mockSpendData.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + item.amount;
          return acc;
        }, {} as Record<string, number>);

        const spendByCategory = Object.entries(categorySpend)
          .map(([category, amount]) => ({
            category,
            amount,
            percentage: (amount / totalSpend) * 100
          }))
          .sort((a, b) => b.amount - a.amount);

        // Monthly trend
        const monthlyTrend = mockSpendData.reduce((acc, item) => {
          acc[item.month] = (acc[item.month] || 0) + item.amount;
          return acc;
        }, {} as Record<string, number>);

        const monthlyTrendArray = Object.entries(monthlyTrend)
          .map(([month, amount]) => ({ month, amount }))
          .sort((a, b) => a.month.localeCompare(b.month));

        // Quarterly trend
        const quarterlyTrend = mockSpendData.reduce((acc, item) => {
          acc[item.quarter] = (acc[item.quarter] || 0) + item.amount;
          return acc;
        }, {} as Record<string, number>);

        const quarterlyTrendArray = Object.entries(quarterlyTrend)
          .map(([quarter, amount]) => ({ quarter, amount }))
          .sort((a, b) => a.quarter.localeCompare(b.quarter));

        setSummary({
          totalSpend,
          monthlySpend,
          quarterlySpend,
          yearlySpend,
          topVendors,
          spendByCategory,
          monthlyTrend: monthlyTrendArray,
          quarterlyTrend: quarterlyTrendArray
        });
        
        toast({
          title: "Success",
          description: "Spend reports loaded successfully",
        });
      } catch (error) {
        console.error('Error fetching spend data:', error);
        toast({
          title: "Error",
          description: "Failed to load spend reports",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportReport = () => {
    toast({
      title: "Export Started",
      description: "Your spend report is being prepared for download",
    });
  };

  const getStatusBadgeColor = (status: SpendData['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeBadgeColor = (type: SpendData['type']) => {
    switch (type) {
      case 'purchase_order': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contract': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'invoice': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredSpendData = spendData.filter(item => {
    const matchesSearch = item.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesVendor = vendorFilter === 'all' || item.vendor_id === vendorFilter;
    const matchesDateRange = item.date >= dateRange.start && item.date <= dateRange.end;
    
    return matchesSearch && matchesCategory && matchesVendor && matchesDateRange;
  });

  const categories = [...new Set(spendData.map(item => item.category))];

  if (isLoading) {
    return (
      <ExtensibleLayout
        moduleSidebar={procurementSidebarSections}
        moduleTitle="Procurement"
        user={layoutUser}
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
      user={layoutUser}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Spend Reports</h1>
            <p className="text-muted-foreground">
              Analyze procurement spending patterns and vendor performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                    <p className="text-2xl font-bold">${summary.totalSpend.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">${summary.monthlySpend.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Quarter</p>
                    <p className="text-2xl font-bold">${summary.quarterlySpend.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Year</p>
                    <p className="text-2xl font-bold">${summary.yearlySpend.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search vendors or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="start_date" className="text-sm font-medium">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="end_date" className="text-sm font-medium">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Vendor</Label>
                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger>
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

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vendors">Top Vendors</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Monthly Spend Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {summary.monthlyTrend.map((item, index) => (
                        <div key={item.month} className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {new Date(item.month + '-01').toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${(item.amount / Math.max(...summary.monthlyTrend.map(t => t.amount))) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold min-w-[80px] text-right">
                              ${item.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Spend by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {summary.spendByCategory.map((item, index) => (
                        <div key={item.category} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.category}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  index === 0 ? 'bg-blue-600' :
                                  index === 1 ? 'bg-green-600' :
                                  index === 2 ? 'bg-purple-600' :
                                  index === 3 ? 'bg-orange-600' :
                                  'bg-gray-600'
                                }`}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold min-w-[80px] text-right">
                              ${item.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="vendors" className="space-y-6">
            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Top Vendors by Spend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary.topVendors.map((vendor, index) => (
                      <div key={vendor.vendor_name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-600' :
                            'bg-blue-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">{vendor.vendor_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {vendor.percentage.toFixed(1)}% of total spend
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${vendor.amount.toLocaleString()}</p>
                          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${vendor.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-6">
            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Spend Analysis by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summary.spendByCategory.map((category, index) => (
                      <Card key={category.category}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold">{category.category}</h4>
                            <Badge variant="outline">
                              {category.percentage.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Total Spend</span>
                              <span className="font-semibold">${category.amount.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  index === 0 ? 'bg-blue-600' :
                                  index === 1 ? 'bg-green-600' :
                                  index === 2 ? 'bg-purple-600' :
                                  index === 3 ? 'bg-orange-600' :
                                  'bg-gray-600'
                                }`}
                                style={{ width: `${category.percentage}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSpendData
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 20)
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{transaction.vendor_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">${transaction.amount.toLocaleString()}</p>
                            <div className="flex gap-2">
                              <Badge 
                                variant="outline"
                                className={getTypeBadgeColor(transaction.type)}
                              >
                                {transaction.type.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className={getStatusBadgeColor(transaction.status)}
                              >
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {filteredSpendData.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search criteria or date range
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Transaction</p>
                  <p className="text-2xl font-bold">
                    ${spendData.length > 0 ? (spendData.reduce((sum, item) => sum + item.amount, 0) / spendData.length).toLocaleString() : 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{spendData.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
                  <p className="text-2xl font-bold">{new Set(spendData.map(item => item.vendor_id)).size}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExtensibleLayout>
  );
} 