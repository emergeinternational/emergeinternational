
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  getShopSystemSettings,
  runShopSync,
  addRecoveryLog
} from '@/services/shop/shopRecoveryService';
import { validateShopAction } from '@/services/shopAuthService';

/**
 * Hook for managing shop synchronization
 */
export const useShopSync = (isLocked = false) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'out-of-sync' | 'unknown'>('unknown');
  const [systemInfo, setSystemInfo] = useState<{
    lastSeedDate: string | null;
    seedCount: number;
    mockupCount: number;
  }>({
    lastSeedDate: null,
    seedCount: 0,
    mockupCount: 0
  });

  // Load system info on mount
  useEffect(() => {
    loadSystemInfo();
  }, []);

  /**
   * Load system information
   */
  const loadSystemInfo = async () => {
    try {
      // Get system settings
      const settings = await getShopSystemSettings();
      
      // Count mockup products (products created by system)
      const mockupData = settings.mockupData || {};
      
      setSystemInfo({
        lastSeedDate: mockupData.last_seeded || null,
        seedCount: mockupData.seed_count || 0,
        mockupCount: 0 // We would get this from a database count in production
      });
      
      // Set sync status to synced by default
      setSyncStatus('synced');
    } catch (error) {
      console.error("Error loading system info:", error);
      setSyncStatus('unknown');
      await addRecoveryLog('load_system_info', 'failure', { error: String(error) });
    }
  };

  /**
   * Handle running a full shop sync
   */
  const handleRunSync = async () => {
    if (isLocked || !validateShopAction('admin', 'run_shop_sync')) {
      toast.error("You don't have permission to run shop synchronization");
      await addRecoveryLog('run_shop_sync', 'failure', { reason: 'permission_denied' });
      return;
    }
    
    try {
      setIsSyncing(true);
      await addRecoveryLog('run_shop_sync', 'pending');
      
      const success = await runShopSync();
      
      if (success) {
        toast.success("Shop synchronization completed successfully");
        await addRecoveryLog('run_shop_sync', 'success');
        await loadSystemInfo();
        setSyncStatus('synced');
      } else {
        await addRecoveryLog('run_shop_sync', 'failure');
      }
    } catch (error) {
      console.error("Error running shop sync:", error);
      toast.error("Failed to synchronize shop data");
      await addRecoveryLog('run_shop_sync', 'failure', { error: String(error) });
      setSyncStatus('out-of-sync');
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    syncStatus,
    systemInfo,
    handleRunSync,
    loadSystemInfo
  };
};
