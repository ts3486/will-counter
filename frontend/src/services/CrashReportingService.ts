interface CrashReport {
  id: string;
  timestamp: number;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context: {
    userId?: string;
    sessionId: string;
    screen?: string;
    userAgent?: string;
    appVersion: string;
    platform: string;
  };
  breadcrumbs: Breadcrumb[];
  metadata?: Record<string, any>;
}

interface Breadcrumb {
  timestamp: number;
  message: string;
  level: 'info' | 'warning' | 'error';
  category: string;
  data?: Record<string, any>;
}

export class CrashReportingService {
  private static breadcrumbs: Breadcrumb[] = [];
  private static isEnabled: boolean = !__DEV__;
  private static maxBreadcrumbs: number = 50;
  private static userId?: string;
  private static sessionId: string = this.generateId();

  // Initialize crash reporting
  static initialize(userId?: string): void {
    this.userId = userId;
    this.sessionId = this.generateId();

    if (this.isEnabled) {
      this.setupGlobalErrorHandlers();
    }

    this.addBreadcrumb('Crash reporting initialized', 'info', 'system');
  }

  // Setup global error handlers
  private static setupGlobalErrorHandlers(): void {
    // Handle uncaught JavaScript errors
    const originalHandler = (global as any).ErrorUtils?.getGlobalHandler();
    
    (global as any).ErrorUtils?.setGlobalHandler((error: any, isFatal: boolean) => {
      this.reportCrash(error, {
        isFatal,
        source: 'global_error_handler',
      });

      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: any) => {
      const error = event.reason || new Error('Unhandled Promise Rejection');
      this.reportCrash(error, {
        source: 'unhandled_promise_rejection',
        promise: true,
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }
  }

  // Add breadcrumb
  static addBreadcrumb(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    category: string = 'user',
    data?: Record<string, any>
  ): void {
    const breadcrumb: Breadcrumb = {
      timestamp: Date.now(),
      message,
      level,
      category,
      data,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }

    if (__DEV__) {
      console.log(`🍞 Breadcrumb [${level}]: ${message}`, data);
    }
  }

  // Report crash
  static reportCrash(error: Error, metadata?: Record<string, any>): void {
    const crashReport: CrashReport = {
      id: this.generateId(),
      timestamp: Date.now(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: {
        userId: this.userId,
        sessionId: this.sessionId,
        appVersion: '1.0.0', // Could be from package.json
        platform: 'react-native',
        // Additional context could be added here
      },
      breadcrumbs: [...this.breadcrumbs],
      metadata,
    };

    if (this.isEnabled) {
      this.sendCrashReport(crashReport);
    } else {
      console.error('💥 Crash Report:', crashReport);
    }

    // Add crash as breadcrumb for future reports
    this.addBreadcrumb(
      `Crash reported: ${error.message}`,
      'error',
      'crash'
    );
  }

  // Send crash report to service
  private static async sendCrashReport(report: CrashReport): Promise<void> {
    try {
      // In a real app, send to crash reporting service (Sentry, Bugsnag, etc.)
      console.log('📤 Sending crash report:', report.id);
      
      // Example: await fetch('/api/crash-reports', { method: 'POST', body: JSON.stringify(report) });
      
    } catch (error) {
      console.error('Failed to send crash report:', error);
    }
  }

  // Set user context
  static setUser(userId: string, metadata?: Record<string, any>): void {
    this.userId = userId;
    this.addBreadcrumb(`User set: ${userId}`, 'info', 'user', metadata);
  }

  static clearUser(): void {
    this.userId = undefined;
    this.addBreadcrumb('User cleared', 'info', 'user');
  }

  // Set additional context
  static setContext(key: string, value: any): void {
    this.addBreadcrumb(`Context set: ${key}`, 'info', 'context', { [key]: value });
  }

  // Track navigation
  static trackNavigation(from: string, to: string): void {
    this.addBreadcrumb(
      `Navigation: ${from} → ${to}`,
      'info',
      'navigation',
      { from, to }
    );
  }

  // Track user actions
  static trackUserAction(action: string, screen: string, data?: Record<string, any>): void {
    this.addBreadcrumb(
      `User action: ${action} on ${screen}`,
      'info',
      'user_action',
      { action, screen, ...data }
    );
  }

  // Track API calls
  static trackApiCall(url: string, method: string, status?: number): void {
    const level = status && status >= 400 ? 'error' : 'info';
    this.addBreadcrumb(
      `API call: ${method} ${url}`,
      level,
      'api',
      { url, method, status }
    );
  }

  // Get breadcrumbs (for debugging)
  static getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  // Clear breadcrumbs
  static clearBreadcrumbs(): void {
    this.breadcrumbs = [];
    this.addBreadcrumb('Breadcrumbs cleared', 'info', 'system');
  }

  // Generate unique ID
  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Test crash reporting (for debugging)
  static testCrash(): void {
    throw new Error('Test crash from CrashReportingService');
  }
}