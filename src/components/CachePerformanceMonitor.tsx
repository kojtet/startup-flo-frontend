import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Memory, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdvancedCache } from '@/hooks/useAdvancedCache';
import { CACHE_MONITORING } from '@/lib/cacheConfig';

interface CachePerformanceMonitorProps {
  caches: Record<string, AdvancedCache<any>>;
  className?: string;
}

interface CacheStats {
  name: string;
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  entryCount: number;
  evictions: number;
  averageResponseTime?: number;
}

export const CachePerformanceMonitor: React.FC<CachePerformanceMonitorProps> = ({
  caches,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<CacheStats[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Update stats periodically
  useEffect(() => {
    if (!isVisible) return;

    const updateStats = () => {
      const newStats: CacheStats[] = Object.entries(caches).map(([name, cache]) => {
        const cacheStats = cache.getStats();
        return {
          name,
          ...cacheStats,
        };
      });

      setStats(newStats);
      checkAlerts(newStats);
    };

    updateStats();
    const interval = setInterval(updateStats, CACHE_MONITORING.statsInterval);

    return () => clearInterval(interval);
  }, [caches, isVisible]);

  const checkAlerts = (currentStats: CacheStats[]) => {
    const newAlerts: string[] = [];

    currentStats.forEach(stat => {
      if (stat.hitRate < CACHE_MONITORING.thresholds.hitRate) {
        newAlerts.push(`${stat.name}: Low hit rate (${(stat.hitRate * 100).toFixed(1)}%)`);
      }

      if (stat.totalSize > CACHE_MONITORING.thresholds.memoryUsage * 1024 * 1024) {
        newAlerts.push(`${stat.name}: High memory usage (${(stat.totalSize / 1024 / 1024).toFixed(1)}MB)`);
      }

      if (stat.averageResponseTime && stat.averageResponseTime > CACHE_MONITORING.thresholds.responseTime) {
        newAlerts.push(`${stat.name}: Slow response time (${stat.averageResponseTime.toFixed(0)}ms)`);
      }
    });

    setAlerts(newAlerts);
  };

  const refreshAllCaches = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all(
        Object.values(caches).map(cache => cache.clear())
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 0.8) return 'text-green-600';
    if (hitRate >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMemoryUsageColor = (size: number) => {
    const sizeMB = size / 1024 / 1024;
    if (sizeMB < 5) return 'text-green-600';
    if (sizeMB < 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!CACHE_MONITORING.enabled) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2"
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        Cache Monitor
        {alerts.length > 0 && (
          <Badge variant="destructive" className="ml-2">
            {alerts.length}
          </Badge>
        )}
      </Button>

      {isVisible && (
        <Card className="w-96 max-h-96 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Cache Performance
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshAllCaches}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    Object.values(caches).forEach(cache => cache.clear());
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="alerts">
                  Alerts
                  {alerts.length > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {alerts.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.reduce((sum, s) => sum + s.hits, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Hits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.reduce((sum, s) => sum + s.misses, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Misses</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Hit Rate</span>
                    <span className="font-medium">
                      {stats.length > 0 
                        ? (stats.reduce((sum, s) => sum + s.hitRate, 0) / stats.length * 100).toFixed(1)
                        : '0'
                      }%
                    </span>
                  </div>
                  <Progress 
                    value={stats.length > 0 
                      ? stats.reduce((sum, s) => sum + s.hitRate, 0) / stats.length * 100
                      : 0
                    } 
                    className="h-2"
                  />
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold">
                    {formatBytes(stats.reduce((sum, s) => sum + s.totalSize, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Memory Usage</div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {stats.map((stat) => (
                  <div key={stat.name} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{stat.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {stat.entryCount} entries
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Hit Rate:</span>
                        <span className={`ml-1 font-medium ${getHitRateColor(stat.hitRate)}`}>
                          {(stat.hitRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Memory:</span>
                        <span className={`ml-1 font-medium ${getMemoryUsageColor(stat.totalSize)}`}>
                          {formatBytes(stat.totalSize)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hits:</span>
                        <span className="ml-1 font-medium">{stat.hits.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Misses:</span>
                        <span className="ml-1 font-medium">{stat.misses.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Evictions: {stat.evictions}</span>
                      {stat.averageResponseTime && (
                        <span>Avg Response: {stat.averageResponseTime.toFixed(0)}ms</span>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="alerts" className="p-4 max-h-64 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No alerts</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alerts.map((alert, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-800">{alert}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 