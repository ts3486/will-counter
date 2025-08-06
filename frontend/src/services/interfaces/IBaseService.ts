/**
 * Base service interface that all services should implement.
 * Provides common error handling and configuration.
 */
export interface IBaseService {
  /**
   * Service name for logging and debugging
   */
  readonly serviceName: string;
  
  /**
   * Initialize the service (e.g., setup connections, auth)
   */
  initialize(): Promise<void>;
  
  /**
   * Cleanup resources when service is no longer needed
   */
  dispose(): Promise<void>;
  
  /**
   * Health check for the service
   */
  isHealthy(): Promise<boolean>;
}

/**
 * Standard service response wrapper
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
}

/**
 * Standard service error structure
 */
export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  retryAttempts?: number;
  timeoutMs?: number;
  enableLogging?: boolean;
}