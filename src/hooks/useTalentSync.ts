
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  syncTalentData, 
  getTalentSyncLogs,
  ExternalTalentData,
  transformTalentData,
  insertTalentToDB,
  checkTalentExists,
  updateTalentInDB,
  getSyncStatusSummary,
  getTalentRegistrationCounts,
  forceSyncTalentData
} from "@/services/talentSyncService";
import { Talent } from "@/types/talentTypes";

/**
 * Hook for managing talent synchronization operations
 */
export function useTalentSync() {
  const queryClient = useQueryClient();
  
  // Query to fetch sync logs
  const syncLogsQuery = useQuery({
    queryKey: ['talent-sync-logs'],
    queryFn: () => getTalentSyncLogs(),
  });
  
  // Query to fetch sync status
  const syncStatusQuery = useQuery({
    queryKey: ['talent-sync-status'],
    queryFn: getSyncStatusSummary,
  });
  
  // Registration counts query
  const registrationCountsQuery = useQuery({
    queryKey: ['talent-registration-counts'],
    queryFn: getTalentRegistrationCounts,
  });
  
  // Standard sync mutation
  const syncMutation = useMutation({
    mutationFn: syncTalentData,
    onSuccess: () => {
      // Invalidate and refetch queries related to talent data
      queryClient.invalidateQueries({ queryKey: ['talent-data'] });
      queryClient.invalidateQueries({ queryKey: ['talent-sync-logs'] });
      queryClient.invalidateQueries({ queryKey: ['talent-sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['talent-registration-counts'] });
    },
  });
  
  // Force sync mutation
  const forceSyncMutation = useMutation({
    mutationFn: forceSyncTalentData,
    onSuccess: () => {
      // Invalidate and refetch queries related to talent data
      queryClient.invalidateQueries({ queryKey: ['talent-data'] });
      queryClient.invalidateQueries({ queryKey: ['talent-sync-logs'] });
      queryClient.invalidateQueries({ queryKey: ['talent-sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['talent-registration-counts'] });
    },
  });
  
  // Mutation to add a single talent
  const addTalentMutation = useMutation({
    mutationFn: async (externalData: ExternalTalentData) => {
      // Transform external data to our format
      const transformedTalent = transformTalentData(externalData);
      
      // Check if talent already exists
      const { exists, talent } = await checkTalentExists(externalData.email);
      
      if (exists && talent) {
        // Update existing talent
        await updateTalentInDB(talent.id, transformedTalent);
        return { ...talent, ...transformedTalent };
      } else {
        // Insert new talent
        return await insertTalentToDB(transformedTalent);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-data'] });
      queryClient.invalidateQueries({ queryKey: ['talent-sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['talent-registration-counts'] });
    },
  });
  
  // Function to manually trigger sync
  const runSync = useCallback(() => {
    return syncMutation.mutateAsync();
  }, [syncMutation]);
  
  // Function to force sync
  const runForceSync = useCallback(() => {
    return forceSyncMutation.mutateAsync();
  }, [forceSyncMutation]);
  
  // Function to add a single talent
  const addOrUpdateTalent = useCallback((data: ExternalTalentData) => {
    return addTalentMutation.mutateAsync(data);
  }, [addTalentMutation]);
  
  return {
    // Sync operations
    runSync,
    runForceSync,
    addOrUpdateTalent,
    isSyncing: syncMutation.isPending,
    isForceSyncing: forceSyncMutation.isPending,
    isAdding: addTalentMutation.isPending,
    
    // Sync results
    syncResult: syncMutation.data,
    forceSyncResult: forceSyncMutation.data,
    syncError: syncMutation.error,
    forceSyncError: forceSyncMutation.error,
    
    // Sync logs
    syncLogs: syncLogsQuery.data || [],
    isLogsLoading: syncLogsQuery.isLoading,
    refetchLogs: syncLogsQuery.refetch,
    
    // Sync status
    syncStatus: syncStatusQuery.data,
    isStatusLoading: syncStatusQuery.isLoading,
    
    // Registration counts
    registrationCounts: registrationCountsQuery.data,
    isCountsLoading: registrationCountsQuery.isLoading,
  };
}
