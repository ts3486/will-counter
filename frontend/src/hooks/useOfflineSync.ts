import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { syncOfflineIncrements } from '../store/slices/willCounterSlice';
import { OfflineService } from '../services/OfflineService';
import { NetworkService } from '../services/NetworkService';

export const useOfflineSync = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.willCounter);

  const syncOfflineData = useCallback(async () => {
    if (!user?.id || loading) return;

    const offlineIncrements = OfflineService.getOfflineIncrements();
    const totalOfflineIncrements = OfflineService.getOfflineIncrementCount();

    if (totalOfflineIncrements === 0) return;

    try {
      console.log(`Syncing ${totalOfflineIncrements} offline increments...`);
      
      await dispatch(syncOfflineIncrements({
        userId: user.id,
        increments: totalOfflineIncrements,
      })).unwrap();

      // Clear offline data after successful sync
      OfflineService.clearOfflineIncrements();
      OfflineService.setLastSyncTime(new Date().toISOString());
      
      console.log('Offline sync completed successfully');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }, [dispatch, user?.id, loading]);

  const handleNetworkChange = useCallback((isConnected: boolean) => {
    OfflineService.setOfflineMode(!isConnected);
    
    if (isConnected && OfflineService.shouldSync()) {
      // Delay sync to ensure connection is stable
      setTimeout(() => {
        syncOfflineData();
      }, 2000);
    }
  }, [syncOfflineData]);

  useEffect(() => {
    // Initialize network service
    NetworkService.initialize();
    
    // Add network listener
    const unsubscribe = NetworkService.addListener(handleNetworkChange);
    
    // Check if we need to sync on mount
    if (NetworkService.getIsConnected() && OfflineService.shouldSync()) {
      syncOfflineData();
    }

    return unsubscribe;
  }, [handleNetworkChange, syncOfflineData]);

  return {
    isOffline: OfflineService.isOfflineMode(),
    offlineIncrementCount: OfflineService.getOfflineIncrementCount(),
    syncOfflineData,
  };
};