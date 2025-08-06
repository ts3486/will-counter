import { ServiceResponse } from '../interfaces/IBaseService';
import { IWillCountService } from '../interfaces/IWillCountService';
import { BaseService } from './BaseService';
import { WillCount, UserStatistics } from '../../../../shared/types/database';

/**
 * WillCount service implementation using Supabase as the data source
 */
export class WillCountService extends BaseService implements IWillCountService {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(supabaseUrl: string, supabaseKey: string) {
    super('WillCountService');
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

  async getTodayCount(userId: string): Promise<ServiceResponse<WillCount>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(
          `${this.supabaseUrl}/rest/v1/will_counts?user_id=eq.${encodeURIComponent(userId)}&date=eq.${today}`,
          {
            headers: {
              ...this.getHeaders(),
              'Prefer': 'return=representation'
            }
          }
        );
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to fetch today count: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const records = Array.isArray(response) ? response : [response];
      
      if (records.length > 0 && records[0]) {
        return this.createSuccessResponse(records[0]);
      } else {
        // Return a default structure for today
        const defaultRecord: WillCount = {
          id: 'temp-id',
          user_id: userId,
          count: 0,
          date: today,
          timestamps: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return this.createSuccessResponse(defaultRecord);
      }
    } catch (error) {
      return this.createErrorResponse(
        'GET_TODAY_COUNT_FAILED',
        'Failed to get today count',
        error
      );
    }
  }

  async incrementCount(userId: string): Promise<ServiceResponse<WillCount>> {
    try {
      // First try to use the database function
      const functionResult = await this.tryIncrementFunction(userId);
      if (functionResult.success) {
        return functionResult;
      }

      // Fallback to manual increment
      return await this.manualIncrement(userId);
    } catch (error) {
      return this.createErrorResponse(
        'INCREMENT_COUNT_FAILED',
        'Failed to increment count',
        error
      );
    }
  }

  async resetTodayCount(userId: string): Promise<ServiceResponse<WillCount>> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if record exists for today
      const getCurrentResult = await this.getTodayCount(userId);
      if (!getCurrentResult.success) {
        return getCurrentResult;
      }

      const currentRecord = getCurrentResult.data!;

      if (currentRecord.id !== 'temp-id') {
        // Update existing record
        const response = await this.executeWithRetry(async () => {
          const result = await fetch(
            `${this.supabaseUrl}/rest/v1/will_counts?id=eq.${encodeURIComponent(currentRecord.id)}`,
            {
              method: 'PATCH',
              headers: {
                ...this.getHeaders(),
                'Prefer': 'return=representation'
              },
              body: JSON.stringify({
                count: 0,
                timestamps: [],
                updated_at: new Date().toISOString()
              })
            }
          );
          
          if (!result.ok) {
            const errorText = await result.text();
            throw new Error(`Failed to reset count: ${result.status} ${errorText}`);
          }
          
          return result.json();
        });

        const updatedRecord = Array.isArray(response) ? response[0] : response;
        return this.createSuccessResponse(updatedRecord);
      } else {
        // Create new record with count 0
        const response = await this.executeWithRetry(async () => {
          const result = await fetch(`${this.supabaseUrl}/rest/v1/will_counts`, {
            method: 'POST',
            headers: {
              ...this.getHeaders(),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              user_id: userId,
              count: 0,
              date: today,
              timestamps: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          });
          
          if (!result.ok) {
            const errorText = await result.text();
            throw new Error(`Failed to create reset record: ${result.status} ${errorText}`);
          }
          
          return result.json();
        });

        const newRecord = Array.isArray(response) ? response[0] : response;
        return this.createSuccessResponse(newRecord);
      }
    } catch (error) {
      return this.createErrorResponse(
        'RESET_TODAY_COUNT_FAILED',
        'Failed to reset today count',
        error
      );
    }
  }

  async getCountForDate(userId: string, date: string): Promise<ServiceResponse<WillCount | null>> {
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(
          `${this.supabaseUrl}/rest/v1/will_counts?user_id=eq.${encodeURIComponent(userId)}&date=eq.${date}`,
          {
            headers: this.getHeaders()
          }
        );
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to fetch count for date: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const records = Array.isArray(response) ? response : [response];
      const record = records.length > 0 ? records[0] : null;
      
      return this.createSuccessResponse(record);
    } catch (error) {
      return this.createErrorResponse(
        'GET_COUNT_FOR_DATE_FAILED',
        'Failed to get count for date',
        error
      );
    }
  }

  async getUserStatistics(userId: string, days: number = 30): Promise<ServiceResponse<UserStatistics[]>> {
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(
          `${this.supabaseUrl}/rest/v1/rpc/get_user_statistics`,
          {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
              p_user_id: userId,
              p_days: days
            })
          }
        );
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to fetch user statistics: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const statistics = Array.isArray(response) ? response : [response];
      return this.createSuccessResponse(statistics);
    } catch (error) {
      return this.createErrorResponse(
        'GET_USER_STATISTICS_FAILED',
        'Failed to get user statistics',
        error
      );
    }
  }

  async getAllCounts(userId: string): Promise<ServiceResponse<WillCount[]>> {
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(
          `${this.supabaseUrl}/rest/v1/will_counts?user_id=eq.${encodeURIComponent(userId)}&order=date.desc`,
          {
            headers: this.getHeaders()
          }
        );
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to fetch all counts: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const counts = Array.isArray(response) ? response : [response];
      return this.createSuccessResponse(counts);
    } catch (error) {
      return this.createErrorResponse(
        'GET_ALL_COUNTS_FAILED',
        'Failed to get all counts',
        error
      );
    }
  }

  async batchUpdateCounts(userId: string, updates: Partial<WillCount>[]): Promise<ServiceResponse<WillCount[]>> {
    try {
      const results: WillCount[] = [];
      
      // Process updates sequentially to avoid conflicts
      for (const update of updates) {
        if (!update.id) {
          continue; // Skip updates without ID
        }
        
        const response = await this.executeWithRetry(async () => {
          const result = await fetch(
            `${this.supabaseUrl}/rest/v1/will_counts?id=eq.${encodeURIComponent(update.id!)}`,
            {
              method: 'PATCH',
              headers: {
                ...this.getHeaders(),
                'Prefer': 'return=representation'
              },
              body: JSON.stringify({
                ...update,
                updated_at: new Date().toISOString()
              })
            }
          );
          
          if (!result.ok) {
            const errorText = await result.text();
            throw new Error(`Failed to update count: ${result.status} ${errorText}`);
          }
          
          return result.json();
        });

        const updatedRecord = Array.isArray(response) ? response[0] : response;
        if (updatedRecord) {
          results.push(updatedRecord);
        }
      }

      return this.createSuccessResponse(results);
    } catch (error) {
      return this.createErrorResponse(
        'BATCH_UPDATE_COUNTS_FAILED',
        'Failed to batch update counts',
        error
      );
    }
  }

  private async tryIncrementFunction(userId: string): Promise<ServiceResponse<WillCount>> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/increment_will_count`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ p_user_id: userId })
      });

      if (response.ok) {
        const result = await response.json();
        return this.createSuccessResponse(result);
      } else {
        return this.createErrorResponse('FUNCTION_FAILED', 'Database function failed');
      }
    } catch (error) {
      return this.createErrorResponse('FUNCTION_ERROR', 'Function call error', error);
    }
  }

  private async manualIncrement(userId: string): Promise<ServiceResponse<WillCount>> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current count
    const getCurrentResult = await this.getTodayCount(userId);
    if (!getCurrentResult.success) {
      return getCurrentResult;
    }

    const currentRecord = getCurrentResult.data!;

    if (currentRecord.id !== 'temp-id') {
      // Update existing record
      const newCount = currentRecord.count + 1;
      const newTimestamps = [...(currentRecord.timestamps || []), new Date().toISOString()];
      
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(
          `${this.supabaseUrl}/rest/v1/will_counts?id=eq.${encodeURIComponent(currentRecord.id)}`,
          {
            method: 'PATCH',
            headers: {
              ...this.getHeaders(),
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              count: newCount,
              timestamps: newTimestamps,
              updated_at: new Date().toISOString()
            })
          }
        );
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to increment count: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const updatedRecord = Array.isArray(response) ? response[0] : response;
      return this.createSuccessResponse(updatedRecord);
    } else {
      // Create new record
      const response = await this.executeWithRetry(async () => {
        const result = await fetch(`${this.supabaseUrl}/rest/v1/will_counts`, {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: userId,
            count: 1,
            date: today,
            timestamps: [new Date().toISOString()],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        });
        
        if (!result.ok) {
          const errorText = await result.text();
          throw new Error(`Failed to create count record: ${result.status} ${errorText}`);
        }
        
        return result.json();
      });

      const newRecord = Array.isArray(response) ? response[0] : response;
      return this.createSuccessResponse(newRecord);
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