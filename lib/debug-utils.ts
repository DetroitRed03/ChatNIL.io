import React from 'react';
import { logger } from './logger';
import { performanceMonitor } from './monitoring';

export interface StateSnapshot {
  timestamp: string;
  stateName: string;
  state: any;
  changeType?: 'update' | 'replace' | 'merge';
  previousState?: any;
  diff?: any;
}

export interface ComponentDebugInfo {
  name: string;
  props: any;
  state?: any;
  renderCount: number;
  lastRenderTime: string;
  performance?: {
    avgRenderTime: number;
    slowRenders: number;
  };
}

class DebugUtils {
  private stateSnapshots: Map<string, StateSnapshot[]> = new Map();
  private componentInfo: Map<string, ComponentDebugInfo> = new Map();
  private memoryLeakDetector: Map<string, WeakRef<any>> = new Map();
  private stateWatchers: Map<string, ((state: any, prevState?: any) => void)[]> = new Map();

  // State Management Debugging
  captureStateSnapshot(
    stateName: string,
    currentState: any,
    changeType: 'update' | 'replace' | 'merge' = 'update',
    previousState?: any
  ): void {
    const snapshot: StateSnapshot = {
      timestamp: new Date().toISOString(),
      stateName,
      state: this.deepClone(currentState),
      changeType,
      previousState: previousState ? this.deepClone(previousState) : undefined,
      diff: previousState ? this.calculateStateDiff(previousState, currentState) : undefined
    };

    const snapshots = this.stateSnapshots.get(stateName) || [];
    snapshots.push(snapshot);

    // Maintain max 50 snapshots per state
    if (snapshots.length > 50) {
      snapshots.shift();
    }

    this.stateSnapshots.set(stateName, snapshots);

    logger.debug(`State snapshot captured: ${stateName}`, 'state-debug', {
      changeType,
      hasChanges: snapshot.diff && Object.keys(snapshot.diff).length > 0
    });

    // Notify watchers
    const watchers = this.stateWatchers.get(stateName) || [];
    watchers.forEach(watcher => {
      try {
        watcher(currentState, previousState);
      } catch (error) {
        logger.error(`State watcher error for ${stateName}`, 'state-debug', { error });
      }
    });
  }

  private calculateStateDiff(oldState: any, newState: any): any {
    const diff: any = {};

    const getAllKeys = (obj1: any, obj2: any) => {
      const keys = new Set([
        ...Object.keys(obj1 || {}),
        ...Object.keys(obj2 || {})
      ]);
      return Array.from(keys);
    };

    const keys = getAllKeys(oldState, newState);

    for (const key of keys) {
      const oldValue = oldState?.[key];
      const newValue = newState?.[key];

      if (oldValue !== newValue) {
        if (typeof oldValue === 'object' && typeof newValue === 'object' &&
            oldValue !== null && newValue !== null) {
          const nestedDiff = this.calculateStateDiff(oldValue, newValue);
          if (Object.keys(nestedDiff).length > 0) {
            diff[key] = nestedDiff;
          }
        } else {
          diff[key] = {
            from: oldValue,
            to: newValue
          };
        }
      }
    }

    return diff;
  }

  watchState(stateName: string, callback: (state: any, prevState?: any) => void): () => void {
    const watchers = this.stateWatchers.get(stateName) || [];
    watchers.push(callback);
    this.stateWatchers.set(stateName, watchers);

    // Return unwatch function
    return () => {
      const currentWatchers = this.stateWatchers.get(stateName) || [];
      const index = currentWatchers.indexOf(callback);
      if (index > -1) {
        currentWatchers.splice(index, 1);
        this.stateWatchers.set(stateName, currentWatchers);
      }
    };
  }

  getStateHistory(stateName: string, limit?: number): StateSnapshot[] {
    const snapshots = this.stateSnapshots.get(stateName) || [];
    return limit ? snapshots.slice(-limit) : [...snapshots];
  }

  // Component Debugging
  registerComponent(
    name: string,
    props: any,
    state?: any,
    renderTime?: number
  ): void {
    const existing = this.componentInfo.get(name);
    const info: ComponentDebugInfo = {
      name,
      props: this.sanitizeProps(props),
      state: state ? this.deepClone(state) : undefined,
      renderCount: existing ? existing.renderCount + 1 : 1,
      lastRenderTime: new Date().toISOString(),
      performance: existing?.performance
    };

    if (renderTime && renderTime > 0) {
      if (!info.performance) {
        info.performance = {
          avgRenderTime: renderTime,
          slowRenders: renderTime > 100 ? 1 : 0
        };
      } else {
        const totalTime = info.performance.avgRenderTime * (info.renderCount - 1) + renderTime;
        info.performance.avgRenderTime = totalTime / info.renderCount;
        if (renderTime > 100) {
          info.performance.slowRenders++;
        }
      }
    }

    this.componentInfo.set(name, info);

    if (info.renderCount % 10 === 0) {
      logger.debug(`Component ${name} has rendered ${info.renderCount} times`, 'component-debug', {
        avgRenderTime: info.performance?.avgRenderTime,
        slowRenders: info.performance?.slowRenders
      });
    }
  }

  private sanitizeProps(props: any): any {
    if (!props || typeof props !== 'object') return props;

    const sanitized: any = {};

    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'function') {
        sanitized[key] = '[Function]';
      } else if (React.isValidElement(value)) {
        sanitized[key] = '[ReactElement]';
      } else if (typeof value === 'object' && value !== null) {
        try {
          sanitized[key] = this.deepClone(value);
        } catch {
          sanitized[key] = '[Object - Cannot Clone]';
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  getComponentInfo(name?: string): ComponentDebugInfo | ComponentDebugInfo[] {
    if (name) {
      return this.componentInfo.get(name) || {
        name,
        props: {},
        renderCount: 0,
        lastRenderTime: ''
      };
    }

    return Array.from(this.componentInfo.values());
  }

  // Memory Leak Detection
  trackObjectForLeaks(key: string, obj: any): void {
    this.memoryLeakDetector.set(key, new WeakRef(obj));
  }

  checkForMemoryLeaks(): { [key: string]: boolean } {
    const results: { [key: string]: boolean } = {};

    for (const [key, weakRef] of this.memoryLeakDetector.entries()) {
      const obj = weakRef.deref();
      results[key] = obj !== undefined; // true means object still exists (potential leak)
    }

    const leaks = Object.entries(results).filter(([, exists]) => exists);
    if (leaks.length > 0) {
      logger.warn(`Potential memory leaks detected`, 'memory-debug', {
        leaks: leaks.map(([key]) => key)
      });
    }

    return results;
  }

  // Browser Environment Debugging
  getBrowserInfo(): {
    userAgent: string;
    viewport: { width: number; height: number };
    devicePixelRatio: number;
    language: string;
    cookiesEnabled: boolean;
    onLine: boolean;
    storage: {
      localStorage: boolean;
      sessionStorage: boolean;
      quota?: number;
      used?: number;
    };
  } {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'Server Side',
        viewport: { width: 0, height: 0 },
        devicePixelRatio: 1,
        language: 'unknown',
        cookiesEnabled: false,
        onLine: false,
        storage: {
          localStorage: false,
          sessionStorage: false
        }
      };
    }

    const storage: any = {
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined'
    };

    // Check storage quota if available
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        storage.quota = estimate.quota;
        storage.used = estimate.usage;
      }).catch(() => {
        // Ignore errors
      });
    }

    return {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      devicePixelRatio: window.devicePixelRatio || 1,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      storage
    };
  }

  // Performance Analysis
  analyzePerformance(): {
    summary: any;
    recommendations: string[];
  } {
    const summary = performanceMonitor.getPerformanceSummary();
    const recommendations: string[] = [];

    if (summary.avgPageLoadTime > 3000) {
      recommendations.push('Page load time is high (>3s). Consider optimizing bundle size and images.');
    }

    if (summary.avgComponentRenderTime > 50) {
      recommendations.push('Average component render time is high (>50ms). Consider memoization.');
    }

    if (summary.longTaskCount > 5) {
      recommendations.push('Too many long tasks detected. Consider code splitting and async processing.');
    }

    if (summary.errorRate > 5) {
      recommendations.push('High error rate detected. Check network connectivity and API endpoints.');
    }

    if (summary.memoryUsage && summary.memoryUsage > 50 * 1024 * 1024) {
      recommendations.push('High memory usage detected. Check for memory leaks.');
    }

    return { summary, recommendations };
  }

  // Utility Methods
  private deepClone(obj: any): any {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return '[Object - Cannot Serialize]';
    }
  }

  exportDebugData(): {
    stateSnapshots: { [key: string]: StateSnapshot[] };
    componentInfo: ComponentDebugInfo[];
    browserInfo: any;
    performance: any;
    timestamp: string;
  } {
    return {
      stateSnapshots: Object.fromEntries(this.stateSnapshots),
      componentInfo: Array.from(this.componentInfo.values()),
      browserInfo: this.getBrowserInfo(),
      performance: this.analyzePerformance(),
      timestamp: new Date().toISOString()
    };
  }

  clearDebugData(): void {
    this.stateSnapshots.clear();
    this.componentInfo.clear();
    this.memoryLeakDetector.clear();
    this.stateWatchers.clear();
    logger.info('Debug data cleared', 'debug-utils');
  }
}

// Export singleton instance
export const debugUtils = new DebugUtils();

// React Hooks for debugging
export const useStateDebug = (stateName: string, state: any) => {
  const prevStateRef = React.useRef(state);

  React.useEffect(() => {
    if (prevStateRef.current !== state) {
      debugUtils.captureStateSnapshot(stateName, state, 'update', prevStateRef.current);
      prevStateRef.current = state;
    }
  }, [stateName, state]);

  return {
    captureSnapshot: () => debugUtils.captureStateSnapshot(stateName, state),
    getHistory: (limit?: number) => debugUtils.getStateHistory(stateName, limit)
  };
};

export const useComponentDebug = (componentName: string, props?: any, state?: any) => {
  const renderCountRef = React.useRef(0);
  const renderStartRef = React.useRef<number>();

  React.useEffect(() => {
    renderStartRef.current = performance.now();
  });

  React.useEffect(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      renderCountRef.current++;
      debugUtils.registerComponent(componentName, props, state, renderTime);
    }
  });

  return {
    renderCount: renderCountRef.current,
    getInfo: () => debugUtils.getComponentInfo(componentName)
  };
};