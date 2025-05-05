
import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, RefreshCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShopSync } from "@/hooks/shop/useShopSync";

interface SystemStatePanelProps {
  isLocked?: boolean;
}

/**
 * Component for displaying and managing system state
 */
const SystemStatePanel: React.FC<SystemStatePanelProps> = ({ isLocked = false }) => {
  const { 
    syncStatus, 
    systemInfo, 
    isSyncing,
    handleRunSync
  } = useShopSync(isLocked);

  return (
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
  );
};

export default SystemStatePanel;
