
import { useState, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  isLoading: boolean;
  userRole: UserRole | null;
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserRole = async (userId: string) => {
    try {
      // Fetch the user's role from the user_roles table (new approach)
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to not throw an error if no role is found
      
      if (userRoleError) {
        console.error('Error fetching user role from user_roles table:', userRoleError);
        // Fall back to profiles table if user_roles query fails
        fallbackToProfilesTable(userId);
        return;
      }
      
      if (userRoleData) {
        // User has a role in the new user_roles table
        console.log('Role found in user_roles table:', userRoleData.role);
        setUserRole(userRoleData.role as UserRole);
        return;
      }
      
      // If we get here, the user doesn't have a role in the user_roles table yet
      // Fall back to the profiles table
      fallbackToProfilesTable(userId);
      
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('user' as UserRole);
    }
  };
  
  const fallbackToProfilesTable = async (userId: string) => {
    try {
      // Try to fetch from profiles table as fallback
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user role from profiles table:', error);
        setUserRole('user' as UserRole);
        return;
      }
      
      // Set role from profiles table
      console.log('Role found in profiles table:', data.role);
      setUserRole((data?.role as UserRole) ?? 'user' as UserRole);
    } catch (error) {
      console.error('Error in fallbackToProfilesTable:', error);
      setUserRole('user' as UserRole);
    }
  };

  // Function to check if user has the required role(s)
  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user || !userRole) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }

    return userRole === requiredRole;
  };

  // Use React Router context for navigation functions
  // We need to solve the useState hook error (this must be inside a component)
  // All auth-related hooks are initialized in useAuth.ts and the component is wrapped around the app

  // Add sign in, sign up, sign out, and reset password functions
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const currentOrigin = window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${currentOrigin}/profile`,
        },
      });
      if (error) throw error;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });
      
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      toast({
        title: "Password Reset Error",
        description: error instanceof Error ? error.message : "Could not reset password",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // We'll add the auth state change listener in a useEffect hook in the component itself
  // This is to ensure it's only run once when the component mounts
  
  // import { useEffect } from 'react';
  // useEffect(() => {
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  //     setSession(session);
  //     setUser(session?.user ?? null);
  //     
  //     if (session?.user) {
  //       setTimeout(() => {
  //         fetchUserRole(session.user.id);
  //       }, 0);
  //     } else {
  //       setUserRole(null);
  //     }
  //   });
  //
  //   const initializeAuth = async () => {
  //     const { data: { session } } = await supabase.auth.getSession();
  //     setSession(session);
  //     setUser(session?.user ?? null);
  //     if (session?.user) {
  //       await fetchUserRole(session.user.id);
  //     }
  //     setIsLoading(false);
  //   };
  //
  //   initializeAuth();
  //   return () => subscription.unsubscribe();
  // }, [navigate, toast]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signIn,
      signUp,
      signOut,
      resetPassword,
      isLoading,
      userRole,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
