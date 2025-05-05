
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
  RefreshCcw,
  Rewind
} from "lucide-react";
import { toast } from "sonner";
import { validateShopAction } from "@/services/shopAuthService";
import { useShopDiagnostics } from "@/hooks/shop/useShopDiagnostics";
import { useMockProducts } from "@/hooks/shop/useMockProducts";
import { useProductSnapshots } from "@/hooks/shop/useProductSnapshots";
import { useShopSync } from "@/hooks/shop/useShopSync";

interface AdminRecoveryToolsProps {
  isLocked?: boolean;
}

/**
 * AdminRecoveryTools component serves as a wrapper and layout manager
 * for the shop module's recovery and diagnostic tools.
 */
const AdminRecoveryTools: React.FC<AdminRecoveryToolsProps> = ({ isLocked = false }) => {
  // Check if user has admin access
  const hasAdminAccess = validateShopAction('admin', 'view_recovery_tools');
  
  // If user doesn't have admin access, don't render anything
  if (!hasAdminAccess) {
    return null;
  }

  // Get hooks for different feature areas
  const { systemInfo, syncStatus, handleRunSync, isSyncing } = useShopSync();
  const { 
    snapshots, 
    isSnapshotting, 
    isRestoring, 
    selectedSnapshotId,
    handleCreateSnapshot, 
    handleRestoreSnapshot 
  } = useProductSnapshots(isLocked);
  const { 
    handleGenerateMockProducts, 
    isMockGenerating 
  } = useMockProducts(isLocked);
  const { recoveryLogs } = useShopDiagnostics();

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
          
          {/* Mock Data Tab */}
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
          
          {/* Snapshots Tab */}
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
          
          {/* Synchronization Tab */}
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
                  {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                  Run Full Synchronization
                </Button>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">System Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    {syncStatus === 'synced' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : syncStatus === 'out-of-sync' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-500 mr-2" />
                    )}
                    <span className="text-sm">
                      {syncStatus === 'synced' ? 'System is in sync' : 
                       syncStatus === 'out-of-sync' ? 'System needs synchronization' : 
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
          
          {/* Logs Tab */}
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
