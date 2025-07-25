/**
 * Comprehensive Monitoring Dashboard
 * 
 * Real-time analytics and performance monitoring dashboard for the application.
 * Displays metrics for all contexts, caching systems, and error handling.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Eye, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Users,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Download,
  Trash2
} from 'lucide-react';
import { 
  globalMonitoring, 
  AnalyticsData, 
  ContextMetrics, 
  PerformanceMetric,
  ErrorMetric,
  CacheMetric 
} from '@/lib/monitoring';

// ================================
// TYPES AND INTERFACES
// ================================

interface DashboardProps {
  className?: string;
  refreshInterval?: number;
  showRealTime?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'error';
}

interface ContextCardProps {
  context: string;
  metrics: ContextMetrics;
  onRefresh?: () => void;
}

// ================================
// UTILITY FUNCTIONS
// ================================

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

const formatUptime = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const getStatusColor = (rate: number): string => {
  if (rate < 5) return 'text-green-600';
  if (rate < 15) return 'text-yellow-600';
  return 'text-red-600';
};

const getStatusBadge = (rate: number): 'default' | 'secondary' | 'destructive' => {
  if (rate < 5) return 'default';
  if (rate < 15) return 'secondary';
  return 'destructive';
};

// ================================
// COMPONENTS
// ================================

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  description, 
  trend, 
  trendValue, 
  icon, 
  color = 'default' 
}) => {
  const colorClasses = {
    default: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900'
  };

  const iconClasses = {
    default: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <Card className={`${colorClasses[color]} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && <div className={iconClasses[color]}>{icon}</div>}
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>
          </div>
          {trend && trendValue && (
            <div className="flex items-center space-x-1">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ContextCard: React.FC<ContextCardProps> = ({ context, metrics, onRefresh }) => {
  const statusColor = getStatusColor(metrics.errorRate);
  const statusBadge = getStatusBadge(metrics.errorRate);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg capitalize">{context}</CardTitle>
            <CardDescription>
              Last activity: {new Date(metrics.lastActivity).toLocaleTimeString()}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={statusBadge}>
              {metrics.errorRate.toFixed(1)}% errors
            </Badge>
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Operations</p>
            <p className="text-lg font-semibold">{formatNumber(metrics.totalOperations)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-lg font-semibold text-green-600">
              {metrics.totalOperations > 0 
                ? ((metrics.successfulOperations / metrics.totalOperations) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Response</p>
            <p className="text-lg font-semibold">{formatDuration(metrics.averageResponseTime)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cache Hit Rate</p>
            <p className="text-lg font-semibold">{metrics.cacheHitRate.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Error Rate</span>
            <span className={statusColor}>{metrics.errorRate.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(metrics.errorRate, 100)} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

const PerformanceChart: React.FC<{ data: PerformanceMetric[] }> = ({ data }) => {
  const recentData = data.slice(-20); // Last 20 operations
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Performance Trends</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentData.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  metric.success ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium">{metric.operation}</span>
                <Badge variant="outline" className="text-xs">
                  {metric.context}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                {formatDuration(metric.duration)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ErrorList: React.FC<{ data: ErrorMetric[] }> = ({ data }) => {
  const recentErrors = data.slice(-10); // Last 10 errors
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Recent Errors</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentErrors.map((error, index) => (
            <Alert key={index} variant={error.resolved ? "default" : "destructive"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{error.error.userFriendlyMessage}</p>
                    <p className="text-sm text-gray-600">
                      {error.context} • {error.operation} • {error.retryCount} retries
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const CacheStats: React.FC<{ data: CacheMetric[] }> = ({ data }) => {
  const stats = useMemo(() => {
    const hits = data.filter(m => m.hit).length;
    const total = data.length;
    const hitRate = total > 0 ? (hits / total) * 100 : 0;
    
    const byNamespace = data.reduce((acc, metric) => {
      if (!acc[metric.namespace]) {
        acc[metric.namespace] = { hits: 0, total: 0 };
      }
      if (metric.hit) acc[metric.namespace].hits++;
      acc[metric.namespace].total++;
      return acc;
    }, {} as Record<string, { hits: number; total: number }>);

    return { hitRate, byNamespace };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Cache Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Hit Rate</span>
              <span>{stats.hitRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.hitRate} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">By Namespace:</p>
            {Object.entries(stats.byNamespace).map(([namespace, data]) => (
              <div key={namespace} className="flex justify-between text-sm">
                <span className="capitalize">{namespace}</span>
                <span>{data.total > 0 ? ((data.hits / data.total) * 100).toFixed(1) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ================================
// MAIN DASHBOARD COMPONENT
// ================================

export const MonitoringDashboard: React.FC<DashboardProps> = ({
  className = '',
  refreshInterval = 5000,
  showRealTime = true
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Refresh analytics data
  const refreshAnalytics = () => {
    setIsRefreshing(true);
    const data = globalMonitoring.getAnalytics();
    setAnalytics(data);
    setIsRefreshing(false);
  };

  // Auto-refresh
  useEffect(() => {
    if (!showRealTime) return;

    refreshAnalytics();
    const interval = setInterval(refreshAnalytics, refreshInterval);

    return () => clearInterval(interval);
  }, [showRealTime, refreshInterval]);

  // Manual refresh
  const handleRefresh = () => {
    refreshAnalytics();
  };

  // Export analytics
  const handleExport = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear analytics
  const handleClear = () => {
    if (confirm('Are you sure you want to clear all analytics data?')) {
      // This would need to be implemented in the monitoring system
      refreshAnalytics();
    }
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-gray-600">
            Real-time analytics and performance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Requests"
          value={formatNumber(analytics.summary.totalRequests)}
          description="All operations tracked"
          icon={<Activity className="w-5 h-5" />}
          color="default"
        />
        <MetricCard
          title="Avg Response Time"
          value={formatDuration(analytics.summary.averageResponseTime)}
          description="Across all operations"
          icon={<Clock className="w-5 h-5" />}
          color="success"
        />
        <MetricCard
          title="Error Rate"
          value={`${analytics.summary.errorRate.toFixed(1)}%`}
          description="Failed operations"
          icon={<AlertTriangle className="w-5 h-5" />}
          color={analytics.summary.errorRate > 15 ? 'error' : 'warning'}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${analytics.summary.cacheHitRate.toFixed(1)}%`}
          description="Successful cache hits"
          icon={<Database className="w-5 h-5" />}
          color="success"
        />
      </div>

      {/* Additional Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Active Users"
          value={analytics.summary.activeUsers}
          description="Currently active"
          icon={<Users className="w-5 h-5" />}
          color="default"
        />
        <MetricCard
          title="Uptime"
          value={formatUptime(analytics.summary.uptime)}
          description="System uptime"
          icon={<Zap className="w-5 h-5" />}
          color="success"
        />
        <MetricCard
          title="Total Errors"
          value={analytics.errors.length}
          description="Tracked errors"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="warning"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contexts">Contexts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CacheStats data={analytics.cache} />
            <PerformanceChart data={analytics.performance} />
          </div>
        </TabsContent>

        <TabsContent value="contexts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(analytics.contexts).map(([context, metrics]) => (
              <ContextCard
                key={context}
                context={context}
                metrics={metrics}
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceChart data={analytics.performance} />
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <ErrorList data={analytics.errors} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard; 