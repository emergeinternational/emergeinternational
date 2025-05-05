
import { useState, useEffect } from 'react';
import { RecoveryLogEntry } from '@/types/shop';
import { getRecoveryLogs } from '@/services/shop/shopRecoveryService';

/**
 * Hook for managing shop diagnostics
 */
export const useShopDiagnostics = () => {
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load recovery logs on mount
  useEffect(() => {
    const loadRecoveryLogs = async () => {
      try {
        setIsLoading(true);
        const logs = await getRecoveryLogs();
        setRecoveryLogs(logs);
      } catch (error) {
        console.error("Error loading recovery logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecoveryLogs();
  }, []);

  return {
    recoveryLogs,
    isLoading
  };
};
