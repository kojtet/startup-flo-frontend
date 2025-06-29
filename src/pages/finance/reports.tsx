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
import type { FinancialReport, CashFlowReport, ProfitLossReport, BalanceSheetReport } from '@/apis/types';
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
    overview: FinancialReport | null;
    cashFlow: CashFlowReport | null;
    profitLoss: ProfitLossReport | null;
    balanceSheet: BalanceSheetReport | null;
  }>({
    overview: null,
    cashFlow: null,
    profitLoss: null,
    balanceSheet: null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [overviewResponse, cashFlowResponse, profitLossResponse, balanceSheetResponse] = await Promise.all([
        api.finance.getFinancialOverview({ days: parseInt(dateRange) }),
        api.finance.getCashFlowReport({ days: parseInt(dateRange) }),
        api.finance.getProfitLossReport({ days: parseInt(dateRange) }),
        api.finance.getBalanceSheetReport()
      ]);
      
      setReportData({
        overview: overviewResponse,
        cashFlow: cashFlowResponse,
        profitLoss: profitLossResponse,
        balanceSheet: balanceSheetResponse
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
      const response = await api.finance.exportReport({
        type: reportType,
        days: parseInt(dateRange),
        format: 'csv'
      });
      
      // Create download link
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `${reportType} report exported successfully`
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
      <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting" user={null}>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading financial reports...</span>
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting" user={user}>
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
                <div className={`text-xs ${getChangeColor(reportData.overview.revenue_change)}`}>
                  {formatPercentage(reportData.overview.revenue_change)} from last period
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
                <div className={`text-xs ${getChangeColor(-reportData.overview.expense_change)}`}>
                  {formatPercentage(reportData.overview.expense_change)} from last period
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
                <div className={`text-xs ${getChangeColor(reportData.overview.profit_change)}`}>
                  {formatPercentage(reportData.overview.profit_change)} from last period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(reportData.overview.profit_margin)}
                </div>
                <div className={`text-xs ${getChangeColor(reportData.overview.margin_change)}`}>
                  {formatPercentage(reportData.overview.margin_change)} from last period
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tabs */}
        <Tabs defaultValue="cash-flow" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
            <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
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
                        {formatCurrency(reportData.cashFlow.total_inflow)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        From {reportData.cashFlow.inflow_sources.length} sources
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Cash Outflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(reportData.cashFlow.total_outflow)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        To {reportData.cashFlow.outflow_destinations.length} destinations
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Net Cash Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${getChangeColor(reportData.cashFlow.net_flow)}`}>
                        {formatCurrency(reportData.cashFlow.net_flow)}
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
                      <CardTitle>Top Inflow Sources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {reportData.cashFlow.inflow_sources.map((source, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{source.name}</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(source.amount)}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Outflow Destinations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {reportData.cashFlow.outflow_destinations.map((dest, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{dest.name}</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(dest.amount)}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
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
                    <CardTitle>Revenue Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reportData.profitLoss.revenue_breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{item.category}</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total Revenue</span>
                        <span className="text-green-600">
                          {formatCurrency(reportData.profitLoss.total_revenue)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reportData.profitLoss.expense_breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{item.category}</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total Expenses</span>
                        <span className="text-red-600">
                          {formatCurrency(reportData.profitLoss.total_expenses)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Net Income Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Gross Profit</span>
                      <span className="font-semibold">
                        {formatCurrency(reportData.profitLoss.gross_profit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Operating Expenses</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(reportData.profitLoss.operating_expenses)}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Net Income</span>
                        <span className={getChangeColor(reportData.profitLoss.net_income)}>
                          {formatCurrency(reportData.profitLoss.net_income)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="balance-sheet" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Balance Sheet</h2>
              <Button 
                variant="outline" 
                onClick={() => handleExportReport('balance-sheet')}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {reportData.balanceSheet && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Current Assets</h4>
                        {reportData.balanceSheet.current_assets.map((asset, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{asset.name}</span>
                            <span>{formatCurrency(asset.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Fixed Assets</h4>
                        {reportData.balanceSheet.fixed_assets.map((asset, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{asset.name}</span>
                            <span>{formatCurrency(asset.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center font-bold">
                          <span>Total Assets</span>
                          <span>{formatCurrency(reportData.balanceSheet.total_assets)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Liabilities & Equity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Current Liabilities</h4>
                        {reportData.balanceSheet.current_liabilities.map((liability, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{liability.name}</span>
                            <span>{formatCurrency(liability.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Long-term Liabilities</h4>
                        {reportData.balanceSheet.long_term_liabilities.map((liability, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{liability.name}</span>
                            <span>{formatCurrency(liability.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Equity</h4>
                        {reportData.balanceSheet.equity.map((equity, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{equity.name}</span>
                            <span>{formatCurrency(equity.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center font-bold">
                          <span>Total Liabilities & Equity</span>
                          <span>{formatCurrency(reportData.balanceSheet.total_liabilities_equity)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                      <CardTitle>Key Performance Indicators</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Revenue Growth Rate</span>
                        <span className={`font-semibold ${getChangeColor(reportData.overview.revenue_growth_rate)}`}>
                          {formatPercentage(reportData.overview.revenue_growth_rate)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Expense Ratio</span>
                        <span className="font-semibold">
                          {formatPercentage(reportData.overview.expense_ratio)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Return on Assets</span>
                        <span className="font-semibold">
                          {formatPercentage(reportData.overview.return_on_assets)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Cash Conversion Cycle</span>
                        <span className="font-semibold">
                          {reportData.overview.cash_conversion_cycle} days
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
                          {reportData.overview.health_score}/100
                        </div>
                        <Progress value={reportData.overview.health_score} className="mb-4" />
                        <Badge 
                          className={
                            reportData.overview.health_score >= 80 
                              ? 'bg-green-100 text-green-800'
                              : reportData.overview.health_score >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {reportData.overview.health_score >= 80 
                            ? 'Excellent' 
                            : reportData.overview.health_score >= 60
                            ? 'Good'
                            : 'Needs Attention'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground text-center">
                        Based on profitability, liquidity, and efficiency metrics
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Trends & Forecasts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">Projected Revenue</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(reportData.overview.projected_revenue)}
                        </div>
                        <div className="text-sm text-muted-foreground">Next period</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">Projected Expenses</div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(reportData.overview.projected_expenses)}
                        </div>
                        <div className="text-sm text-muted-foreground">Next period</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">Projected Profit</div>
                        <div className={`text-2xl font-bold ${getChangeColor(reportData.overview.projected_profit)}`}>
                          {formatCurrency(reportData.overview.projected_profit)}
                        </div>
                        <div className="text-sm text-muted-foreground">Next period</div>
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
