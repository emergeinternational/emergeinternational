
import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import UserManagement from "../../components/admin/UserManagement";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const UsersPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to refresh the user registration triggers
  const refreshUserTriggers = async () => {
    setIsRefreshing(true);
    try {
      // Call the Supabase function to refresh the user triggers
      const { error } = await supabase.rpc('refresh_user_triggers');
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "User triggers refreshed",
        description: "The system has been updated to detect new users."
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing user triggers:', error);
      toast({
        title: "Error refreshing triggers",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Users & Permissions</h1>
            <p className="text-sm text-gray-500">
              Manage user accounts and their permission levels
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={refreshUserTriggers}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Sync Users
            </Button>
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <UserManagement />
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
