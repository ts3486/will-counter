import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from '../utils/mockMMKV';

// Initialize MMKV for faster offline storage
const storage = new MMKV();

export interface OfflineIncrement {
  timestamp: string;
  count: number;
}

export class OfflineService {
  private static readonly OFFLINE_INCREMENTS_KEY = 'offline_increments';
  private static readonly OFFLINE_MODE_KEY = 'offline_mode';
  private static readonly LAST_SYNC_KEY = 'last_sync';

  // Store offline increments
  static async storeOfflineIncrement(increment: OfflineIncrement): Promise<void> {
    try {
      const existingData = this.getOfflineIncrements();
      const updatedData = [...existingData, increment];
      storage.set(this.OFFLINE_INCREMENTS_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to store offline increment:', error);
    }
  }

  // Get stored offline increments
  static getOfflineIncrements(): OfflineIncrement[] {
    try {
      const data = storage.getString(this.OFFLINE_INCREMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get offline increments:', error);
      return [];
    }
  }

  // Clear offline increments after successful sync
  static clearOfflineIncrements(): void {
    try {
      storage.delete(this.OFFLINE_INCREMENTS_KEY);
    } catch (error) {
      console.error('Failed to clear offline increments:', error);
    }
  }

  // Get total offline increment count
  static getOfflineIncrementCount(): number {
    const increments = this.getOfflineIncrements();
    return increments.reduce((total, increment) => total + increment.count, 0);
  }

  // Set offline mode
  static setOfflineMode(isOffline: boolean): void {
    try {
      storage.set(this.OFFLINE_MODE_KEY, isOffline);
    } catch (error) {
      console.error('Failed to set offline mode:', error);
    }
  }

  // Get offline mode status
  static isOfflineMode(): boolean {
    try {
      return storage.getBoolean(this.OFFLINE_MODE_KEY) ?? false;
    } catch (error) {
      console.error('Failed to get offline mode:', error);
      return false;
    }
  }

  // Set last sync timestamp
  static setLastSyncTime(timestamp: string): void {
    try {
      storage.set(this.LAST_SYNC_KEY, timestamp);
    } catch (error) {
      console.error('Failed to set last sync time:', error);
    }
  }

  // Get last sync timestamp
  static getLastSyncTime(): string | null {
    try {
      return storage.getString(this.LAST_SYNC_KEY) ?? null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  // Cache user data for offline access
  static async cacheUserData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to cache user data:', error);
    }
  }

  // Get cached user data
  static async getCachedUserData(key: string): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(`cache_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get cached user data:', error);
      return null;
    }
  }

  // Clear all cached data
  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Check if we need to sync
  static shouldSync(): boolean {
    const lastSync = this.getLastSyncTime();
    const offlineIncrements = this.getOfflineIncrements();
    
    if (offlineIncrements.length === 0) {
      return false;
    }

    if (!lastSync) {
      return true;
    }

    // Sync if last sync was more than 5 minutes ago
    const lastSyncTime = new Date(lastSync);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    return lastSyncTime < fiveMinutesAgo;
  }
}