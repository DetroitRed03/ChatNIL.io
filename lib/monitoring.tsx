import React from 'react';
import { logger } from './logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserJourneyEvent {
  event: string;
  timestamp: string;
  path: string;
  component?: string;
  metadata?: Record<string, any>;
}

export interface NetworkMetric {
  url: string;
  method: string;
  status: number;
  duration: number;
  timestamp: string;
  size?: number;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private userJourney: UserJourneyEvent[] = [];
  private networkMetrics: NetworkMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private componentRenderTimes: Map<string, number> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.monitorMemoryUsage();
    }
  }

  private initializeObservers(): void {
    try {
      // Monitor Long Tasks (blocking main thread)
      if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('long-task', entry.duration, 'ms', {
              name: entry.name,
              startTime: entry.startTime
            });

            if (entry.duration > 50) {
              logger.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, 'performance', {
                name: entry.name,
                duration: entry.duration
              });
            }
          });
        });

        try {
          longTaskObserver.observe({ entryTypes: ['longtask'] });
          this.observers.set('longtask', longTaskObserver);
        } catch (error) {
          logger.debug('Long task observer not supported', 'performance');
        }

        // Monitor Layout Shifts
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.value > 0) {
              this.recordMetric('cumulative-layout-shift', entry.value, 'score', {
                hadRecentInput: entry.hadRecentInput,
                sources: entry.sources?.length || 0
              });

              if (entry.value > 0.1) {
                logger.warn(`Layout shift detected: ${entry.value}`, 'performance', {
                  value: entry.value,
                  hadRecentInput: entry.hadRecentInput
                });
              }
            }
          });
        });

        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          this.observers.set('layout-shift', clsObserver);
        } catch (error) {
          logger.debug('Layout shift observer not supported', 'performance');
        }

        // Monitor First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const fidEntry = entry as any;
            const fid = (fidEntry.processingStart || 0) - entry.startTime;
            this.recordMetric('first-input-delay', fid, 'ms', {
              name: entry.name,
              target: (fidEntry.target as Element)?.tagName
            });

            logger.info(`First Input Delay: ${fid.toFixed(2)}ms`, 'performance', {
              fid: fid,
              target: (fidEntry.target as Element)?.tagName
            });
          });
        });

        try {
          fidObserver.observe({ entryTypes: ['first-input'] });
          this.observers.set('first-input', fidObserver);
        } catch (error) {
          logger.debug('First input observer not supported', 'performance');
        }
      }
    } catch (error) {
      logger.error('Failed to initialize performance observers', 'performance', { error });
    }
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('memory-used', memory.usedJSHeapSize, 'bytes', {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });

        // Warn if memory usage is high
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
          logger.warn(`High memory usage: ${usagePercent.toFixed(1)}%`, 'performance', {
            used: memory.usedJSHeapSize,
            limit: memory.jsHeapSizeLimit
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  recordMetric(name: string, value: number, unit: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.metrics.push(metric);

    // Maintain max 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    logger.debug(`Performance metric: ${name} = ${value}${unit}`, 'performance', metadata);
  }

  recordUserJourney(event: string, path: string, component?: string, metadata?: Record<string, any>): void {
    const journeyEvent: UserJourneyEvent = {
      event,
      timestamp: new Date().toISOString(),
      path,
      component,
      metadata
    };

    this.userJourney.push(journeyEvent);

    // Maintain max 500 journey events
    if (this.userJourney.length > 500) {
      this.userJourney = this.userJourney.slice(-500);
    }

    logger.info(`User journey: ${event} at ${path}`, 'user-journey', {
      component,
      ...metadata
    });
  }

  recordNetworkMetric(
    url: string,
    method: string,
    status: number,
    duration: number,
    size?: number,
    error?: string
  ): void {
    const metric: NetworkMetric = {
      url,
      method,
      status,
      duration,
      timestamp: new Date().toISOString(),
      size,
      error
    };

    this.networkMetrics.push(metric);

    // Maintain max 200 network metrics
    if (this.networkMetrics.length > 200) {
      this.networkMetrics = this.networkMetrics.slice(-200);
    }

    const logLevel = status >= 400 ? 'error' : duration > 5000 ? 'warn' : 'info';
    logger[logLevel](`Network: ${method} ${url} - ${status} (${duration}ms)`, 'network', {
      status,
      duration,
      size,
      error
    });
  }

  // Component performance tracking
  startComponentRender(componentName: string): void {
    this.componentRenderTimes.set(componentName, performance.now());
  }

  endComponentRender(componentName: string): number | null {
    const startTime = this.componentRenderTimes.get(componentName);
    if (startTime === undefined) return null;

    const duration = performance.now() - startTime;
    this.componentRenderTimes.delete(componentName);

    this.recordMetric('component-render', duration, 'ms', { component: componentName });

    if (duration > 100) {
      logger.warn(`Slow component render: ${componentName} took ${duration.toFixed(2)}ms`, 'performance', {
        component: componentName,
        duration
      });
    }

    return duration;
  }

  // Page load metrics
  recordPageLoad(): void {
    if (typeof window === 'undefined') return;

    // Wait for page to be fully loaded
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      if (navigation) {
        const navStart = navigation.navigationStart || navigation.startTime || 0;
        this.recordMetric('page-load-time', navigation.loadEventEnd - navStart, 'ms');
        this.recordMetric('dom-content-loaded', navigation.domContentLoadedEventEnd - navStart, 'ms');
        this.recordMetric('first-byte', navigation.responseStart - navStart, 'ms');

        logger.info('Page load metrics recorded', 'performance', {
          loadTime: navigation.loadEventEnd - navStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navStart,
          firstByte: navigation.responseStart - navStart
        });
      }

      // Record Core Web Vitals
      this.recordCoreWebVitals();
    }, 1000);
  }

  private recordCoreWebVitals(): void {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('largest-contentful-paint', lastEntry.startTime, 'ms', {
        element: (lastEntry as any).element?.tagName
      });

      logger.info(`LCP: ${lastEntry.startTime.toFixed(2)}ms`, 'performance', {
        lcp: lastEntry.startTime
      });
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      logger.debug('LCP observer not supported', 'performance');
    }
  }

  // API monitoring wrapper
  monitorApiCall<T>(
    apiCall: () => Promise<T>,
    url: string,
    method: string = 'GET'
  ): Promise<T> {
    const startTime = performance.now();

    return apiCall()
      .then((result) => {
        const duration = performance.now() - startTime;
        this.recordNetworkMetric(url, method, 200, duration);
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        const status = error.response?.status || 0;
        this.recordNetworkMetric(url, method, status, duration, undefined, error.message);
        throw error;
      });
  }

  // Get performance summary
  getPerformanceSummary(): {
    avgPageLoadTime: number;
    avgComponentRenderTime: number;
    longTaskCount: number;
    errorRate: number;
    memoryUsage?: number;
  } {
    const pageLoadMetrics = this.metrics.filter(m => m.name === 'page-load-time');
    const componentRenderMetrics = this.metrics.filter(m => m.name === 'component-render');
    const longTasks = this.metrics.filter(m => m.name === 'long-task');
    const networkErrors = this.networkMetrics.filter(m => m.status >= 400);
    const latestMemory = this.metrics.filter(m => m.name === 'memory-used').slice(-1)[0];

    return {
      avgPageLoadTime: pageLoadMetrics.length > 0
        ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length
        : 0,
      avgComponentRenderTime: componentRenderMetrics.length > 0
        ? componentRenderMetrics.reduce((sum, m) => sum + m.value, 0) / componentRenderMetrics.length
        : 0,
      longTaskCount: longTasks.length,
      errorRate: this.networkMetrics.length > 0
        ? (networkErrors.length / this.networkMetrics.length) * 100
        : 0,
      memoryUsage: latestMemory?.value
    };
  }

  // Get all metrics
  getAllMetrics(): {
    performance: PerformanceMetric[];
    userJourney: UserJourneyEvent[];
    network: NetworkMetric[];
  } {
    return {
      performance: [...this.metrics],
      userJourney: [...this.userJourney],
      network: [...this.networkMetrics]
    };
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
    this.userJourney = [];
    this.networkMetrics = [];
    this.componentRenderTimes.clear();
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for component performance monitoring
export const useComponentPerformance = (componentName: string) => {
  const startRender = () => performanceMonitor.startComponentRender(componentName);
  const endRender = () => performanceMonitor.endComponentRender(componentName);

  return { startRender, endRender };
};

// Higher-order component for automatic performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown';

    React.useEffect(() => {
      performanceMonitor.startComponentRender(name);
      return () => {
        performanceMonitor.endComponentRender(name);
      };
    }, [name]);

    return <WrappedComponent ref={ref} {...props as P} />;
  });
};