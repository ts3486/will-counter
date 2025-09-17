import { IBaseService, ServiceResponse } from './IBaseService';
import { User } from '../../../../shared/types/database';

/**
 * User service interface for managing user data and authentication
 */
export interface IUserService extends IBaseService {
  /**
   * Create a new user in the system
   */
  createUser(auth0Id: string, email: string): Promise<ServiceResponse<User>>;
  
  /**
   * Get user by Auth0 ID
   */
  getUserByAuth0Id(auth0Id: string): Promise<ServiceResponse<User | null>>;
  
  /**
   * Get user by email
   */
  getUserByEmail(email: string): Promise<ServiceResponse<User | null>>;
  
  /**
   * Get user by UUID
   */
  getUserById(id: string): Promise<ServiceResponse<User | null>>;
  
  /**
   * Ensure user exists, create if not found
   */
  ensureUserExists(auth0Id: string, email: string): Promise<ServiceResponse<User>>;
  
  /**
   * Update user preferences
   */
  updateUserPreferences(userId: string, preferences: Record<string, unknown>): Promise<ServiceResponse<User>>;
  
  /**
   * Update user's last login timestamp
   */
  updateLastLogin(userId: string): Promise<ServiceResponse<User>>;
}