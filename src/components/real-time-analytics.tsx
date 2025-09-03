'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/lib/socket';

interface AnalyticsData {
  activeConnections: number;
  totalRooms: number;
  messagesPerSecond: number;
  averageLatency: number;
  memoryUsage: number;
  errorRate: number;
  totalMessages: number;
  uptime: number;
}

interface RealTimeAnalyticsProps {
  isAdmin?: boolean;
  showDetails?: boolean;
}

export const RealTimeAnalytics: React.FC<RealTimeAnalyticsProps> = ({ 
  isAdmin = false, 
  showDetails = false 
}) => {
  const [analytics] = useState<AnalyticsData>({
    activeConnections: 0,
    totalRooms: 0,
    messagesPerSecond: 0,
    averageLatency: 0,
    memoryUsage: 0,
    errorRate: 0,
    totalMessages: 0,
    uptime: 0
  });

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !isAdmin) return;

    const updateAnalytics = () => {
      // Request analytics from server - using a valid event type
      socket.emit('send-message', { locationId: 'admin', message: 'analytics-request', type: 'system' });
    };

    // Update analytics immediately
    updateAnalytics();

    // Update analytics every 5 seconds
    const interval = setInterval(updateAnalytics, 5000);

    return () => clearInterval(interval);
  }, [socket, isAdmin]);

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getConnectionStatusColor = (connections: number): string => {
    if (connections > 100) return 'bg-green-500';
    if (connections > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLatencyColor = (latency: number): string => {
    if (latency < 100) return 'text-green-600';
    if (latency < 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Real-time Analytics
            <Badge variant="outline" className="ml-auto">
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Active Connections */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.activeConnections}
              </div>
              <div className="text-sm text-gray-600">Active Connections</div>
              <div className={`w-3 h-3 rounded-full mx-auto mt-1 ${getConnectionStatusColor(analytics.activeConnections)}`} />
            </div>

            {/* Messages per Second */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.messagesPerSecond}
              </div>
              <div className="text-sm text-gray-600">Messages/sec</div>
            </div>

            {/* Average Latency */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${getLatencyColor(analytics.averageLatency)}`}>
                {analytics.averageLatency.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">Avg Latency</div>
            </div>

            {/* Error Rate */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${analytics.errorRate > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                {(analytics.errorRate * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
          </div>

          {showDetails && (
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Messages:</span>
                  <span className="ml-2 text-gray-600">{analytics.totalMessages.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Total Rooms:</span>
                  <span className="ml-2 text-gray-600">{analytics.totalRooms}</span>
                </div>
                <div>
                  <span className="font-medium">Memory Usage:</span>
                  <span className="ml-2 text-gray-600">{analytics.memoryUsage.toFixed(2)} MB</span>
                </div>
                <div>
                  <span className="font-medium">Uptime:</span>
                  <span className="ml-2 text-gray-600">{formatUptime(analytics.uptime)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Connection Health</div>
                <div className={`text-lg font-bold ${
                  analytics.activeConnections > 50 ? 'text-green-600' : 
                  analytics.activeConnections > 20 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analytics.activeConnections > 50 ? 'Excellent' : 
                   analytics.activeConnections > 20 ? 'Good' : 'Poor'}
                </div>
              </div>
              <div className="text-2xl">
                {analytics.activeConnections > 50 ? '🟢' : 
                 analytics.activeConnections > 20 ? '🟡' : '🔴'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Performance</div>
                <div className={`text-lg font-bold ${
                  analytics.averageLatency < 100 ? 'text-green-600' : 
                  analytics.averageLatency < 300 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analytics.averageLatency < 100 ? 'Fast' : 
                   analytics.averageLatency < 300 ? 'Moderate' : 'Slow'}
                </div>
              </div>
              <div className="text-2xl">
                {analytics.averageLatency < 100 ? '⚡' : 
                 analytics.averageLatency < 300 ? '🔄' : '🐌'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Reliability</div>
                <div className={`text-lg font-bold ${
                  analytics.errorRate < 0.01 ? 'text-green-600' : 
                  analytics.errorRate < 0.05 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analytics.errorRate < 0.01 ? 'Stable' : 
                   analytics.errorRate < 0.05 ? 'Warning' : 'Critical'}
                </div>
              </div>
              <div className="text-2xl">
                {analytics.errorRate < 0.01 ? '✅' : 
                 analytics.errorRate < 0.05 ? '⚠️' : '❌'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;
