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
import type { Asset } from '@/apis/types';
import { TrendingDown, Download, Search, DollarSign, Loader2, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { transformUserForLayout } from '@/lib/utils';

export default function DepreciationReportPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const assetsResponse = await api.assets.getAssets();
      setAssets(assetsResponse || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch depreciation data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDepreciation = (asset: Asset) => {
    if (!asset.purchase_date || !asset.purchase_cost) return null;
    
    const purchaseDate = new Date(asset.purchase_date);
    const currentDate = new Date();
    const yearsOwned = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const usefulLife = asset.useful_life_years || 5;
    
    const annualDepreciation = asset.purchase_cost / usefulLife;
    const accumulatedDepreciation = Math.min(annualDepreciation * yearsOwned, asset.purchase_cost);
    const bookValue = Math.max(asset.purchase_cost - accumulatedDepreciation, 0);
    const depreciationPercent = (accumulatedDepreciation / asset.purchase_cost) * 100;
    
    return {
      purchase_cost: asset.purchase_cost,
      accumulated_depreciation: accumulatedDepreciation,
      book_value: bookValue,
      annual_depreciation: annualDepreciation,
      depreciation_percent: Math.min(depreciationPercent, 100)
    };
  };

  const getTotalMetrics = () => {
    const totalPurchaseCost = assets.reduce((sum, asset) => sum + (asset.purchase_cost || 0), 0);
    let totalAccumulatedDepreciation = 0;
    let totalBookValue = 0;
    
    assets.forEach(asset => {
      const calc = calculateDepreciation(asset);
      if (calc) {
        totalAccumulatedDepreciation += calc.accumulated_depreciation;
        totalBookValue += calc.book_value;
      }
    });
    
    return {
      totalPurchaseCost,
      totalAccumulatedDepreciation,
      totalBookValue,
      averageDepreciationPercent: totalPurchaseCost > 0 ? (totalAccumulatedDepreciation / totalPurchaseCost) * 100 : 0
    };
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.asset_tag.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const metrics = getTotalMetrics();

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
    <ExtensibleLayout 
      moduleSidebar={assetsSidebarSections} 
      moduleTitle="Asset Management" 
      user={transformUserForLayout(user)}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Depreciation Report</h1>
            <p className="text-muted-foreground">Track asset depreciation and calculate book values</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchase Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics.totalPurchaseCost.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Original asset value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accumulated Depreciation</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${metrics.totalAccumulatedDepreciation.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total depreciated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Book Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${metrics.totalBookValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Current net value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Depreciation</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.averageDepreciationPercent.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Portfolio average</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Asset Depreciation Details */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAssets.map((asset) => {
              const calc = calculateDepreciation(asset);
              if (!calc) return null;
              
              return (
                <Card key={asset.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{asset.name}</h3>
                            <p className="text-sm text-gray-500">#{asset.asset_tag}</p>
                          </div>
                          <Badge variant="outline">
                            {asset.depreciation_method?.replace('_', ' ').toUpperCase() || 'STRAIGHT LINE'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Purchase Cost:</span>
                            <div className="font-semibold">${calc.purchase_cost.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Accumulated Depreciation:</span>
                            <div className="font-semibold text-red-600">
                              ${calc.accumulated_depreciation.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Book Value:</span>
                            <div className="font-semibold text-green-600">
                              ${calc.book_value.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Depreciation:</span>
                            <div className="font-semibold">
                              {calc.depreciation_percent.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Depreciation Progress</span>
                            <span>{calc.depreciation_percent.toFixed(1)}%</span>
                          </div>
                          <Progress value={calc.depreciation_percent} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ExtensibleLayout>
  );
} 