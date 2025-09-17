import { ServiceResponse } from '../interfaces/IBaseService';
import { IUserService } from '../interfaces/IUserService';
import { BaseService } from './BaseService';
import { User } from '../../../../shared/types/database';

/**
 * User service implementation using Supabase as the data source
 */
export class UserService extends BaseService implements IUserService {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(supabaseUrl: string, supabaseKey: string) {
    super('UserService');
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
  }

  protected async onInitialize(): Promise<void> {
    // Validate configuration
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Supabase URL and key are required');
    }
  }

  protected async onHealthCheck(): Promise<boolean> {
    try {
      // Simple health check by making a lightweight API call
      const response = await fetch(`${this.supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async createUser(auth0Id: string, email: string): Promise<ServiceResponse<User>> {
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(`${this.supabaseUrl}/rest/v1/users`, {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ auth0_id: auth0Id, email })
        });
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to create user: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const userData = Array.isArray(response) ? response[0] : response;
      return this.createSuccessResponse(userData);
    } catch (error) {
      return this.createErrorResponse(
        'CREATE_USER_FAILED',
        'Failed to create user',
        error
      );
    }
  }

  async getUserByAuth0Id(auth0Id: string): Promise<ServiceResponse<User | null>> {
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(
          `${this.supabaseUrl}/rest/v1/users?auth0_id=eq.${encodeURIComponent(auth0Id)}`,
          {
            headers: this.getHeaders(),
          }
        );
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to fetch user: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const users = Array.isArray(response) ? response : [response];
      const user = users.length > 0 ? users[0] : null;
      
      return this.createSuccessResponse(user);
    } catch (error) {
      return this.createErrorResponse(
        'GET_USER_BY_AUTH0_ID_FAILED',
        'Failed to get user by Auth0 ID',
        error
      );
    }
  }

  async getUserByEmail(email: string): Promise<ServiceResponse<User | null>> {
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(
          `${this.supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}`,
          {
            headers: this.getHeaders(),
          }
        );
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to fetch user: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const users = Array.isArray(response) ? response : [response];
      const user = users.length > 0 ? users[0] : null;
      
      return this.createSuccessResponse(user);
    } catch (error) {
      return this.createErrorResponse(
        'GET_USER_BY_EMAIL_FAILED',
        'Failed to get user by email',
        error
      );
    }
  }

  async getUserById(id: string): Promise<ServiceResponse<User | null>> {
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(
          `${this.supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(id)}`,
          {
            headers: this.getHeaders(),
          }
        );
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to fetch user: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const users = Array.isArray(response) ? response : [response];
      const user = users.length > 0 ? users[0] : null;
      
      return this.createSuccessResponse(user);
    } catch (error) {
      return this.createErrorResponse(
        'GET_USER_BY_ID_FAILED',
        'Failed to get user by ID',
        error
      );
    }
  }

  async ensureUserExists(auth0Id: string, email: string): Promise<ServiceResponse<User>> {
    try {
      // First try to get by Auth0 ID
      const existingUserResult = await this.getUserByAuth0Id(auth0Id);
      if (existingUserResult.success && existingUserResult.data) {
        return this.createSuccessResponse(existingUserResult.data);
      }

      // Try to get by email
      const userByEmailResult = await this.getUserByEmail(email);
      if (userByEmailResult.success && userByEmailResult.data) {
        // Update the Auth0 ID for this user
        const updateResult = await this.updateUserAuth0Id(userByEmailResult.data.id, auth0Id);
        if (updateResult.success && updateResult.data) {
          return this.createSuccessResponse(updateResult.data);
        }
      }

      // Create new user if not found
      return await this.createUser(auth0Id, email);
    } catch (error) {
      return this.createErrorResponse(
        'ENSURE_USER_EXISTS_FAILED',
        'Failed to ensure user exists',
        error
      );
    }
  }

  async updateUserPreferences(
    userId: string, 
    preferences: Record<string, unknown>
  ): Promise<ServiceResponse<User>> {
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(
          `${this.supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`,
          {
            method: 'PATCH',
            headers: {
              ...this.getHeaders(),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ preferences })
          }
        );
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to update user preferences: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const userData = Array.isArray(response) ? response[0] : response;
      return this.createSuccessResponse(userData);
    } catch (error) {
      return this.createErrorResponse(
        'UPDATE_USER_PREFERENCES_FAILED',
        'Failed to update user preferences',
        error
      );
    }
  }

  async updateLastLogin(userId: string): Promise<ServiceResponse<User>> {
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(
          `${this.supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`,
          {
            method: 'PATCH',
            headers: {
              ...this.getHeaders(),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ last_login: new Date().toISOString() })
          }
        );
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to update last login: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const userData = Array.isArray(response) ? response[0] : response;
      return this.createSuccessResponse(userData);
    } catch (error) {
      return this.createErrorResponse(
        'UPDATE_LAST_LOGIN_FAILED',
        'Failed to update last login',
        error
      );
    }
  }

  private async updateUserAuth0Id(userId: string, auth0Id: string): Promise<ServiceResponse<User>> {
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(
          `${this.supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`,
          {
            method: 'PATCH',
            headers: {
              ...this.getHeaders(),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ auth0_id: auth0Id })
          }
        );
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to update Auth0 ID: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const userData = Array.isArray(response) ? response[0] : response;
      return this.createSuccessResponse(userData);
    } catch (error) {
      return this.createErrorResponse(
        'UPDATE_AUTH0_ID_FAILED',
        'Failed to update Auth0 ID',
        error
      );
    }
  }

  private getHeaders() {
    return {
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json'
    };
  }
}