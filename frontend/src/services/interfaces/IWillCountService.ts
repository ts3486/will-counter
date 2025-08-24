import { IBaseService, ServiceResponse } from './IBaseService';
import { WillCount, UserStatistics } from '../../../../shared/types/database';

/**
 * Will Count service interface for managing daily will count data
 */
export interface IWillCountService extends IBaseService {
  /**
   * Get today's count for a user
   */
  getTodayCount(userId: string): Promise<ServiceResponse<WillCount>>;
  
  /**
   * Increment the count for today
   */
  incrementCount(userId: string): Promise<ServiceResponse<WillCount>>;
  
  /**
   * Reset today's count to zero
   */
  resetTodayCount(userId: string): Promise<ServiceResponse<WillCount>>;
  
  /**
   * Get count for a specific date
   */
  getCountForDate(userId: string, date: string): Promise<ServiceResponse<WillCount | null>>;
  
  /**
   * Get user statistics for a date range
   */
  getUserStatistics(userId: string, days?: number): Promise<ServiceResponse<UserStatistics[]>>;
  
  /**
   * Get all counts for a user
   */
  getAllCounts(userId: string): Promise<ServiceResponse<WillCount[]>>;
  
  /**
   * Batch update counts (for offline sync)
   */
  batchUpdateCounts(userId: string, updates: Partial<WillCount>[]): Promise<ServiceResponse<WillCount[]>>;
}