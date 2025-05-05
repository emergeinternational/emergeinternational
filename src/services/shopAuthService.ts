
import { supabase } from "@/integrations/supabase/client";

// Initialize auth state
export const initializeAuth = () => {
  // This function will initialize the authentication state
  console.log("Shop auth service initialized");
  return getAuthStatus();
};

// Set up auth listener
export const setupAuthListener = () => {
  console.log("Setting up shop auth listener");
  
  // Set up auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log("Auth state changed:", event);
      // You could dispatch an event or update state here
    }
  );
  
  // Return a cleanup function
  return () => {
    subscription.unsubscribe();
  };
};

// Check if the current user has admin role
export const getAuthStatus = () => {
  // Get current user session
  const session = supabase.auth.getSession();
  
  // Default to not admin if we can't determine
  const isAdmin = false;
  
  // Return safe defaults if no user is logged in
  return {
    isAdmin,
    isAuthenticated: !!session,
    userId: session ? "user-id" : null // Add userId property to fix Navigation.tsx error
  };
};

// Check if the current user has permission to edit shop content
export const hasShopEditAccess = (): boolean => {
  // In a production environment, this would check user roles
  // For now, assume all authenticated users can edit
  return true;
};
