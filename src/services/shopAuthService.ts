
import { supabase } from "@/integrations/supabase/client";

interface AuthStatus {
  isAdmin: boolean;
  isEditor: boolean;
  isAuthenticated: boolean;
  userId: string | null;
}

/**
 * Get current authentication status and permissions
 * for the shop module
 */
export const getAuthStatus = (): AuthStatus => {
  try {
    const session = supabase.auth.session();
    const userId = session?.user?.id || null;
    
    // TODO: This is a simplified check, in production we would
    // use claims or query a roles table to determine admin/editor status
    const isAdmin = !!userId && localStorage.getItem('user_role') === 'admin';
    const isEditor = !!userId && 
      (localStorage.getItem('user_role') === 'editor' || localStorage.getItem('user_role') === 'admin');
    
    return {
      isAdmin,
      isEditor,
      isAuthenticated: !!userId,
      userId
    };
  } catch (error) {
    console.error("Error getting auth status:", error);
    
    // Return safe defaults on error
    return {
      isAdmin: false,
      isEditor: false,
      isAuthenticated: false,
      userId: null
    };
  }
};

/**
 * Check if the current user has editor or admin access
 * to edit shop products
 */
export const hasShopEditAccess = (): boolean => {
  try {
    const { isEditor, isAdmin } = getAuthStatus();
    return isEditor || isAdmin;
  } catch (error) {
    console.error("Error checking shop edit access:", error);
    return false;
  }
};

/**
 * Check if the current user has admin access to
 * manage system settings and diagnostics
 */
export const hasShopAdminAccess = (): boolean => {
  try {
    const { isAdmin } = getAuthStatus();
    return isAdmin;
  } catch (error) {
    console.error("Error checking shop admin access:", error);
    return false;
  }
};

/**
 * Validate if user has permission to perform a specific shop action
 * 
 * @param requiredRole Minimum role required ('admin' or 'editor')
 * @param action The action being attempted
 * @returns boolean indicating if user can perform the action
 */
export const validateShopAction = (requiredRole: 'admin' | 'editor', action: string): boolean => {
  try {
    const { isAdmin, isEditor } = getAuthStatus();
    
    // Admin can do anything
    if (isAdmin) return true;
    
    // Editor can only do editor-level actions
    if (requiredRole === 'editor' && isEditor) return true;
    
    // If we got here, user doesn't have permission
    // Log the unauthorized access attempt silently
    logUnauthorizedAccess(action, { requiredRole });
    return false;
  } catch (error) {
    console.error(`Error validating shop action '${action}':`, error);
    return false;
  }
};

/**
 * Check if the user has access to view shop diagnostics
 */
export const hasShopDiagnosticsAccess = (): boolean => {
  try {
    return hasShopAdminAccess();
  } catch (error) {
    console.error("Error checking shop diagnostics access:", error);
    return false;
  }
};

/**
 * Log unauthorized access attempts silently
 */
export const logUnauthorizedAccess = (action: string, details: any = {}): void => {
  try {
    const { userId } = getAuthStatus();
    
    console.warn(`Unauthorized access attempt: ${action}`, {
      userId,
      timestamp: new Date().toISOString(),
      ...details
    });
    
    // In production, we would send this to a logging service or store in the database
  } catch (error) {
    console.error("Error logging unauthorized access:", error);
  }
};
