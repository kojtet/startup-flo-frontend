import React, { useState, useEffect } from 'react';
import { getPerformanceMetrics, PerformanceMetrics } from '@/apis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ApiPerformanceMonitorProps {
  refreshInterval?: number; // in milliseconds
  showDetails?: boolean;
}

export const ApiPerformanceMonitor: React.FC<ApiPerformanceMonitorProps> = ({
  refreshInterval = 5000,
  showDetails = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = getPerformanceMetrics();
      setMetrics(currentMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (!metrics || !isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium"
        >
          Show API Metrics
        </button>
      </div>
    );
  }

  const getPerformanceColor = (rate: number) => {
    if (rate >= 0.9) return 'text-green-600';
    if (rate >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCacheHitRateColor = (rate: number) => {
    if (rate >= 0.5) return 'text-green-600';
    if (rate >= 0.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-semibold">API Performance</CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Request Count */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Total Requests:</span>
            <Badge variant="outline" className="text-xs">
              {metrics.requestCount}
            </Badge>
          </div>

          {/* Average Response Time */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Avg Response Time:</span>
            <span className={`text-xs font-medium ${getPerformanceColor(1 - metrics.averageResponseTime / 1000)}`}>
              {metrics.averageResponseTime.toFixed(0)}ms
            </span>
          </div>

          {/* Error Rate */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Error Rate:</span>
            <span className={`text-xs font-medium ${getPerformanceColor(1 - metrics.errorRate)}`}>
              {(metrics.errorRate * 100).toFixed(1)}%
            </span>
          </div>

          {/* Cache Hit Rate */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Cache Hit Rate:</span>
            <span className={`text-xs font-medium ${getCacheHitRateColor(metrics.cacheHitRate)}`}>
              {(metrics.cacheHitRate * 100).toFixed(1)}%
            </span>
          </div>

          {/* Progress Bars */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Success Rate</span>
                <span>{((1 - metrics.errorRate) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(1 - metrics.errorRate) * 100} className="h-1" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Cache Efficiency</span>
                <span>{(metrics.cacheHitRate * 100).toFixed(1)}%</span>
              </div>
              <Progress value={metrics.cacheHitRate * 100} className="h-1" />
            </div>
          </div>

          {/* Detailed Metrics */}
          {showDetails && (
            <div className="pt-2 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Cache Hits:</span>
                <span>{metrics.cacheHitCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Cache Misses:</span>
                <span>{metrics.cacheMissCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Errors:</span>
                <span>{metrics.errorCount}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiPerformanceMonitor; 