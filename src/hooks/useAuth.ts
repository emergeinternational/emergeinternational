
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { getAuthStatus } from '@/services/shopAuthService';

type AuthContextType = {
  user: User | null;
  userRole: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string | string[]) => boolean;
  signIn?: (email: string, password: string) => Promise<void>;
  signUp?: (email: string, password: string) => Promise<void>;
  signOut?: () => Promise<void>;
  resetPassword?: (password: string) => Promise<void>;
  session?: any;
};

// Create a default context with safe fallback values
const defaultAuthContext: AuthContextType = {
  user: null,
  userRole: null,
  isAuthenticated: false,
  isLoading: false,
  hasRole: () => false
};

// Create the context
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Return the context if it exists, or return the safe default context
  // This ensures the hook never returns undefined and breaks the UI
  return context || defaultAuthContext;
};

