import React, { useState, useEffect } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { assetsSidebarSections } from '@/components/sidebars/AssetsSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/apis';
import type { Asset, AssetMaintenance } from '@/apis/types';
import { 
  Calendar, 
  Plus, 
  Search, 
  Wrench, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Filter,
  CalendarDays
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MaintenanceCalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<AssetMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [assetsResponse] = await Promise.all([
        api.assets.getAssets()
      ]);

      setAssets(assetsResponse || []);
      
      // Fetch maintenance records for each asset
      if (assetsResponse) {
        const maintenancePromises = assetsResponse.map(asset => 
          api.assets.getAssetMaintenanceHistory(asset.id).catch(() => [])
        );
        
        const maintenanceResults = await Promise.all(maintenancePromises);
        const allMaintenance = maintenanceResults.flat();
        setMaintenanceRecords(allMaintenance);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch maintenance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Wrench className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getUpcomingMaintenance = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return maintenanceRecords.filter(record => {
      if (!record.scheduled_date) return false;
      const scheduledDate = new Date(record.scheduled_date);
      return scheduledDate >= today && scheduledDate <= nextWeek && record.status === 'pending';
    });
  };

  const getOverdueMaintenance = () => {
    const today = new Date();
    return maintenanceRecords.filter(record => {
      if (!record.scheduled_date) return false;
      const scheduledDate = new Date(record.scheduled_date);
      return scheduledDate < today && record.status === 'pending';
    });
  };

  const filteredMaintenance = maintenanceRecords.filter(record => {
    const asset = assets.find(a => a.id === record.asset_id);
    const matchesSearch = asset?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.maintenance_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return (
      <ExtensibleLayout moduleSidebar={assetsSidebarSections} moduleTitle="Asset Management" user={null}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={assetsSidebarSections} moduleTitle="Asset Management" user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Calendar</h1>
            <p className="text-muted-foreground">
              Schedule and track asset maintenance activities
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Maintenance
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceRecords.length}</div>
              <p className="text-xs text-muted-foreground">All time records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUpcomingMaintenance().length}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {getOverdueMaintenance().length}
              </div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {maintenanceRecords.filter(r => r.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Maintenance Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium mb-4">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>
                
                {/* Simple calendar grid - could be enhanced with a proper calendar component */}
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => (
                    <div key={i} className="aspect-square p-2 border rounded-md text-sm">
                      {i + 1 <= 31 && (
                        <div>
                          <div className="font-medium">{i + 1}</div>
                          {/* Maintenance indicators would go here */}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search maintenance records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Maintenance List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMaintenance.map((record) => {
                  const asset = assets.find(a => a.id === record.asset_id);
                  return (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center space-x-2">
                                {getMaintenanceIcon(record.status)}
                                <h3 className="text-lg font-semibold">
                                  {record.maintenance_type || 'Maintenance'}
                                </h3>
                              </div>
                              <Badge className={`${getMaintenanceStatusColor(record.status)} border-0`}>
                                {record.status.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-500">Asset:</span>
                                <span className="ml-2 font-medium">{asset?.name || 'Unknown'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Scheduled:</span>
                                <span className="ml-2">
                                  {record.scheduled_date 
                                    ? new Date(record.scheduled_date).toLocaleDateString()
                                    : 'Not scheduled'
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Cost:</span>
                                <span className="ml-2">
                                  ${record.cost ? record.cost.toLocaleString() : '0'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Technician:</span>
                                <span className="ml-2">{record.technician || 'Unassigned'}</span>
                              </div>
                            </div>
                            
                            {record.description && (
                              <p className="text-sm text-gray-600">{record.description}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="space-y-4">
              {getUpcomingMaintenance().map((record) => {
                const asset = assets.find(a => a.id === record.asset_id);
                return (
                  <Card key={record.id} className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{asset?.name}</h3>
                          <p className="text-sm text-gray-600">
                            {record.maintenance_type} - Due {new Date(record.scheduled_date!).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                          Upcoming
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="overdue" className="space-y-6">
            <div className="space-y-4">
              {getOverdueMaintenance().map((record) => {
                const asset = assets.find(a => a.id === record.asset_id);
                return (
                  <Card key={record.id} className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{asset?.name}</h3>
                          <p className="text-sm text-gray-600">
                            {record.maintenance_type} - Overdue since {new Date(record.scheduled_date!).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-red-700 border-red-300">
                          Overdue
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ExtensibleLayout>
  );
} 