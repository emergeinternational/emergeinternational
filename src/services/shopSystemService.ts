
import { supabase } from "@/integrations/supabase/client";
import { validateShopAction } from "./shopAuthService";
import { toast } from "sonner";

// Types
export interface ShopSystemSettings {
  diagnosticsEnabled: boolean;
  recoveryMode: boolean;
  fallbackLevel: string;
  lastSeededDate: string | null;
  seedCount: number;
  liveSync: boolean;
  pollingInterval: number;
}

export interface ProductSnapshot {
  id: string;
  snapshotFilePath: string;
  createdAt: string;
  createdBy: string;
  productCount: number;
  version: number;
}

// Default settings
const DEFAULT_SETTINGS: ShopSystemSettings = {
  diagnosticsEnabled: true,
  recoveryMode: false,
  fallbackLevel: "minimal",
  lastSeededDate: null,
  seedCount: 0,
  liveSync: true,
  pollingInterval: 5000
};

// Get current system settings
export const getShopSystemSettings = async (): Promise<ShopSystemSettings> => {
  try {
    if (!validateShopAction('admin', 'fetch_system_settings')) {
      return DEFAULT_SETTINGS;
    }

    const { data: settingsData, error } = await supabase
      .from('shop_system_settings')
      .select('*');
      
    if (error) throw error;
    
    // Map raw settings to our structured format
    if (settingsData && settingsData.length > 0) {
      const diagnosticsSettings = settingsData.find(s => s.key === 'diagnostics_enabled');
      const recoverySettings = settingsData.find(s => s.key === 'recovery_mode');
      const mockupSettings = settingsData.find(s => s.key === 'mockup_data');
      const syncSettings = settingsData.find(s => s.key === 'sync_settings');
      
      return {
        diagnosticsEnabled: diagnosticsSettings?.value?.enabled || DEFAULT_SETTINGS.diagnosticsEnabled,
        recoveryMode: recoverySettings?.value?.enabled || DEFAULT_SETTINGS.recoveryMode,
        fallbackLevel: recoverySettings?.value?.fallback_level || DEFAULT_SETTINGS.fallbackLevel,
        lastSeededDate: mockupSettings?.value?.last_seeded || DEFAULT_SETTINGS.lastSeededDate,
        seedCount: mockupSettings?.value?.seed_count || DEFAULT_SETTINGS.seedCount,
        liveSync: syncSettings?.value?.live_sync || DEFAULT_SETTINGS.liveSync,
        pollingInterval: syncSettings?.value?.polling_interval || DEFAULT_SETTINGS.pollingInterval
      };
    }
    
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error fetching shop system settings:", error);
    return DEFAULT_SETTINGS;
  }
};

// Update a specific system setting
export const updateShopSystemSetting = async (
  key: 'diagnostics_enabled' | 'recovery_mode' | 'mockup_data' | 'sync_settings',
  value: any
): Promise<boolean> => {
  try {
    if (!validateShopAction('admin', `update_system_setting_${key}`)) {
      return false;
    }

    const { data, error } = await supabase
      .from('shop_system_settings')
      .update({ value })
      .eq('key', key);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error updating shop system setting ${key}:`, error);
    toast.error(`Failed to update system setting: ${key}`);
    return false;
  }
};

// Toggle diagnostics mode
export const toggleDiagnosticsMode = async (enabled: boolean): Promise<boolean> => {
  try {
    if (!validateShopAction('admin', 'toggle_diagnostics')) {
      return false;
    }
    
    return await updateShopSystemSetting('diagnostics_enabled', {
      enabled,
      access_level: 'admin'
    });
  } catch (error) {
    console.error("Error toggling diagnostics mode:", error);
    return false;
  }
};

// Toggle recovery mode
export const toggleRecoveryMode = async (enabled: boolean, level = 'minimal'): Promise<boolean> => {
  try {
    if (!validateShopAction('admin', 'toggle_recovery')) {
      return false;
    }
    
    return await updateShopSystemSetting('recovery_mode', {
      enabled,
      fallback_level: level
    });
  } catch (error) {
    console.error("Error toggling recovery mode:", error);
    return false;
  }
};

// Generate mock product data
export const generateMockProducts = async (count: number = 5): Promise<boolean> => {
  try {
    if (!validateShopAction('admin', 'generate_mock_products')) {
      toast.error("You don't have permission to generate mock products");
      return false;
    }
    
    const { data, error } = await supabase
      .rpc('generate_mock_products', { count });
      
    if (error) throw error;
    
    toast.success(`Successfully generated ${count} mock products`);
    return true;
  } catch (error) {
    console.error("Error generating mock products:", error);
    toast.error("Failed to generate mock products");
    return false;
  }
};

// Get product snapshots
export const getProductSnapshots = async (): Promise<ProductSnapshot[]> => {
  try {
    if (!validateShopAction('admin', 'get_product_snapshots')) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('shop_product_snapshots')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data?.map(snapshot => ({
      id: snapshot.id,
      snapshotFilePath: snapshot.snapshot_file_path,
      createdAt: snapshot.created_at,
      createdBy: snapshot.created_by,
      productCount: snapshot.product_count,
      version: snapshot.version
    })) || [];
  } catch (error) {
    console.error("Error fetching product snapshots:", error);
    return [];
  }
};

// Create a manual product snapshot
export const createProductSnapshot = async (): Promise<boolean> => {
  try {
    if (!validateShopAction('admin', 'create_product_snapshot')) {
      return false;
    }
    
    // Trigger the snapshot function by making a dummy update to a product
    await supabase.rpc('create_product_snapshot');
    
    toast.success("Product snapshot created successfully");
    return true;
  } catch (error) {
    console.error("Error creating product snapshot:", error);
    toast.error("Failed to create product snapshot");
    return false;
  }
};

// Get product change history for a specific product
export const getProductChangeHistory = async (productId: string): Promise<any[]> => {
  try {
    if (!validateShopAction('admin', 'get_product_history')) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('shop_metadata')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching product change history:", error);
    return [];
  }
};
