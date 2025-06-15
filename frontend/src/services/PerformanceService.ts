import React, { ComponentType } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

export class PerformanceService {
  private static metrics: PerformanceMetric[] = [];
  private static isEnabled: boolean = __DEV__; // Only in development

  static startTimer(name: string): () => void {
    if (!this.isEnabled) return () => {};

    const startTime = Date.now();
    
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.recordMetric(name, duration);
      
      if (__DEV__) {
        console.log(`⏱️ Performance: ${name} took ${duration}ms`);
      }
    };
  }

  static recordMetric(name: string, value: number): void {
    if (!this.isEnabled) return;

    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
    });

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  static getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;

    const sum = relevantMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / relevantMetrics.length;
  }

  static clearMetrics(): void {
    this.metrics = [];
  }

  // Memory usage tracking
  static trackMemoryUsage(): void {
    if (!this.isEnabled || !(performance as any).memory) return;

    const memory = (performance as any).memory;
    this.recordMetric('memory.used', memory.usedJSHeapSize);
    this.recordMetric('memory.total', memory.totalJSHeapSize);
    this.recordMetric('memory.limit', memory.jsHeapSizeLimit);
  }

  // Track component render times
  static trackComponentRender<T extends React.ComponentType<any>>(
    Component: T,
    displayName?: string
  ): T {
    if (!this.isEnabled) return Component;

    const name = displayName || Component.displayName || Component.name || 'Unknown';
    
    return React.memo(React.forwardRef((props: any, ref: any) => {
      const endTimer = this.startTimer(`render.${name}`);
      
      React.useEffect(() => {
        endTimer();
      });

      return React.createElement(Component, { ...props, ref });
    })) as any;
  }
}

// Hook for tracking component performance
export const usePerformanceTracker = (componentName: string) => {
  const [renderCount, setRenderCount] = React.useState(0);

  React.useEffect(() => {
    setRenderCount(prev => prev + 1);
    PerformanceService.recordMetric(`render.count.${componentName}`, renderCount + 1);
  });

  const trackAction = React.useCallback((actionName: string) => {
    return PerformanceService.startTimer(`action.${componentName}.${actionName}`);
  }, [componentName]);

  return { renderCount, trackAction };
};