
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ProductSnapshot } from '@/types/shop';
import { 
  getProductSnapshots, 
  createProductSnapshot,
  restoreFromSnapshot,
  addRecoveryLog
} from '@/services/shop/shopRecoveryService';
import { validateShopAction } from '@/services/shopAuthService';

/**
 * Hook for managing product snapshots
 */
export const useProductSnapshots = (isLocked = false) => {
  const [snapshots, setSnapshots] = useState<ProductSnapshot[]>([]);
  const [isSnapshotting, setIsSnapshotting] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);

  // Load snapshots on mount
  useEffect(() => {
    loadSnapshots();
  }, []);

  /**
   * Load product snapshots
   */
  const loadSnapshots = async () => {
    try {
      const snapshotData = await getProductSnapshots();
      setSnapshots(snapshotData);
    } catch (error) {
      console.error("Error loading snapshots:", error);
      toast.error("Failed to load product snapshots");
      await addRecoveryLog('load_snapshots', 'failure', { error: String(error) });
    }
  };

  /**
   * Handle creating a manual snapshot
   */
  const handleCreateSnapshot = async () => {
    if (isLocked || !validateShopAction('admin', 'create_snapshot')) {
      toast.error("You don't have permission to create snapshots");
      await addRecoveryLog('create_snapshot', 'failure', { reason: 'permission_denied' });
      return;
    }
    
    try {
      setIsSnapshotting(true);
      await addRecoveryLog('create_snapshot', 'pending');
      
      const success = await createProductSnapshot();
      
      if (success) {
        toast.success("Product snapshot created successfully");
        await addRecoveryLog('create_snapshot', 'success');
        await loadSnapshots();
      } else {
        await addRecoveryLog('create_snapshot', 'failure');
      }
    } catch (error) {
      console.error("Error creating snapshot:", error);
      toast.error("Failed to create product snapshot");
      await addRecoveryLog('create_snapshot', 'failure', { error: String(error) });
    } finally {
      setIsSnapshotting(false);
    }
  };

  /**
   * Handle restoring from a snapshot
   */
  const handleRestoreSnapshot = async (snapshotId: string) => {
    if (isLocked || !validateShopAction('admin', 'restore_snapshot')) {
      toast.error("You don't have permission to restore snapshots");
      await addRecoveryLog('restore_snapshot', 'failure', { reason: 'permission_denied', snapshotId });
      return;
    }
    
    try {
      setIsRestoring(true);
      setSelectedSnapshotId(snapshotId);
      await addRecoveryLog('restore_snapshot', 'pending', { snapshotId });
      
      const success = await restoreFromSnapshot(snapshotId);
      
      if (success) {
        toast.success("Successfully restored from snapshot");
        await addRecoveryLog('restore_snapshot', 'success', { snapshotId });
      } else {
        await addRecoveryLog('restore_snapshot', 'failure', { snapshotId });
      }
    } catch (error) {
      console.error("Error restoring from snapshot:", error);
      toast.error("Failed to restore from snapshot");
      await addRecoveryLog('restore_snapshot', 'failure', { snapshotId, error: String(error) });
    } finally {
      setIsRestoring(false);
      setSelectedSnapshotId(null);
    }
  };

  return {
    snapshots,
    isSnapshotting,
    isRestoring,
    selectedSnapshotId,
    loadSnapshots,
    handleCreateSnapshot,
    handleRestoreSnapshot
  };
};
