
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductSnapshot, RecoveryLogEntry, ShopSystemSettings } from "@/types/shop";

/**
 * Get system settings for the shop
 */
export const getShopSystemSettings = async (): Promise<ShopSystemSettings> => {
  try {
    console.log("Fetching shop system settings...");
    
    // Get all settings in a single query
    const { data, error } = await supabase
      .from('shop_system_settings')
      .select('key, value')
      .in('key', ['recovery_mode', 'live_sync', 'mockup_data', 'diagnostics_mode']);
    
    if (error) {
      console.error("Error fetching shop system settings:", error);
      throw error;
    }
    
    // Convert array of settings to an object
    const settings: ShopSystemSettings = {};
    data?.forEach(item => {
      if (item.key === 'recovery_mode') {
        settings.recoveryMode = item.value?.enabled === true;
        settings.fallbackLevel = item.value?.mode || 'minimal';
      } else if (item.key === 'live_sync') {
        settings.liveSync = item.value?.enabled === true;
      } else if (item.key === 'mockup_data') {
        settings.mockupData = {
          last_seeded: item.value?.last_seeded,
          seed_count: item.value?.seed_count
        };
      } else if (item.key === 'diagnostics_mode') {
        settings.diagnosticsEnabled = item.value?.enabled === true;
      }
    });
    
    return settings;
  } catch (error) {
    console.error("Error in getShopSystemSettings:", error);
    return {};
  }
};

/**
 * Generate mock products
 */
export const generateMockProducts = async (count: number = 5): Promise<boolean> => {
  try {
    console.log(`Generating ${count} mock products...`);
    
    // Call the RPC function to generate mock products
    const { data, error } = await supabase.rpc('generate_mock_products', { count });
    
    if (error) {
      console.error("Error generating mock products:", error);
      throw error;
    }
    
    console.log(`Successfully generated ${count} mock products`);
    return true;
  } catch (error) {
    console.error("Error in generateMockProducts:", error);
    toast.error("Failed to generate mock products");
    return false;
  }
};

/**
 * Get all product snapshots
 */
export const getProductSnapshots = async (): Promise<ProductSnapshot[]> => {
  try {
    const { data, error } = await supabase
      .from('shop_product_snapshots')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(snapshot => ({
      id: snapshot.id,
      createdAt: snapshot.created_at,
      version: snapshot.version,
      productCount: snapshot.product_count,
      createdBy: snapshot.created_by,
      filePath: snapshot.snapshot_file_path
    }));
  } catch (error) {
    console.error("Error fetching product snapshots:", error);
    return [];
  }
};

/**
 * Create manual product snapshot
 */
export const createProductSnapshot = async (): Promise<boolean> => {
  try {
    console.log("Creating product snapshot...");
    
    // Create a direct object with empty parameters to fix the error
    const { error } = await supabase.rpc('create_product_snapshot', {});
    
    if (error) {
      console.error("Error creating product snapshot:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error creating product snapshot:", error);
    toast.error("Failed to create product snapshot");
    return false;
  }
};

/**
 * Restore from a product snapshot
 */
export const restoreFromSnapshot = async (snapshotId: string): Promise<boolean> => {
  try {
    // This would call a server-side function to handle the restore
    // For now, we'll just implement a placeholder
    console.log(`Restoring from snapshot ID: ${snapshotId}`);
    
    // In a real implementation, we would call an RPC function like:
    // const { error } = await supabase.rpc('restore_product_snapshot', { snapshot_id: snapshotId });
    
    toast.warning("Snapshot restoration is not yet implemented");
    return false;
  } catch (error) {
    console.error("Error restoring from snapshot:", error);
    toast.error("Failed to restore from snapshot");
    return false;
  }
};

/**
 * Run synchronization to fix inconsistencies
 */
export const runShopSync = async (): Promise<boolean> => {
  try {
    console.log("Running shop synchronization...");
    
    // This would be a full sync operation that ensures:
    // 1. All products with variations are properly linked
    // 2. All collections have the correct product counts
    // 3. Any orphaned data is cleaned up
    
    // In a real implementation, we'd call an RPC function
    // const { error } = await supabase.rpc('sync_shop_data');
    
    toast.warning("Shop synchronization is not yet implemented");
    return true;
  } catch (error) {
    console.error("Error running shop sync:", error);
    toast.error("Failed to synchronize shop data");
    return false;
  }
};

/**
 * Get recovery logs
 */
export const getRecoveryLogs = async (): Promise<RecoveryLogEntry[]> => {
  try {
    // In a real implementation, we'd fetch logs from a database table
    // For now, we'll return mock data
    return [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        action: 'system_startup',
        status: 'success',
        details: { message: 'Recovery tools initialized' }
      }
    ];
  } catch (error) {
    console.error("Error getting recovery logs:", error);
    return [];
  }
};

/**
 * Add a new recovery log entry
 */
export const addRecoveryLog = async (
  action: string, 
  status: 'success' | 'failure' | 'pending', 
  details?: any
): Promise<RecoveryLogEntry> => {
  try {
    const newLog: RecoveryLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      status,
      details
    };
    
    // In a real implementation, we'd save this log to the database
    // For now, we just return the log entry
    
    return newLog;
  } catch (error) {
    console.error("Error adding recovery log:", error);
    return {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      status: 'failure',
      details: { error: String(error) }
    };
  }
};
