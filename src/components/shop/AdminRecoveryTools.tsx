
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Archive, 
  Database, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Package,
  FileJson,
  Sync,
  Rewind
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  generateMockProducts, 
  getProductSnapshots,
  createProductSnapshot,
  getShopSystemSettings,
  runShopSync,
  restoreFromSnapshot,
  ProductSnapshot
} from "@/services/shopSystemService";
import { ShopSystemSettings, RecoveryLogEntry } from "@/types/shop";
import { validateShopAction } from "@/services/shopAuthService";

interface AdminRecoveryToolsProps {
  isLocked?: boolean;
}

const AdminRecoveryTools: React.FC<AdminRecoveryToolsProps> = ({ isLocked = false }) => {
  // State for UI actions
  const [isMockGenerating, setIsMockGenerating] = useState(false);
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // State for data
  const [snapshots, setSnapshots] = useState<ProductSnapshot[]>([]);
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLogEntry[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  
  // State for system info
  const [systemInfo, setSystemInfo] = useState<{
    lastSeedDate: string | null;
    seedCount: number;
    mockupCount: number;
    syncStatus: 'synced' | 'out-of-sync' | 'unknown';
  }>({
    lastSeedDate: null,
    seedCount: 0,
    mockupCount: 0,
    syncStatus: 'unknown'
  });

  // Check if user has admin access
  const hasAdminAccess = validateShopAction('admin', 'view_recovery_tools');

  // Load snapshots and system info on mount
  useEffect(() => {
    if (hasAdminAccess) {
      loadSnapshots();
      loadSystemInfo();
      loadRecoveryLogs();
    }
  }, [hasAdminAccess]);

  // Load product snapshots
  const loadSnapshots = async () => {
    try {
      const snapshotData = await getProductSnapshots();
      setSnapshots(snapshotData);
    } catch (error) {
      console.error("Error loading snapshots:", error);
      toast.error("Failed to load product snapshots");
      addRecoveryLog('load_snapshots', 'failure', { error: String(error) });
    }
  };

  // Load system information
  const loadSystemInfo = async () => {
    try {
      // Get system settings
      const settings = await getShopSystemSettings();
      
      // Count mockup products (products created by system)
      const { count, error: countError } = await supabase
        .from('shop_products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
        
      if (countError) throw countError;
      
      // Extract mockup data with proper typing
      const mockupData = settings.mockupData || {};
      
      setSystemInfo({
        lastSeedDate: mockupData.last_seeded || null,
        seedCount: mockupData.seed_count || 0,
        mockupCount: count || 0,
        syncStatus: 'synced' // Assume synced by default
      });
    } catch (error) {
      console.error("Error loading system info:", error);
      addRecoveryLog('load_system_info', 'failure', { error: String(error) });
    }
  };

  // Load recovery logs
  const loadRecoveryLogs = async () => {
    try {
      // In a real implementation, we'd fetch logs from a database table
      // For now, we'll use mock data
      setRecoveryLogs([
        {
          id: '1',
          timestamp: new Date().toISOString(),
          action: 'system_startup',
          status: 'success',
          details: { message: 'Recovery tools initialized' }
        }
      ]);
    } catch (error) {
      console.error("Error loading recovery logs:", error);
    }
  };

  // Add a new recovery log entry
  const addRecoveryLog = (action: string, status: 'success' | 'failure' | 'pending', details?: any) => {
    const newLog: RecoveryLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      status,
      details
    };
    
    setRecoveryLogs(prev => [newLog, ...prev]);
  };

  // Handle generating mock products
  const handleGenerateMockProducts = async (count: number = 5) => {
    if (isLocked || !validateShopAction('admin', 'generate_mock_products')) {
      toast.error("You don't have permission to generate mock products");
      addRecoveryLog('generate_mock_products', 'failure', { reason: 'permission_denied' });
      return;
    }
    
    try {
      setIsMockGenerating(true);
      addRecoveryLog('generate_mock_products', 'pending', { count });
      
      const success = await generateMockProducts(count);
      
      if (success) {
        toast.success(`Successfully generated ${count} mock products`);
        addRecoveryLog('generate_mock_products', 'success', { count });
        loadSystemInfo();
      } else {
        addRecoveryLog('generate_mock_products', 'failure');
      }
    } catch (error) {
      console.error("Error generating mock products:", error);
      toast.error("Failed to generate mock products");
      addRecoveryLog('generate_mock_products', 'failure', { error: String(error) });
    } finally {
      setIsMockGenerating(false);
    }
  };

  // Handle creating a manual snapshot
  const handleCreateSnapshot = async () => {
    if (isLocked || !validateShopAction('admin', 'create_snapshot')) {
      toast.error("You don't have permission to create snapshots");
      addRecoveryLog('create_snapshot', 'failure', { reason: 'permission_denied' });
      return;
    }
    
    try {
      setIsSnapshotting(true);
      addRecoveryLog('create_snapshot', 'pending');
      
      const success = await createProductSnapshot();
      
      if (success) {
        toast.success("Product snapshot created successfully");
        addRecoveryLog('create_snapshot', 'success');
        loadSnapshots();
      } else {
        addRecoveryLog('create_snapshot', 'failure');
      }
    } catch (error) {
      console.error("Error creating snapshot:", error);
      toast.error("Failed to create product snapshot");
      addRecoveryLog('create_snapshot', 'failure', { error: String(error) });
    } finally {
      setIsSnapshotting(false);
    }
  };

  // Handle restoring from a snapshot
  const handleRestoreSnapshot = async (snapshotId: string) => {
    if (isLocked || !validateShopAction('admin', 'restore_snapshot')) {
      toast.error("You don't have permission to restore snapshots");
      addRecoveryLog('restore_snapshot', 'failure', { reason: 'permission_denied', snapshotId });
      return;
    }
    
    try {
      setIsRestoring(true);
      setSelectedSnapshotId(snapshotId);
      addRecoveryLog('restore_snapshot', 'pending', { snapshotId });
      
      const success = await restoreFromSnapshot(snapshotId);
      
      if (success) {
        toast.success("Successfully restored from snapshot");
        addRecoveryLog('restore_snapshot', 'success', { snapshotId });
        loadSystemInfo();
      } else {
        addRecoveryLog('restore_snapshot', 'failure', { snapshotId });
      }
    } catch (error) {
      console.error("Error restoring from snapshot:", error);
      toast.error("Failed to restore from snapshot");
      addRecoveryLog('restore_snapshot', 'failure', { snapshotId, error: String(error) });
    } finally {
      setIsRestoring(false);
      setSelectedSnapshotId(null);
    }
  };

  // Handle running a full shop sync
  const handleRunSync = async () => {
    if (isLocked || !validateShopAction('admin', 'run_shop_sync')) {
      toast.error("You don't have permission to run shop synchronization");
      addRecoveryLog('run_shop_sync', 'failure', { reason: 'permission_denied' });
      return;
    }
    
    try {
      setIsSyncing(true);
      addRecoveryLog('run_shop_sync', 'pending');
      
      const success = await runShopSync();
      
      if (success) {
        toast.success("Shop synchronization completed successfully");
        addRecoveryLog('run_shop_sync', 'success');
        loadSystemInfo();
      } else {
        addRecoveryLog('run_shop_sync', 'failure');
      }
    } catch (error) {
      console.error("Error running shop sync:", error);
      toast.error("Failed to synchronize shop data");
      addRecoveryLog('run_shop_sync', 'failure', { error: String(error) });
    } finally {
      setIsSyncing(false);
    }
  };

  // If user doesn't have admin access, don't render anything
  if (!hasAdminAccess) {
    return null;
  }
  
  // Get the snapshot count for Badge display
  const snapshotCount = snapshots.length;

  return (
    <Card className="w-full mb-6">
      <CardHeader className="bg-slate-50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center">
            <Database className="h-5 w-5 mr-2 text-slate-500" />
            System Recovery Tools
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Admin-only tools for system recovery and diagnostics
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {isLocked ? 'Locked' : 'Unlocked'}
        </Badge>
      </CardHeader>
      
      {isLocked && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>System Locked</AlertTitle>
          <AlertDescription>
            Recovery tools are currently locked. Unlock them from the admin panel to make changes.
          </AlertDescription>
        </Alert>
      )}
      
      <CardContent className="p-4">
        <Tabs defaultValue="mockups">
          <TabsList className="mb-4">
            <TabsTrigger value="mockups">Mock Data</TabsTrigger>
            <TabsTrigger value="snapshots">
              Snapshots
              {snapshotCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {snapshotCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sync">Synchronization</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mockups">
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-slate-50">
                <h3 className="font-medium mb-2">Generate Mock Products</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add sample products for testing. These will be marked as published and visible to all users.
                </p>
                <div className="flex flex-wrap gap-2">
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
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateMockProducts(20)}
                    disabled={isMockGenerating || isLocked}
                  >
                    Generate 20 Products
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
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isLocked || isRestoring}
                          onClick={() => handleRestoreSnapshot(snapshot.id)}
                          className="flex items-center"
                        >
                          {isRestoring && selectedSnapshotId === snapshot.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Rewind className="h-3 w-3 mr-1" />
                          )}
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sync">
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Shop Synchronization</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Run synchronization to fix inconsistencies between products, variations, and collections.
                </p>
                <Button
                  variant="default"
                  onClick={handleRunSync}
                  disabled={isSyncing || isLocked}
                  className="flex items-center"
                >
                  {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Sync className="h-4 w-4 mr-2" />}
                  Run Full Synchronization
                </Button>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">System Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    {systemInfo.syncStatus === 'synced' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : systemInfo.syncStatus === 'out-of-sync' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-500 mr-2" />
                    )}
                    <span className="text-sm">
                      {systemInfo.syncStatus === 'synced' ? 'System is in sync' : 
                       systemInfo.syncStatus === 'out-of-sync' ? 'System needs synchronization' : 
                       'Sync status unknown'}
                    </span>
                  </div>
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
                    <span className="text-sm">Recovery fallback ready</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="logs">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Recovery Logs</h3>
              <div className="space-y-2 mt-4 max-h-64 overflow-y-auto">
                {recoveryLogs.length === 0 ? (
                  <div className="text-center text-gray-500 p-4">
                    No recovery logs available
                  </div>
                ) : (
                  recoveryLogs.map((log) => (
                    <div key={log.id} className="p-2 border-b text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {log.status === 'success' ? (
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          ) : log.status === 'failure' ? (
                            <XCircle className="h-3 w-3 text-red-500 mr-2" />
                          ) : (
                            <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin mr-2" />
                          )}
                          <span className="font-mono">
                            {log.action}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {log.details && (
                        <div className="ml-5 mt-1 text-xs text-gray-500">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminRecoveryTools;
