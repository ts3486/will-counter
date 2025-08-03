import { IUserService } from './interfaces/IUserService';
import { IWillCountService } from './interfaces/IWillCountService';
import { UserService } from './implementations/UserService';
import { WillCountService } from './implementations/WillCountService';

/**
 * Service container for dependency injection.
 * Provides centralized access to all services.
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private userService: IUserService | null = null;
  private willCountService: IWillCountService | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Initialize all services
   */
  async initialize(config: ServiceContainerConfig): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize user service
      this.userService = new UserService(
        config.supabaseUrl,
        config.supabaseServiceKey || config.supabaseAnonKey
      );
      await this.userService.initialize();

      // Initialize will count service
      this.willCountService = new WillCountService(
        config.supabaseUrl,
        config.supabaseServiceKey || config.supabaseAnonKey
      );
      await this.willCountService.initialize();

      this.isInitialized = true;
      console.log('[ServiceContainer] All services initialized successfully');
    } catch (error) {
      console.error('[ServiceContainer] Failed to initialize services:', error);
      throw error;
    }
  }

  /**
   * Get the user service
   */
  getUserService(): IUserService {
    if (!this.userService) {
      throw new Error('UserService not initialized. Call initialize() first.');
    }
    return this.userService;
  }

  /**
   * Get the will count service
   */
  getWillCountService(): IWillCountService {
    if (!this.willCountService) {
      throw new Error('WillCountService not initialized. Call initialize() first.');
    }
    return this.willCountService;
  }

  /**
   * Check if all services are healthy
   */
  async healthCheck(): Promise<ServiceHealthStatus> {
    const status: ServiceHealthStatus = {
      overall: false,
      services: {}
    };

    if (!this.isInitialized) {
      status.overall = false;
      status.services.container = { healthy: false, error: 'Not initialized' };
      return status;
    }

    try {
      // Check user service
      if (this.userService) {
        status.services.userService = {
          healthy: await this.userService.isHealthy()
        };
      }

      // Check will count service
      if (this.willCountService) {
        status.services.willCountService = {
          healthy: await this.willCountService.isHealthy()
        };
      }

      // Overall health is true if all services are healthy
      status.overall = Object.values(status.services).every(s => s.healthy);
    } catch (error) {
      status.overall = false;
      status.services.container = { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    return status;
  }

  /**
   * Dispose all services
   */
  async dispose(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      if (this.userService) {
        await this.userService.dispose();
        this.userService = null;
      }

      if (this.willCountService) {
        await this.willCountService.dispose();
        this.willCountService = null;
      }

      this.isInitialized = false;
      console.log('[ServiceContainer] All services disposed successfully');
    } catch (error) {
      console.error('[ServiceContainer] Failed to dispose services:', error);
      throw error;
    }
  }

  /**
   * Reset the singleton instance (for testing)
   */
  static reset(): void {
    if (ServiceContainer.instance) {
      ServiceContainer.instance.dispose().catch(console.error);
    }
    ServiceContainer.instance = new ServiceContainer();
  }
}

/**
 * Configuration for the service container
 */
export interface ServiceContainerConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
}

/**
 * Health status for services
 */
export interface ServiceHealthStatus {
  overall: boolean;
  services: {
    [serviceName: string]: {
      healthy: boolean;
      error?: string;
    };
  };
}

/**
 * Global service container instance
 */
export const serviceContainer = ServiceContainer.getInstance();