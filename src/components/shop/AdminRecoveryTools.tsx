
import React, { useState } from 'react';
import {
  RefreshCw,
  Database,
  Download,
  Server,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { validateShopAction } from '@/services/shopAuthService';
import {
  generateMockProducts,
  toggleRecoveryMode,
  getProductSnapshots,
  createProductSnapshot,
  getShopSystemSettings
} from '@/services/shopSystemService';

const AdminRecoveryTools: React.FC = () => {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isSnapshotDialogOpen, setIsSnapshotDialogOpen] = useState(false);
  const [productCount, setProductCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  
  // Check if user has admin access
  const canAccessRecoveryTools = validateShopAction('admin', 'view_recovery_tools');
  
  if (!canAccessRecoveryTools) {
    return null;
  }
  
  const handleGenerateMockProducts = async () => {
    setLoading(true);
    try {
      await generateMockProducts(productCount);
      setIsGenerateDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };
  
  const loadSnapshots = async () => {
    setLoading(true);
    try {
      const data = await getProductSnapshots();
      const settings = await getShopSystemSettings();
      setSnapshots(data);
      setSystemSettings(settings);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewSnapshots = async () => {
    await loadSnapshots();
    setIsSnapshotDialogOpen(true);
  };
  
  const handleCreateSnapshot = async () => {
    setLoading(true);
    try {
      await createProductSnapshot();
      await loadSnapshots();
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleRecoveryMode = async (enabled: boolean) => {
    setLoading(true);
    try {
      await toggleRecoveryMode(enabled);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Shop Recovery Tools</CardTitle>
          <CardDescription>Recover from data loss or rendering issues</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={() => setIsGenerateDialogOpen(true)}
            >
              <Database className="h-4 w-4" />
              Generate Mock Products
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={handleViewSnapshots}
            >
              <Download className="h-4 w-4" />
              Product Snapshots
            </Button>
            
            <Button
              variant={systemSettings?.recoveryMode ? "destructive" : "outline"}
              className="flex items-center justify-center gap-2"
              onClick={() => handleToggleRecoveryMode(!systemSettings?.recoveryMode)}
            >
              <AlertTriangle className="h-4 w-4" />
              {systemSettings?.recoveryMode ? "Disable Recovery Mode" : "Enable Recovery Mode"}
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={handleCreateSnapshot}
            >
              <Server className="h-4 w-4" />
              Create Manual Snapshot
            </Button>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <p className="text-xs text-gray-500">
            These tools are only available to admin users
          </p>
        </CardFooter>
      </Card>
      
      {/* Generate Mock Products Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Mock Products</DialogTitle>
            <DialogDescription>
              Create sample products to populate the shop
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <label htmlFor="product-count" className="text-sm">
                  Number of products
                </label>
                <Input
                  type="number"
                  id="product-count"
                  value={productCount}
                  onChange={(e) => setProductCount(Number(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsGenerateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateMockProducts}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Products'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Product Snapshots Dialog */}
      <Dialog open={isSnapshotDialogOpen} onOpenChange={setIsSnapshotDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Product Snapshots</DialogTitle>
            <DialogDescription>
              View and manage product backup snapshots
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : snapshots.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {snapshots.map(snapshot => (
                  <Card key={snapshot.id} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium">Version {snapshot.version}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(snapshot.createdAt).toLocaleString()}
                        </p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs">
                            {snapshot.productCount} products
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-8 w-8 mb-2 mx-auto text-gray-300" />
                <p>No snapshots available</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSnapshotDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={handleCreateSnapshot}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Snapshot'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRecoveryTools;
