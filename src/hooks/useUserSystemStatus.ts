
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemStatus {
  usersCount: number | null;
  adminEmail: string | null;
  lastRefresh: string;
  status: 'ready' | 'loading' | 'error';
  error?: string;
}

export const useUserSystemStatus = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    usersCount: null,
    adminEmail: null,
    lastRefresh: new Date().toISOString(),
    status: 'loading'
  });

  const fetchSystemStatus = useCallback(async () => {
    try {
      setSystemStatus(prev => ({ ...prev, status: 'loading' }));
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('role', 'admin');
        
      if (profilesError) throw profilesError;
      
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
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
      
      toast.error('Failed to fetch system status');
    }
  }, []);

  return {
    systemStatus,
    fetchSystemStatus
  };
};
