
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface AdminUsersFetcherProps {
  onUsersLoaded: (users: AdminUser[]) => void;
  onError?: (error: Error) => void;
  onLoading?: (isLoading: boolean) => void;
}

export const AdminUsersFetcher: React.FC<AdminUsersFetcherProps> = ({ 
  onUsersLoaded,
  onError,
  onLoading
}) => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        setLoading(true);
        if (onLoading) onLoading(true);

        // Using the new secure function instead of direct view access
        const { data, error } = await supabase.rpc('get_admin_users');

        if (error) {
          throw new Error(`Failed to fetch admin users: ${error.message}`);
        }

        if (data) {
          onUsersLoaded(data as AdminUser[]);
        } else {
          onUsersLoaded([]);
        }
      } catch (error) {
        console.error('Error fetching admin users:', error);
        toast({
          title: "Error loading admin users",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
        if (onError && error instanceof Error) {
          onError(error);
        }
      } finally {
        setLoading(false);
        if (onLoading) onLoading(false);
      }
    };

    fetchAdminUsers();
  }, [onUsersLoaded, onError, onLoading, toast]);

  // This component doesn't render anything directly
  return null;
};

export const useAdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using the new secure function
      const { data, error: rpcError } = await supabase.rpc('get_admin_users');

      if (rpcError) {
        throw new Error(`Failed to fetch admin users: ${rpcError.message}`);
      }

      setAdminUsers(data as AdminUser[] || []);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast({
        title: "Error loading admin users",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  return { adminUsers, loading, error, refreshAdminUsers: fetchAdminUsers };
};

// Diagnostic component to check admin view access
export const AdminViewAccessCheck: React.FC = () => {
  const [accessInfo, setAccessInfo] = useState<{
    access_level: string;
    has_admin_role: boolean;
    user_count: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        const { data, error: rpcError } = await supabase.rpc('check_admin_view_access');
        
        if (rpcError) {
          throw new Error(rpcError.message);
        }

        setAccessInfo(data as any);
      } catch (err) {
        console.error('Error checking admin view access:', err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Checking admin view access...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-md">
      <h3 className="text-sm font-medium mb-2">Admin View Access Diagnostic</h3>
      <div className="text-xs space-y-1">
        <p>Access Level: <span className={accessInfo?.access_level === 'admin' ? 'text-green-600 font-bold' : 'text-red-600'}>
          {accessInfo?.access_level}
        </span></p>
        <p>Has Admin Role: {accessInfo?.has_admin_role ? '✅' : '❌'}</p>
        <p>Admin User Count: {accessInfo?.user_count}</p>
      </div>
    </div>
  );
};
