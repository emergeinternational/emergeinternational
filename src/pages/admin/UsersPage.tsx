
import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import UserManagement from "../../components/admin/UserManagement";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const UsersPage = () => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [systemStatus, setSystemStatus] = useState<{
    usersCount: number | null;
    adminEmail: string | null;
    lastRefresh: string;
    status: 'ready' | 'loading' | 'error';
    error?: string;
  }>({
    usersCount: null,
    adminEmail: null,
    lastRefresh: new Date().toISOString(),
    status: 'loading'
  });
  const { toast } = useToast();

  // Function to fetch system status information
  const fetchSystemStatus = async () => {
    try {
      setSystemStatus(prev => ({ ...prev, status: 'loading' }));
      
      // Fetch admin account and count of all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('role', 'admin');
        
      if (profilesError) {
        throw new Error(`Error fetching admin profile: ${profilesError.message}`);
      }
      
      // Get count of all profiles
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        throw new Error(`Error counting profiles: ${countError.message}`);
      }
      
      // Update status with the fetched information
      setSystemStatus({
        usersCount: count,
        adminEmail: profilesData[0]?.email || 'reddshawn@yahoo.com',
        lastRefresh: new Date().toISOString(),
        status: 'ready'
      });
      
    } catch (error) {
      console.error("Error fetching system status:", error);
      setSystemStatus(prev => ({ 
        ...prev, 
        status: 'error',
        error: error instanceof Error ? error.message : "Unknown error fetching system status"
      }));
      
      toast({
        title: "Error checking system status",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Function to refresh the user management component and system status
  const handleRefreshUserData = () => {
    setLastUpdated(new Date());
    fetchSystemStatus();
    
    toast({
      title: "User data refreshed",
      description: "The user list and system status have been refreshed."
    });
  };
  
  // Initial fetch of system status
  useEffect(() => {
    fetchSystemStatus();
    
    // Set up real-time listener for profile changes
    const channel = supabase
      .channel('user_system_monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change detected in monitoring channel:', payload);
          // Auto-refresh system status when profiles change
          fetchSystemStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
              onClick={handleRefreshUserData}
              className="flex items-center gap-2"
              disabled={systemStatus.status === 'loading'}
            >
              <RefreshCw className={`h-4 w-4 ${systemStatus.status === 'loading' ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
        
        {systemStatus.status === 'ready' && (
          <div className="bg-white p-4 mb-6 rounded shadow border-l-4 border-emerge-gold">
            <h2 className="text-sm font-medium">System Status</h2>
            <div className="mt-2 text-sm grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500">Admin Account</p>
                <p className="font-medium">{systemStatus.adminEmail || 'reddshawn@yahoo.com'}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Users</p>
                <p className="font-medium">{systemStatus.usersCount !== null ? systemStatus.usersCount : 'Loading...'}</p>
              </div>
              <div>
                <p className="text-gray-500">Last System Check</p>
                <p className="font-medium">{new Date(systemStatus.lastRefresh).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}
        
        {systemStatus.status === 'error' && (
          <div className="bg-red-50 p-4 mb-6 rounded shadow border-l-4 border-red-500">
            <h2 className="text-sm font-medium text-red-800">System Error Detected</h2>
            <p className="text-sm text-red-700 mt-1">{systemStatus.error}</p>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleRefreshUserData} 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
        
        <div className="bg-white p-6 rounded shadow">
          <UserManagement key={lastUpdated?.getTime()} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
