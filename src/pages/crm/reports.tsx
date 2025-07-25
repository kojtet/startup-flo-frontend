import { useState, useEffect } from "react";
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { crmSidebarSections } from "@/components/sidebars/CRMSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/apis";
import type { SalesReport, LeadReport, ActivityReport, CampaignReport } from "@/apis/types";
import { 
  BarChart2, 
  Download, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Award,
  Filter,
  Loader2,
  FileText,
  Mail,
  Phone,
  Eye,
  MousePointer
} from "lucide-react";

export default function SalesReports() {
  const { toast } = useToast();
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [leadReport, setLeadReport] = useState<LeadReport | null>(null);
  const [activityReport, setActivityReport] = useState<ActivityReport | null>(null);
  const [campaignReport, setCampaignReport] = useState<CampaignReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>("30");
  const [activeTab, setActiveTab] = useState("sales");

  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Refresh reports when date range changes
  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const days = parseInt(dateRange);
      const params = { days };

      // Fetch all reports in parallel
      const [salesData, leadData, activityData, campaignData] = await Promise.all([
        api.crm.getSalesReport(params),
        api.crm.getLeadReport(params),
        api.crm.getActivityReport(params),
        api.crm.getCampaignReport(params)
      ]);

      setSalesReport(salesData);
      setLeadReport(leadData);
      setActivityReport(activityData);
      setCampaignReport(campaignData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportType: string) => {
    try {
      const days = parseInt(dateRange);
      const blob = await api.crm.exportReport(reportType, { days });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
      console.error("Error exporting report:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management" >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading reports...</span>
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management" >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 className="h-8 w-8" />
              Sales Reports
            </h1>
            <p className="text-gray-600 mt-2">Analyze your sales performance and track key metrics</p>
          </div>
          
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="sales">Sales Performance</TabsTrigger>
            <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
            <TabsTrigger value="activities">Activity Summary</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign Results</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-6">
            <div className="space-y-6">
              {/* Sales Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(salesReport?.total_revenue || 0)}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(salesReport?.revenue_change || 0)}`}>
                      {getChangeIcon(salesReport?.revenue_change || 0)}
                      {formatPercentage(Math.abs(salesReport?.revenue_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deals Closed</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{salesReport?.deals_closed || 0}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(salesReport?.deals_change || 0)}`}>
                      {getChangeIcon(salesReport?.deals_change || 0)}
                      {formatPercentage(Math.abs(salesReport?.deals_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(salesReport?.avg_deal_size || 0)}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(salesReport?.avg_deal_change || 0)}`}>
                      {getChangeIcon(salesReport?.avg_deal_change || 0)}
                      {formatPercentage(Math.abs(salesReport?.avg_deal_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(salesReport?.win_rate || 0)}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(salesReport?.win_rate_change || 0)}`}>
                      {getChangeIcon(salesReport?.win_rate_change || 0)}
                      {formatPercentage(Math.abs(salesReport?.win_rate_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sales by Stage */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Sales Pipeline by Stage</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('sales')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesReport?.pipeline_by_stage?.map((stage) => (
                      <div key={stage.stage_name} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{stage.stage_name}</span>
                            <span className="text-sm text-gray-600">
                              {stage.count} deals • {formatCurrency(stage.value)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(stage.value / (salesReport?.total_pipeline || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Sales Reps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesReport?.top_performers?.map((rep, index) => (
                      <div key={rep.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{rep.name}</div>
                            <div className="text-sm text-gray-600">{rep.deals_closed} deals closed</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(rep.revenue)}</div>
                          <div className="text-sm text-gray-600">{formatPercentage(rep.win_rate)} win rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <div className="space-y-6">
              {/* Lead Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{leadReport?.total_leads || 0}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(leadReport?.leads_change || 0)}`}>
                      {getChangeIcon(leadReport?.leads_change || 0)}
                      {formatPercentage(Math.abs(leadReport?.leads_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{leadReport?.qualified_leads || 0}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(leadReport?.qualified_change || 0)}`}>
                      {getChangeIcon(leadReport?.qualified_change || 0)}
                      {formatPercentage(Math.abs(leadReport?.qualified_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(leadReport?.conversion_rate || 0)}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(leadReport?.conversion_change || 0)}`}>
                      {getChangeIcon(leadReport?.conversion_change || 0)}
                      {formatPercentage(Math.abs(leadReport?.conversion_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Time to Close</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{leadReport?.avg_time_to_close || 0} days</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(-(leadReport?.time_change || 0))}`}>
                      {getChangeIcon(-(leadReport?.time_change || 0))}
                      {Math.abs(leadReport?.time_change || 0)} days from last period
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Sources */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Lead Sources Performance</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('leads')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leadReport?.sources?.map((source) => (
                      <div key={source.source_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{source.source_name}</div>
                          <div className="text-sm text-gray-600">{source.leads_count} leads</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatPercentage(source.conversion_rate)}</div>
                          <div className="text-sm text-gray-600">conversion rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <div className="space-y-6">
              {/* Activity Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activityReport?.total_activities || 0}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(activityReport?.activities_change || 0)}`}>
                      {getChangeIcon(activityReport?.activities_change || 0)}
                      {formatPercentage(Math.abs(activityReport?.activities_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Calls Made</CardTitle>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activityReport?.calls_made || 0}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(activityReport?.calls_change || 0)}`}>
                      {getChangeIcon(activityReport?.calls_change || 0)}
                      {formatPercentage(Math.abs(activityReport?.calls_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activityReport?.emails_sent || 0}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(activityReport?.emails_change || 0)}`}>
                      {getChangeIcon(activityReport?.emails_change || 0)}
                      {formatPercentage(Math.abs(activityReport?.emails_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Meetings Held</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activityReport?.meetings_held || 0}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(activityReport?.meetings_change || 0)}`}>
                      {getChangeIcon(activityReport?.meetings_change || 0)}
                      {formatPercentage(Math.abs(activityReport?.meetings_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity by Type */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Activity Distribution</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('activities')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityReport?.by_type?.map((type) => (
                      <div key={type.type_name} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{type.type_name}</span>
                            <span className="text-sm text-gray-600">{type.count} activities</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(type.count / (activityReport?.total_activities || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <div className="space-y-6">
              {/* Campaign Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{campaignReport?.total_campaigns || 0}</div>
                    <div className="text-xs text-gray-600">{campaignReport?.active_campaigns || 0} currently active</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(campaignReport?.total_impressions || 0).toLocaleString()}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(campaignReport?.impressions_change || 0)}`}>
                      {getChangeIcon(campaignReport?.impressions_change || 0)}
                      {formatPercentage(Math.abs(campaignReport?.impressions_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(campaignReport?.total_clicks || 0).toLocaleString()}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(campaignReport?.clicks_change || 0)}`}>
                      {getChangeIcon(campaignReport?.clicks_change || 0)}
                      {formatPercentage(Math.abs(campaignReport?.clicks_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(campaignReport?.avg_ctr || 0)}</div>
                    <div className={`text-xs flex items-center gap-1 ${getChangeColor(campaignReport?.ctr_change || 0)}`}>
                      {getChangeIcon(campaignReport?.ctr_change || 0)}
                      {formatPercentage(Math.abs(campaignReport?.ctr_change || 0))} from last period
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Campaign Performance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Campaign Performance</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('campaigns')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaignReport?.campaign_performance?.map((campaign) => (
                      <div key={campaign.campaign_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{campaign.campaign_name}</div>
                          <div className="text-sm text-gray-600 capitalize">{campaign.campaign_type}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="font-semibold">{campaign.impressions.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Impressions</div>
                          </div>
                          <div>
                            <div className="font-semibold">{campaign.clicks.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Clicks</div>
                          </div>
                          <div>
                            <div className="font-semibold">{formatPercentage(campaign.ctr)}</div>
                            <div className="text-xs text-gray-600">CTR</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ExtensibleLayout>
  );
} 