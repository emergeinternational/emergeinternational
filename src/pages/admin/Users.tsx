
import React, { useState, useEffect } from 'react';
import AdminLayout from "@/layouts/AdminLayout";
import UserManagement from '@/components/admin/UserManagement';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PageLock from '@/components/admin/PageLock';

const Users = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasUsers, setHasUsers] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const { toast } = useToast();

  // Check if there are any users in the database
  useEffect(() => {
    const checkUsers = async () => {
      try {
        setIsLoading(true);
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        
        // If count is 0 or null, there are no users
        setHasUsers(count !== null && count > 0);
      } catch (error) {
        console.error("Error checking users:", error);
        toast({
          title: "Error checking users",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUsers();
  }, []);
  
  const handleLockStatusChange = (status: boolean) => {
    setIsLocked(status);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Users Management</h1>
          <div className="flex items-center gap-2">
            <PageLock 
              pageId="usersPage"
              onLockStatusChange={handleLockStatusChange}
              initialLockState={isLocked}
            />
          </div>
        </div>
        
        {!hasUsers && !isLoading && (
          <Alert variant="destructive" className="mb-6"> {/* Changed from "warning" to "destructive" */}
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No Users Found</AlertTitle>
            <AlertDescription>
              No users were found in the database. Please add users to manage them.
            </AlertDescription>
          </Alert>
        )}
        
        <UserManagement isLocked={isLocked} />
      </div>
    </AdminLayout>
  );
};

export default Users;
