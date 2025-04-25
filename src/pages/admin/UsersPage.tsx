
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

  // Function to refresh the user management component
  const refreshUserData = async () => {
    setIsRefreshing(true);
    try {
      // Instead of calling a non-existent RPC function, we'll just trigger a refresh
      // of the UserManagement component by updating the lastUpdated timestamp
      
      toast({
        title: "User data refreshed",
        description: "The user list has been refreshed."
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast({
        title: "Error refreshing user data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check user data on initial load
  useEffect(() => {
    refreshUserData();
  }, []);

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
              onClick={refreshUserData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Users
            </Button>
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <UserManagement key={lastUpdated?.getTime()} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
