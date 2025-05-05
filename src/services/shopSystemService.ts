
import { supabase } from "@/integrations/supabase/client";
import { ShopSystemSettings, DiagnosticTest, DiagnosticStatus, RLSPolicy } from "@/types/shop";
import { toast } from "sonner";

export interface ProductSnapshot {
  id: string;
  createdAt: string;
  version: number;
  productCount: number;
  createdBy: string;
  filePath: string;
}

// Get system settings for the shop
export const getShopSystemSettings = async (): Promise<ShopSystemSettings> => {
  try {
    console.log("Fetching shop system settings...");
    
    // Get all settings in a single query
    const { data, error } = await supabase
      .from('shop_system_settings')
      .select('key, value')
      .in('key', ['recovery_mode', 'live_sync', 'mockup_data']);
    
    if (error) {
      console.error("Error fetching shop system settings:", error);
      throw error;
    }
    
    // Convert array of settings to an object
    const settings: ShopSystemSettings = {};
    data?.forEach(item => {
      if (item.key === 'recovery_mode') {
        settings.recoveryMode = item.value?.enabled === true;
      } else if (item.key === 'live_sync') {
        settings.liveSync = item.value?.enabled === true;
      } else if (item.key === 'mockup_data') {
        settings.mockupData = {
          last_seeded: item.value?.last_seeded,
          seed_count: item.value?.seed_count
        };
      }
    });
    
    return settings;
  } catch (error) {
    console.error("Error in getShopSystemSettings:", error);
    return {};
  }
};

// Toggle recovery mode
export const toggleRecoveryMode = async (
  enabled: boolean, 
  mode: 'full' | 'minimal' = 'full'
): Promise<boolean> => {
  try {
    console.log(`Setting recovery mode to ${enabled ? 'enabled' : 'disabled'} (${mode})`);
    
    const { error } = await supabase
      .from('shop_system_settings')
      .upsert({
        key: 'recovery_mode',
        value: { enabled, mode },
        updated_at: new Date().toISOString(),
        updated_by: (await supabase.auth.getUser()).data.user?.id
      }, {
        onConflict: 'key'
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error toggling recovery mode:", error);
    return false;
  }
};

// Generate mock products
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

// Get all product snapshots
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

// Run diagnostic tests for the shop module
export const runShopDiagnostics = async (tests: DiagnosticTest[]): Promise<Map<string, DiagnosticStatus>> => {
  const results = new Map<string, DiagnosticStatus>();
  
  console.log("Running shop diagnostics...");
  
  for (const test of tests) {
    try {
      results.set(test.name, 'running');
      await test.runTest();
      results.set(test.name, 'success');
    } catch (error) {
      console.error(`Diagnostic test failed: ${test.name}`, error);
      results.set(test.name, 'error');
    }
  }
  
  return results;
};

// Get RLS policies for a table
export const getRLSPolicies = async (tableName: string): Promise<RLSPolicy[]> => {
  try {
    console.log(`Getting RLS policies for table: ${tableName}`);
    
    const { data, error } = await supabase
      .rpc('get_policies_for_table', { table_name: tableName });
      
    if (error) throw error;
    
    return data as RLSPolicy[];
  } catch (error) {
    console.error("Error fetching RLS policies:", error);
    toast.error("Failed to load RLS policies");
    return [];
  }
};

// Create manual product snapshot
export const createProductSnapshot = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('create_product_snapshot');
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error creating product snapshot:", error);
    toast.error("Failed to create product snapshot");
    return false;
  }
};
