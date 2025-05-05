
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, AlertCircle } from "lucide-react";
import { validateShopAction } from "@/services/shopAuthService";

// Import our modular components
import MockupGenerator from '@/components/shop/recovery/MockupGenerator';
import SnapshotManager from '@/components/shop/recovery/SnapshotManager';
import SystemStatePanel from '@/components/shop/recovery/SystemStatePanel';
import LogsPanel from '@/components/shop/recovery/LogsPanel';

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
            </TabsTrigger>
            <TabsTrigger value="sync">Synchronization</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          {/* Mock Data Tab */}
          <TabsContent value="mockups">
            <MockupGenerator isLocked={isLocked} />
          </TabsContent>
          
          {/* Snapshots Tab */}
          <TabsContent value="snapshots">
            <SnapshotManager isLocked={isLocked} />
          </TabsContent>
          
          {/* Synchronization Tab */}
          <TabsContent value="sync">
            <SystemStatePanel isLocked={isLocked} />
          </TabsContent>
          
          {/* Logs Tab */}
          <TabsContent value="logs">
            <LogsPanel />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminRecoveryTools;
