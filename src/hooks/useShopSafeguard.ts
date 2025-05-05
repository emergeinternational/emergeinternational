
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * SafeGuard hook that monitors Shop module dependencies and reports issues
 * without breaking the UI rendering
 */
export const useShopSafeguard = () => {
  const auth = useAuth();
  
  useEffect(() => {
    try {
      // Check if auth provider is properly initialized
      if (!auth) {
        console.warn("Shop module safeguard: Missing AuthProvider");
      }
      
      // Check if basic auth properties are available
      if (auth && typeof auth.isAuthenticated === 'undefined') {
        console.warn("Shop module safeguard: Auth provider is missing isAuthenticated property");
      }
      
      if (auth && !auth.user && auth.isAuthenticated) {
        console.warn("Shop module safeguard: Auth state inconsistent - authenticated but no user");
      }
    } catch (error) {
      // Never let this hook break the UI
      console.error("Shop module safeguard: Error checking dependencies", error);
    }
  }, [auth]);
};
