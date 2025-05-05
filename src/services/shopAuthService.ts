
import { supabase } from "@/integrations/supabase/client";

interface AuthStatus {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  role: string | null;
}

// Get current authentication status and user role
export const getAuthStatus = (): AuthStatus => {
  try {
    // This is a synchronous function that returns the current status
    // It doesn't make API calls directly
    
    // Get stored role from local storage as fallback
    const storedRole = localStorage.getItem('userRole');
    
    return {
      // We check if we have a token stored, which indicates an active session
      isAuthenticated: !!localStorage.getItem('supabase.auth.token'),
      // Check if user has admin role (either from state or storage)
      isAdmin: storedRole === 'admin',
      // Check if user has editor role (admin is also an editor)
      isEditor: storedRole === 'editor' || storedRole === 'admin',
      // Return the actual role
      role: storedRole
    };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return {
      isAuthenticated: false,
      isAdmin: false,
      isEditor: false,
      role: null
    };
  }
};

// Check if the current user has permission to edit shop items
export const hasShopEditAccess = (): boolean => {
  const { isAdmin, isEditor } = getAuthStatus();
  return isAdmin || isEditor;
};
