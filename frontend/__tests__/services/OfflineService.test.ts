import { OfflineService } from '../../src/services/OfflineService';

// Mock MMKV
const mockMMKV = {
  set: jest.fn(),
  getString: jest.fn(),
  getBoolean: jest.fn(),
  delete: jest.fn(),
};

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => mockMMKV),
}));

describe('OfflineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMMKV.getString.mockReturnValue(undefined);
    mockMMKV.getBoolean.mockReturnValue(undefined);
  });

  describe('offline increments', () => {
    it('should store offline increment', async () => {
      const increment = {
        timestamp: '2023-01-01T00:00:00.000Z',
        count: 1,
      };

      mockMMKV.getString.mockReturnValue('[]');

      await OfflineService.storeOfflineIncrement(increment);

      expect(mockMMKV.set).toHaveBeenCalledWith(
        'offline_increments',
        JSON.stringify([increment])
      );
    });

    it('should get offline increments', () => {
      const increments = [
        { timestamp: '2023-01-01T00:00:00.000Z', count: 1 },
        { timestamp: '2023-01-01T01:00:00.000Z', count: 2 },
      ];

      mockMMKV.getString.mockReturnValue(JSON.stringify(increments));

      const result = OfflineService.getOfflineIncrements();

      expect(result).toEqual(increments);
    });

    it('should return empty array when no increments stored', () => {
      mockMMKV.getString.mockReturnValue(undefined);

      const result = OfflineService.getOfflineIncrements();

      expect(result).toEqual([]);
    });

    it('should clear offline increments', () => {
      OfflineService.clearOfflineIncrements();

      expect(mockMMKV.delete).toHaveBeenCalledWith('offline_increments');
    });

    it('should get offline increment count', () => {
      const increments = [
        { timestamp: '2023-01-01T00:00:00.000Z', count: 3 },
        { timestamp: '2023-01-01T01:00:00.000Z', count: 2 },
      ];

      mockMMKV.getString.mockReturnValue(JSON.stringify(increments));

      const result = OfflineService.getOfflineIncrementCount();

      expect(result).toBe(5);
    });
  });

  describe('offline mode', () => {
    it('should set offline mode', () => {
      OfflineService.setOfflineMode(true);

      expect(mockMMKV.set).toHaveBeenCalledWith('offline_mode', true);
    });

    it('should get offline mode', () => {
      mockMMKV.getBoolean.mockReturnValue(true);

      const result = OfflineService.isOfflineMode();

      expect(result).toBe(true);
    });

    it('should return false when offline mode not set', () => {
      mockMMKV.getBoolean.mockReturnValue(undefined);

      const result = OfflineService.isOfflineMode();

      expect(result).toBe(false);
    });
  });

  describe('sync management', () => {
    it('should set last sync time', () => {
      const timestamp = '2023-01-01T00:00:00.000Z';

      OfflineService.setLastSyncTime(timestamp);

      expect(mockMMKV.set).toHaveBeenCalledWith('last_sync', timestamp);
    });

    it('should get last sync time', () => {
      const timestamp = '2023-01-01T00:00:00.000Z';
      mockMMKV.getString.mockReturnValue(timestamp);

      const result = OfflineService.getLastSyncTime();

      expect(result).toBe(timestamp);
    });

    it('should determine if sync is needed', () => {
      // Mock increments exist
      mockMMKV.getString.mockImplementation((key) => {
        if (key === 'offline_increments') {
          return JSON.stringify([{ timestamp: '2023-01-01T00:00:00.000Z', count: 1 }]);
        }
        return undefined;
      });

      const result = OfflineService.shouldSync();

      expect(result).toBe(true);
    });

    it('should not sync when no increments', () => {
      mockMMKV.getString.mockReturnValue('[]');

      const result = OfflineService.shouldSync();

      expect(result).toBe(false);
    });
  });
});