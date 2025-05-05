
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Archive, FileJson, Rewind } from "lucide-react";
import { useProductSnapshots } from "@/hooks/shop/useProductSnapshots";

interface SnapshotManagerProps {
  isLocked?: boolean;
}

/**
 * Component for managing product snapshots
 */
const SnapshotManager: React.FC<SnapshotManagerProps> = ({ isLocked = false }) => {
  const { 
    snapshots, 
    isSnapshotting, 
    isRestoring, 
    selectedSnapshotId,
    handleCreateSnapshot, 
    handleRestoreSnapshot 
  } = useProductSnapshots(isLocked);

  return (
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
  );
};

export default SnapshotManager;
