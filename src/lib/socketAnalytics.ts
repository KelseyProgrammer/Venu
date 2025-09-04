// Socket.IO Analytics and Monitoring System
class SocketAnalytics {
  private static instance: SocketAnalytics;
  private metrics = {
    activeConnections: 0,
    messagesPerSecond: 0,
    averageLatency: 0,
    errorRate: 0,
    totalMessages: 0,
    totalErrors: 0,
    startTime: Date.now()
  };

  private messageTimestamps: number[] = [];
  private errorTimestamps: number[] = [];
  private latencyMeasurements: number[] = [];

  // Singleton pattern
  static getInstance(): SocketAnalytics {
    if (!SocketAnalytics.instance) {
      SocketAnalytics.instance = new SocketAnalytics();
    }
    return SocketAnalytics.instance;
  }

  // Track connection
  trackConnection(userId: string): void {
    this.metrics.activeConnections++;
    console.log(`📊 User ${userId} connected. Active connections: ${this.metrics.activeConnections}`);
  }

  // Track disconnection
  trackDisconnection(userId: string): void {
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
    console.log(`📊 User ${userId} disconnected. Active connections: ${this.metrics.activeConnections}`);
  }

  // Track message with latency
  trackMessage(latency: number): void {
    this.metrics.totalMessages++;
    this.metrics.messagesPerSecond++;
    this.latencyMeasurements.push(latency);
    
    // Keep only last 100 measurements for average calculation
    if (this.latencyMeasurements.length > 100) {
      this.latencyMeasurements.shift();
    }
    
    this.metrics.averageLatency = this.latencyMeasurements.reduce((sum, lat) => sum + lat, 0) / this.latencyMeasurements.length;
    
    // Track message timestamp for rate calculation
    this.messageTimestamps.push(Date.now());
    
    // Remove timestamps older than 1 second
    const oneSecondAgo = Date.now() - 1000;
    this.messageTimestamps = this.messageTimestamps.filter(timestamp => timestamp > oneSecondAgo);
    this.metrics.messagesPerSecond = this.messageTimestamps.length;
  }

  // Track error
  trackError(error: string): void {
    this.metrics.totalErrors++;
    this.metrics.errorRate++;
    this.errorTimestamps.push(Date.now());
    
    // Remove error timestamps older than 1 minute
    const oneMinuteAgo = Date.now() - 60000;
    this.errorTimestamps = this.errorTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    this.metrics.errorRate = this.errorTimestamps.length;
    
    console.error(`📊 Socket error: ${error}. Error rate: ${this.metrics.errorRate}/min`);
  }

  // Get current metrics
  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

    return {
      ...this.metrics,
      uptime: `${uptimeHours}h ${uptimeMinutes}m`,
      messageThroughput: this.metrics.totalMessages / (uptime / 1000), // messages per second average
      errorPercentage: this.metrics.totalMessages > 0 ? (this.metrics.totalErrors / this.metrics.totalMessages) * 100 : 0
    };
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = {
      activeConnections: 0,
      messagesPerSecond: 0,
      averageLatency: 0,
      errorRate: 0,
      totalMessages: 0,
      totalErrors: 0,
      startTime: Date.now()
    };
    this.messageTimestamps = [];
    this.errorTimestamps = [];
    this.latencyMeasurements = [];
  }

  // Generate performance report
  generateReport(): string {
    const metrics = this.getMetrics();
    
    return `
📊 Socket.IO Performance Report
================================
Active Connections: ${metrics.activeConnections}
Messages/Second: ${metrics.messagesPerSecond}
Average Latency: ${metrics.averageLatency.toFixed(2)}ms
Error Rate: ${metrics.errorRate}/min
Total Messages: ${metrics.totalMessages}
Total Errors: ${metrics.totalErrors}
Error Percentage: ${metrics.errorPercentage.toFixed(2)}%
Uptime: ${metrics.uptime}
Message Throughput: ${metrics.messageThroughput.toFixed(2)} msg/s
================================
    `.trim();
  }

  // Check if performance targets are met
  checkPerformanceTargets(): { passed: boolean; issues: string[] } {
    const metrics = this.getMetrics();
    const issues: string[] = [];

    if (metrics.averageLatency > 100) {
      issues.push(`High latency: ${metrics.averageLatency.toFixed(2)}ms (target: <100ms)`);
    }

    if (metrics.errorPercentage > 0.1) {
      issues.push(`High error rate: ${metrics.errorPercentage.toFixed(2)}% (target: <0.1%)`);
    }

    if (metrics.activeConnections > 1000) {
      issues.push(`High connection count: ${metrics.activeConnections} (target: <1000)`);
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
}

// Performance monitoring middleware
export const createPerformanceMiddleware = () => {
  const analytics = SocketAnalytics.getInstance();

  return (socket: { user?: { userId: string }; emit: (event: string, ...args: unknown[]) => void; on?: (event: string, callback: (...args: unknown[]) => void) => void }, next: (err?: Error) => void) => {
    const startTime = Date.now();

    // Track connection
    analytics.trackConnection(socket.user?.userId || 'unknown');

    // Monitor message events
    const originalEmit = socket.emit;
    socket.emit = function(event: string, ...args: unknown[]) {
      const latency = Date.now() - startTime;
      analytics.trackMessage(latency);
      return originalEmit.apply(this, [event, ...args]);
    };

    // Monitor errors
    if (socket.on) {
      socket.on('error', (error: unknown) => {
        const errorMessage = error && typeof error === 'object' && 'message' in error 
          ? (error as { message?: string }).message 
          : 'Unknown error';
        analytics.trackError(errorMessage);
      });

      // Track disconnection
      socket.on('disconnect', () => {
        analytics.trackDisconnection(socket.user?.userId || 'unknown');
      });
    }

    next();
  };
};

// Export analytics instance
export const socketAnalytics = SocketAnalytics.getInstance();

// Performance monitoring utilities
export const monitorSocketPerformance = {
  // Get current performance metrics
  getMetrics: () => socketAnalytics.getMetrics(),
  
  // Generate performance report
  generateReport: () => socketAnalytics.generateReport(),
  
  // Check performance targets
  checkTargets: () => socketAnalytics.checkPerformanceTargets(),
  
  // Reset metrics
  reset: () => socketAnalytics.resetMetrics(),
  
  // Log performance report
  logReport: () => {
    console.log(socketAnalytics.generateReport());
  }
};

// Auto-generate reports every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    const targets = socketAnalytics.checkPerformanceTargets();
    if (!targets.passed) {
      console.warn('⚠️ Socket.IO performance targets not met:', targets.issues);
    }
  }, 5 * 60 * 1000); // 5 minutes
}
