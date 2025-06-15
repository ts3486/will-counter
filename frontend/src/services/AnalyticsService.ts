interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface UserAction {
  action: string;
  screen: string;
  timestamp: number;
  userId?: string;
}

export class AnalyticsService {
  private static events: AnalyticsEvent[] = [];
  private static userActions: UserAction[] = [];
  private static sessionId: string = this.generateSessionId();
  private static userId?: string;
  private static isEnabled: boolean = !__DEV__; // Disabled in development

  // Initialize analytics
  static initialize(userId?: string): void {
    this.userId = userId;
    this.sessionId = this.generateSessionId();
    
    if (this.isEnabled) {
      this.trackEvent('app_opened');
    }
  }

  // Track events
  static trackEvent(name: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) {
      console.log(`📊 Analytics: ${name}`, properties);
      return;
    }

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.events.push(event);
    this.flushIfNeeded();
  }

  // Track user actions
  static trackUserAction(action: string, screen: string): void {
    const userAction: UserAction = {
      action,
      screen,
      timestamp: Date.now(),
      userId: this.userId,
    };

    this.userActions.push(userAction);
    this.trackEvent('user_action', userAction);
  }

  // Track screen views
  static trackScreenView(screenName: string): void {
    this.trackEvent('screen_view', { screen: screenName });
  }

  // Track will counter specific events
  static trackWillCounterIncrement(count: number, isOffline: boolean = false): void {
    this.trackEvent('will_counter_increment', {
      count,
      isOffline,
      timestamp: Date.now(),
    });
  }

  static trackWillCounterDaily(dailyCount: number): void {
    this.trackEvent('will_counter_daily_summary', {
      dailyCount,
      date: new Date().toISOString().split('T')[0],
    });
  }

  // Track authentication events
  static trackAuthentication(action: 'login' | 'logout' | 'login_failed'): void {
    this.trackEvent('authentication', { action });
  }

  // Track errors
  static trackError(error: Error, context?: string): void {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    });
  }

  // Track performance metrics
  static trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.trackEvent('performance', {
      metric,
      value,
      unit,
    });
  }

  // Get analytics data
  static getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  static getUserActions(): UserAction[] {
    return [...this.userActions];
  }

  // Session management
  static setUserId(userId: string): void {
    this.userId = userId;
    this.trackEvent('user_identified', { userId });
  }

  static clearUserId(): void {
    this.userId = undefined;
    this.trackEvent('user_logged_out');
  }

  static getSessionId(): string {
    return this.sessionId;
  }

  static startNewSession(): void {
    this.sessionId = this.generateSessionId();
    this.trackEvent('session_started');
  }

  // Flush events to analytics service
  private static flushIfNeeded(): void {
    if (this.events.length >= 50) {
      this.flush();
    }
  }

  static flush(): void {
    if (!this.isEnabled || this.events.length === 0) return;

    // In a real app, send events to analytics service
    console.log('📊 Flushing analytics events:', this.events.length);
    
    // Clear events after flushing
    this.events = [];
  }

  // Utility methods
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get usage statistics
  static getUsageStats(): {
    totalEvents: number;
    totalActions: number;
    sessionDuration: number;
    topActions: { action: string; count: number; screen: string }[];
  } {
    const sessionStart = this.events.find(e => e.name === 'session_started')?.timestamp || Date.now();
    const sessionDuration = Date.now() - sessionStart;

    // Count actions
    const actionCounts = new Map<string, { count: number; screen: string }>();
    this.userActions.forEach(action => {
      const key = `${action.action}_${action.screen}`;
      const existing = actionCounts.get(key) || { count: 0, screen: action.screen };
      actionCounts.set(key, { count: existing.count + 1, screen: action.screen });
    });

    const topActions = Array.from(actionCounts.entries())
      .map(([key, value]) => ({
        action: key.split('_')[0],
        count: value.count,
        screen: value.screen,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: this.events.length,
      totalActions: this.userActions.length,
      sessionDuration,
      topActions,
    };
  }
}