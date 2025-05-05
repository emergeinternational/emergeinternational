
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthStatus {
  isAdmin: boolean;
  isEditor: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  role: string | null;
}

// Initialize auth state
export const initializeAuth = async (): Promise<AuthStatus> => {
  // This function will initialize the authentication state
  console.log("Shop auth service initialized");
  return getAuthStatus();
};

// Set up auth listener
export const setupAuthListener = () => {
  console.log("Setting up shop auth listener");
  
  // Set up auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Update role information on sign in or token refresh
        await getUserRole();
      }
    }
  );
  
  // Return a cleanup function
  return () => {
    subscription.unsubscribe();
  };
};

// Get user role from the database
export const getUserRole = async (): Promise<string | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session || !session.session || !session.session.user) {
      return null;
    }
    
    const userId = session.session.user.id;
    
    // Query user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
    
    return data?.role || null;
  } catch (err) {
    console.error("Error in getUserRole:", err);
    return null;
  }
};

// Check auth status with role information
export const getAuthStatus = (): AuthStatus => {
  try {
    // Default to not authenticated until we check
    let isAuthenticated = false;
    let userId = null;
    let role = null;
    let isAdmin = false;
    let isEditor = false;
    
    // Create a dummy status for initial state
    // This will be updated asynchronously later
    const status: AuthStatus = {
      isAdmin: false,
      isEditor: false,
      isAuthenticated: false,
      userId: null,
      role: null
    };
    
    // Start async check but don't wait for it
    (async () => {
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      
      // Update authentication status
      isAuthenticated = !!session;
      userId = session?.user?.id || null;
      
      // If not authenticated, return with defaults
      if (!isAuthenticated) {
        return;
      }
      
      // Fetch user role
      role = await getUserRole();
      isAdmin = role === 'admin';
      isEditor = role === 'editor' || role === 'admin'; // Admins also have editor capabilities
      
      // Update the status object
      Object.assign(status, {
        isAdmin,
        isEditor,
        isAuthenticated,
        userId,
        role
      });
      
    })().catch(err => {
      console.error("Error in auth status check:", err);
      toast.error("Failed to verify permissions");
    });
    
    // Return immediately with initial values
    return status;
  } catch (err) {
    console.error("Error checking auth status:", err);
    toast.error("Failed to verify permissions");
    
    // Return safe defaults
    return {
      isAdmin: false,
      isEditor: false,
      isAuthenticated: false,
      userId: null,
      role: null
    };
  }
};

// Check if the current user has permission to edit shop content
export const hasShopEditAccess = (): boolean => {
  try {
    const authStatus = getAuthStatus();
    return authStatus.isEditor || authStatus.isAdmin;
  } catch (err) {
    console.error("Error checking shop edit access:", err);
    return false;
  }
};
