
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { getAuthStatus } from '@/services/shopAuthService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        
        // Get user role from service
        if (currentUser) {
          // Use the existing shop auth service to get role
          const authStatus = getAuthStatus();
          setUserRole(authStatus.role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        
        if (currentUser) {
          const authStatus = getAuthStatus();
          setUserRole(authStatus.role);
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { user, userRole, isAuthenticated, isLoading };
};
