import { serviceContainer } from './ServiceContainer';
import { ErrorHandler, AppError } from '../utils/errorHandler';
import { WillCount, User } from '../../../shared/types/database';

/**
 * Improved API service that uses the service layer
 * This provides a bridge between the existing API interface and the new service layer
 */
export const improvedApiService = {
  /**
   * Initialize the service layer
   */
  async initialize(): Promise<void> {
    const supabaseUrl = 'https://mrbyvoccayqxddwrnsye.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYnl2b2NjYXlxeGRkd3Juc3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMDY2MzgsImV4cCI6MjA2MTU4MjYzOH0.HZvhGXkPsd1Uq_UQRQrfXChVhUy7jb3S5AqYl9x1qkI';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYnl2b2NjYXlxeGRkd3Juc3llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjAwNjYzOCwiZXhwIjoyMDYxNTgyNjM4fQ.XcWsv0uJ4UfrL4usgwUmk40Ktq93u-m8lWQ_V3XlgKA';

    try {
      await serviceContainer.initialize({
        supabaseUrl,
        supabaseAnonKey,
        supabaseServiceKey,
      });
    } catch (error) {
      const appError = ErrorHandler.createError(
        'SERVICE_INIT_FAILED',
        'Failed to initialize services',
        error
      );
      ErrorHandler.logError(appError);
      throw appError;
    }
  },

  /**
   * Get today's count for a user
   */
  async getTodayCount(userId: string): Promise<WillCount> {
    try {
      // Ensure user exists first
      const testUserAuth0Id = 'test-user-1';
      const testEmail = 'test@example.com';
      
      const userService = serviceContainer.getUserService();
      const userResult = await userService.ensureUserExists(testUserAuth0Id, testEmail);
      
      if (!userResult.success || !userResult.data) {
        throw ErrorHandler.createError(
          'USER_ENSURE_FAILED',
          'Failed to ensure user exists',
          userResult.error
        );
      }

      const actualUserId = userResult.data.id;
      const willCountService = serviceContainer.getWillCountService();
      const result = await willCountService.getTodayCount(actualUserId);

      if (!result.success || !result.data) {
        throw ErrorHandler.handleApiError(result.error);
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error; // Already an AppError
      }
      
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  },

  /**
   * Increment the count for a user
   */
  async incrementCount(userId: string): Promise<WillCount> {
    try {
      // Ensure user exists first
      const testUserAuth0Id = 'test-user-1';
      const testEmail = 'test@example.com';
      
      const userService = serviceContainer.getUserService();
      const userResult = await userService.ensureUserExists(testUserAuth0Id, testEmail);
      
      if (!userResult.success || !userResult.data) {
        throw ErrorHandler.createError(
          'USER_ENSURE_FAILED',
          'Failed to ensure user exists',
          userResult.error
        );
      }

      const actualUserId = userResult.data.id;
      const willCountService = serviceContainer.getWillCountService();
      const result = await willCountService.incrementCount(actualUserId);

      if (!result.success || !result.data) {
        throw ErrorHandler.handleApiError(result.error);
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error; // Already an AppError
      }
      
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  },

  /**
   * Reset today's count for a user
   */
  async resetTodayCount(userId: string): Promise<WillCount> {
    try {
      // Ensure user exists first
      const testUserAuth0Id = 'test-user-1';
      const testEmail = 'test@example.com';
      
      const userService = serviceContainer.getUserService();
      const userResult = await userService.ensureUserExists(testUserAuth0Id, testEmail);
      
      if (!userResult.success || !userResult.data) {
        throw ErrorHandler.createError(
          'USER_ENSURE_FAILED',
          'Failed to ensure user exists',
          userResult.error
        );
      }

      const actualUserId = userResult.data.id;
      const willCountService = serviceContainer.getWillCountService();
      const result = await willCountService.resetTodayCount(actualUserId);

      if (!result.success || !result.data) {
        throw ErrorHandler.handleApiError(result.error);
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error; // Already an AppError
      }
      
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  },

  /**
   * Create a user
   */
  async createUser(auth0Id: string, email: string): Promise<User> {
    try {
      const userService = serviceContainer.getUserService();
      const result = await userService.createUser(auth0Id, email);

      if (!result.success || !result.data) {
        throw ErrorHandler.handleApiError(result.error);
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error; // Already an AppError
      }
      
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  },

  /**
   * Ensure user exists
   */
  async ensureUserExists(auth0Id: string, email: string): Promise<string> {
    try {
      const userService = serviceContainer.getUserService();
      const result = await userService.ensureUserExists(auth0Id, email);

      if (!result.success || !result.data) {
        throw ErrorHandler.handleApiError(result.error);
      }

      return result.data.id;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error; // Already an AppError
      }
      
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);
      throw appError;
    }
  },

  /**
   * Check service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const status = await serviceContainer.healthCheck();
      return status.overall;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },
};