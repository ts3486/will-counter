import { 
  IBaseService, 
  ServiceResponse, 
  ServiceError, 
  ServiceConfig 
} from '../interfaces/IBaseService';

/**
 * Base service implementation providing common functionality
 */
export abstract class BaseService implements IBaseService {
  protected config: ServiceConfig;
  protected isInitialized: boolean = false;
  
  constructor(
    public readonly serviceName: string,
    config: ServiceConfig = {}
  ) {
    this.config = {
      retryAttempts: 3,
      timeoutMs: 30000,
      enableLogging: true,
      ...config,
    };
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    try {
      await this.onInitialize();
      this.isInitialized = true;
      this.log('Service initialized successfully');
    } catch (error) {
      this.logError('Failed to initialize service', error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }
    
    try {
      await this.onDispose();
      this.isInitialized = false;
      this.log('Service disposed successfully');
    } catch (error) {
      this.logError('Failed to dispose service', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async isHealthy(): Promise<boolean> {
    try {
      return await this.onHealthCheck();
    } catch (error) {
      this.logError('Health check failed', error);
      return false;
    }
  }

  /**
   * Create a success response
   */
  protected createSuccessResponse<T>(data: T): ServiceResponse<T> {
    return {
      success: true,
      data,
    };
  }

  /**
   * Create an error response
   */
  protected createErrorResponse<T>(
    code: string,
    message: string,
    details?: unknown
  ): ServiceResponse<T> {
    const error: ServiceError = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
    
    this.logError(`Service error [${code}]: ${message}`, details);
    
    return {
      success: false,
      error,
    };
  }

  /**
   * Execute operation with retry logic
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.config.retryAttempts || 3
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.log(`Attempt ${attempt}/${retries} failed`, error);
        
        if (attempt === retries) {
          break;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Log messages if logging is enabled
   */
  protected log(message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      console.log(`[${this.serviceName}] ${message}`, data || '');
    }
  }

  /**
   * Log errors
   */
  protected logError(message: string, error?: unknown): void {
    console.error(`[${this.serviceName}] ${message}`, error || '');
  }

  /**
   * Delay execution
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Override in subclasses for custom initialization
   */
  protected async onInitialize(): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Override in subclasses for custom disposal
   */
  protected async onDispose(): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Override in subclasses for custom health checks
   */
  protected async onHealthCheck(): Promise<boolean> {
    return this.isInitialized;
  }
}