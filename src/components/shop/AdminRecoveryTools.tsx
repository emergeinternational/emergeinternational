
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Archive, 
  Database, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Package,
  FileJson
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  generateMockProducts, 
  getProductSnapshots,
  ProductSnapshot
} from "@/services/shopSystemService";

interface AdminRecoveryToolsProps {
  isLocked?: boolean;
}

const AdminRecoveryTools: React.FC<AdminRecoveryToolsProps> = ({ isLocked = false }) => {
  const [isMockGenerating, setIsMockGenerating] = useState(false);
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [snapshots, setSnapshots] = useState<ProductSnapshot[]>([]);
  const [systemInfo, setSystemInfo] = useState<{
    lastSeedDate: string | null;
    seedCount: number;
    mockupCount: number;
  }>({
    lastSeedDate: null,
    seedCount: 0,
    mockupCount: 0
  });

  // Load snapshots and system info
  useEffect(() => {
    loadSnapshots();
    loadSystemInfo();
  }, []);

  const loadSnapshots = async () => {
    try {
      const snapshotData = await getProductSnapshots();
      setSnapshots(snapshotData);
    } catch (error) {
      console.error("Error loading snapshots:", error);
      toast.error("Failed to load product snapshots");
    }
  };

  const loadSystemInfo = async () => {
    try {
      // Get system settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('shop_system_settings')
        .select('*')
        .eq('key', 'mockup_data')
        .single();
        
      if (settingsError) throw settingsError;
      
      // Count mockup products (products created by system)
      const { count, error: countError } = await supabase
        .from('shop_products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
        
      if (countError) throw countError;
      
      setSystemInfo({
        lastSeedDate: settingsData?.value?.last_seeded || null,
        seedCount: settingsData?.value?.seed_count || 0,
        mockupCount: count || 0
      });
    } catch (error) {
      console.error("Error loading system info:", error);
    }
  };

  const handleGenerateMockProducts = async (count: number = 5) => {
    if (isLocked) {
      toast.error("System is locked. Cannot generate mock products.");
      return;
    }
    
    try {
      setIsMockGenerating(true);
      const success = await generateMockProducts(count);
      
      if (success) {
        toast.success(`Successfully generated ${count} mock products`);
        loadSystemInfo();
      }
    } catch (error) {
      console.error("Error generating mock products:", error);
      toast.error("Failed to generate mock products");
    } finally {
      setIsMockGenerating(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (isLocked) {
      toast.error("System is locked. Cannot create snapshot.");
      return;
    }
    
    try {
      setIsSnapshotting(true);
      
      // Call the snapshot RPC function
      const { error } = await supabase.rpc('create_product_snapshot');
      
      if (error) throw error;
      
      toast.success("Product snapshot created successfully");
      loadSnapshots();
    } catch (error) {
      console.error("Error creating snapshot:", error);
      toast.error("Failed to create product snapshot");
    } finally {
      setIsSnapshotting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-lg flex items-center">
          <Database className="h-5 w-5 mr-2 text-slate-500" />
          System Recovery Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="mockups">
          <TabsList className="mb-4">
            <TabsTrigger value="mockups">Mock Data</TabsTrigger>
            <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
            <TabsTrigger value="info">System Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mockups">
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-slate-50">
                <h3 className="font-medium mb-2">Generate Mock Products</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add sample products for testing. These will be marked as published and visible to all users.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateMockProducts(5)}
                    disabled={isMockGenerating || isLocked}
                    className="flex items-center"
                  >
                    {isMockGenerating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Package className="h-4 w-4 mr-2" />}
                    Generate 5 Products
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateMockProducts(10)}
                    disabled={isMockGenerating || isLocked}
                  >
                    Generate 10 Products
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Mock Data Info</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">Last Generated:</div>
                  <div className="text-sm font-mono">
                    {systemInfo.lastSeedDate 
                      ? new Date(systemInfo.lastSeedDate).toLocaleString() 
                      : 'Never'}
                  </div>
                  <div className="text-sm">Last Batch Size:</div>
                  <div className="text-sm font-mono">{systemInfo.seedCount}</div>
                  <div className="text-sm">Total Products:</div>
                  <div className="text-sm font-mono">{systemInfo.mockupCount}</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="snapshots">
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-slate-50">
                <h3 className="font-medium mb-2">Create Snapshot</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Manually create a snapshot of all current products for backup purposes.
                </p>
                <Button
                  onClick={handleCreateSnapshot}
                  disabled={isSnapshotting || isLocked}
                  className="flex items-center"
                >
                  {isSnapshotting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
                  Create Snapshot
                </Button>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Recent Snapshots</h3>
                <div className="space-y-2 mt-4">
                  {snapshots.length === 0 && (
                    <div className="text-center text-gray-500 p-4">
                      No snapshots available
                    </div>
                  )}
                  
                  {snapshots.map((snapshot) => (
                    <div key={snapshot.id} className="p-3 border rounded-md flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <FileJson className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm font-medium">Version {snapshot.version}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(snapshot.createdAt).toLocaleString()}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {snapshot.productCount} products
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="info">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-4">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Autosnapshot system active</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Snapshot rotation enabled (max 10)</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Change tracking active</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Recovery fallback ready</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminRecoveryTools;
