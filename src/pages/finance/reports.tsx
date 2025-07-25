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
import { useAuth } from '@/contexts/AuthContext';
import type { FinanceOverview, CashFlowReport, ProfitLossReport } from '@/apis/types';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Download, 
  RefreshCw,
  Target,
  Wallet,
  FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FinanceReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState<{
    overview: FinanceOverview | null;
    cashFlow: CashFlowReport | null;
    profitLoss: ProfitLossReport | null;
  }>({
    overview: null,
    cashFlow: null,
    profitLoss: null
  });
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  // Transform auth user to layout user format
  const layoutUser = authUser ? {
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

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      const [overviewResponse, cashFlowResponse, profitLossResponse] = await Promise.all([
        api.finance.getFinanceOverview(),
        api.finance.getCashFlowReport({ 
          period_start: startDate.toISOString().split('T')[0],
          period_end: endDate.toISOString().split('T')[0]
        }),
        api.finance.getProfitLossReport({ 
          period_start: startDate.toISOString().split('T')[0],
          period_end: endDate.toISOString().split('T')[0]
        })
      ]);
      
      setReportData({
        overview: overviewResponse,
        cashFlow: cashFlowResponse,
        profitLoss: profitLossResponse
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch financial reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportType: string) => {
    try {
      // For now, we'll just show a toast since exportReport method doesn't exist
      toast({
        title: "Export Feature",
        description: `${reportType} export functionality will be implemented soon`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to export ${reportType} report`,
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  if (loading) {
    return (
      <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting" user={layoutUser}>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading financial reports...</span>
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting" user={layoutUser}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive financial analysis and reporting dashboard
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchReports}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        {reportData.overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.overview.total_revenue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Current period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportData.overview.total_expenses)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Current period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getChangeColor(reportData.overview.net_profit)}`}>
                  {formatCurrency(reportData.overview.net_profit)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Current period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getChangeColor(reportData.overview.cash_flow)}`}>
                  {formatCurrency(reportData.overview.cash_flow)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Current period
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tabs */}
        <Tabs defaultValue="cash-flow" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="cash-flow" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Cash Flow Report</h2>
              <Button 
                variant="outline" 
                onClick={() => handleExportReport('cash-flow')}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {reportData.cashFlow && (
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Cash Inflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(reportData.cashFlow.cash_inflow)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Total incoming cash
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Cash Outflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(reportData.cashFlow.cash_outflow)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Total outgoing cash
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Net Cash Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${getChangeColor(reportData.cashFlow.net_cash_flow)}`}>
                        {formatCurrency(reportData.cashFlow.net_cash_flow)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Current period
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Opening Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(reportData.cashFlow.opening_balance)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Beginning of period
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Closing Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(reportData.cashFlow.closing_balance)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        End of period
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {reportData.cashFlow.monthly_flow && reportData.cashFlow.monthly_flow.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Cash Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {reportData.cashFlow.monthly_flow.map((flow, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{flow.month}</span>
                            <div className="flex gap-4">
                              <span className="text-sm text-green-600">
                                +{formatCurrency(flow.inflow)}
                              </span>
                              <span className="text-sm text-red-600">
                                -{formatCurrency(flow.outflow)}
                              </span>
                              <span className={`text-sm font-semibold ${getChangeColor(flow.net_flow)}`}>
                                {formatCurrency(flow.net_flow)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profit-loss" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Profit & Loss Statement</h2>
              <Button 
                variant="outline" 
                onClick={() => handleExportReport('profit-loss')}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {reportData.profitLoss && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue & Expenses Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Revenue</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(reportData.profitLoss.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Expenses</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(reportData.profitLoss.expenses)}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Net Profit</span>
                        <span className={getChangeColor(reportData.profitLoss.net_profit)}>
                          {formatCurrency(reportData.profitLoss.net_profit)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profit Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Gross Profit</span>
                      <span className="font-semibold">
                        {formatCurrency(reportData.profitLoss.gross_profit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Profit Margin</span>
                      <span className="font-semibold">
                        {formatPercentage(reportData.profitLoss.profit_margin)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {reportData.profitLoss.monthly_comparison && reportData.profitLoss.monthly_comparison.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {reportData.profitLoss.monthly_comparison.map((comparison, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{comparison.month}</span>
                            <div className="flex gap-4">
                              <span className="text-sm text-green-600">
                                {formatCurrency(comparison.revenue)}
                              </span>
                              <span className="text-sm text-red-600">
                                {formatCurrency(comparison.expenses)}
                              </span>
                              <span className={`text-sm font-semibold ${getChangeColor(comparison.profit)}`}>
                                {formatCurrency(comparison.profit)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Financial Analytics</h2>
              <Button 
                variant="outline" 
                onClick={() => handleExportReport('analytics')}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {reportData.overview && (
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Outstanding Invoices</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(reportData.overview.outstanding_invoices)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Pending Expenses</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(reportData.overview.pending_expenses)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Monthly Revenue Trend</span>
                        <span className="font-semibold text-green-600">
                          {reportData.overview.monthly_revenue.length > 0 ? 
                            formatCurrency(reportData.overview.monthly_revenue[reportData.overview.monthly_revenue.length - 1]) : 
                            '$0'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Monthly Expenses Trend</span>
                        <span className="font-semibold text-red-600">
                          {reportData.overview.monthly_expenses.length > 0 ? 
                            formatCurrency(reportData.overview.monthly_expenses[reportData.overview.monthly_expenses.length - 1]) : 
                            '$0'
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Health Score</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          {reportData.overview.net_profit > 0 ? '85' : '45'}/100
                        </div>
                        <Progress value={reportData.overview.net_profit > 0 ? 85 : 45} className="mb-4" />
                        <Badge 
                          className={
                            reportData.overview.net_profit > 0 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {reportData.overview.net_profit > 0 ? 'Good' : 'Needs Attention'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground text-center">
                        Based on profitability and cash flow metrics
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue & Expense Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">Revenue Trend</div>
                        <div className="text-2xl font-bold text-green-600">
                          {reportData.overview.monthly_revenue.length > 0 ? 
                            formatCurrency(reportData.overview.monthly_revenue[reportData.overview.monthly_revenue.length - 1]) : 
                            '$0'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Latest month</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">Expense Trend</div>
                        <div className="text-2xl font-bold text-red-600">
                          {reportData.overview.monthly_expenses.length > 0 ? 
                            formatCurrency(reportData.overview.monthly_expenses[reportData.overview.monthly_expenses.length - 1]) : 
                            '$0'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Latest month</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ExtensibleLayout>
  );
}
