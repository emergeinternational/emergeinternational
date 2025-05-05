
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

// Check if the current user has access to the admin-only tools
export const hasAdminAccess = (): boolean => {
  const { isAdmin } = getAuthStatus();
  return isAdmin;
};

// Secure validation for any shop-related action
export const validateShopAction = (
  requiredRole: 'admin' | 'editor' | 'any',
  actionName: string
): boolean => {
  const { isAdmin, isEditor, isAuthenticated } = getAuthStatus();
  
  // Base authentication check
  if (!isAuthenticated) {
    console.warn(`Unauthorized access attempt: ${actionName} - Not authenticated`);
    return false;
  }
  
  // Role-based validation
  if (requiredRole === 'admin' && !isAdmin) {
    console.warn(`Unauthorized access attempt: ${actionName} - Admin required`);
    // Silently log unauthorized access attempt to server
    logUnauthorizedAccess(actionName, 'admin_required');
    return false;
  }
  
  if (requiredRole === 'editor' && !(isAdmin || isEditor)) {
    console.warn(`Unauthorized access attempt: ${actionName} - Editor required`);
    // Silently log unauthorized access attempt to server
    logUnauthorizedAccess(actionName, 'editor_required');
    return false;
  }
  
  // Action is authorized
  return true;
};

// Silent logging of unauthorized access attempts
const logUnauthorizedAccess = async (actionName: string, reason: string): Promise<void> => {
  try {
    // Get the current auth session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Log the attempt to the automation_logs table in Supabase
    await supabase.from('automation_logs').insert({
      function_name: 'shop_access_validation',
      results: {
        action: actionName,
        reason: reason,
        user_id: userId || 'unknown',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      }
    });
  } catch (error) {
    // Silent failure - never expose security operations
    console.debug('Security log entry failed silently');
  }
};
