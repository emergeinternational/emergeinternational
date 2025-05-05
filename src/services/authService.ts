import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from "sonner";

export type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

export interface AuthStatus {
  user: User | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
}

// Singleton pattern to store auth state across the application
let _authStatus: AuthStatus = {
  user: null,
  userRole: null,
  isAuthenticated: false,
  isAdmin: false,
  isEditor: false
};

// Private function to update the singleton
const _setAuthStatus = (user: User | null, userRole: UserRole | null) => {
  _authStatus = {
    user,
    userRole,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin',
    isEditor: userRole === 'editor' || userRole === 'admin'
  };
};

// Initialize auth state - called once at app startup
export const initializeAuth = async (): Promise<void> => {
  try {
    console.log("Initial auth session check...");
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      console.log("User is already authenticated", session.user.email);
      const userRole = await fetchUserRole(session.user.id);
      _setAuthStatus(session.user, userRole);
    } else {
      console.log("No authenticated user found during initialization");
      _setAuthStatus(null, null);
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    _setAuthStatus(null, null);
  }
};

// Set up auth state listener
export const setupAuthListener = (): (() => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("Auth state change event:", event);
      
      if (session?.user) {
        console.log("User authenticated:", session.user.email);
        // Use setTimeout to prevent potential deadlock with Supabase client
        setTimeout(async () => {
          const userRole = await fetchUserRole(session.user.id);
          _setAuthStatus(session.user, userRole);
        }, 0);
      } else {
        console.log("No authenticated user");
        _setAuthStatus(null, null);
      }
    }
  );

  return () => subscription.unsubscribe();
};

// Public function to get auth status from anywhere in the app
export const getAuthStatus = (): AuthStatus => {
  return { ..._authStatus }; // Return a copy to prevent mutation
};

// Helper function to fetch user role
const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    // First try fetching from user_roles table
    const { data: userRoleData, error: userRoleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!userRoleError && userRoleData) {
      console.log('Role found in user_roles table:', userRoleData.role);
      return userRoleData.role as UserRole;
    }
    
    // Fallback to profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (!error && data) {
      console.log('Role found in profiles table:', data.role);
      return (data?.role as UserRole) ?? 'user';
    }
    
    console.log("No role found, setting default to 'user'");
    return 'user';
  } catch (error) {
    console.error('Error in fetchUserRole:', error);
    return 'user';
  }
};

// Authentication methods
export const signIn = async (email: string, password: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

export const signUp = async (email: string, password: string): Promise<void> => {
  try {
    const currentOrigin = window.location.origin;
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${currentOrigin}/profile`
      } 
    });
    if (error) throw error;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const resetPassword = async (password: string): Promise<void> => {
  try {
    console.log("Updating password");
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      console.error("Password update error:", error);
      throw error;
    }

    console.log("Password updated successfully");
    toast.success("Password updated", {
      description: "Your password has been updated successfully."
    });
  } catch (error) {
    console.error("Password reset exception:", error);
    throw error;
  }
};

// Custom hook for components that need reactive auth state
export const useAuthStatus = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(getAuthStatus());

  useEffect(() => {
    // Initial state
    setAuthStatus(getAuthStatus());
    
    // Set up a polling interval to check for auth status changes
    const interval = setInterval(() => {
      const currentStatus = getAuthStatus();
      setAuthStatus(prev => {
        // Only update if something changed to prevent unnecessary renders
        if (
          prev.user?.id !== currentStatus.user?.id ||
          prev.userRole !== currentStatus.userRole ||
          prev.isAuthenticated !== currentStatus.isAuthenticated
        ) {
          return { ...currentStatus };
        }
        return prev;
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  return authStatus;
};
