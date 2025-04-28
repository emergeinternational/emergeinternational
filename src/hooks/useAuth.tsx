
import { useEffect, useState, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ensureUserProfile } from '@/utils/ensureUserProfile';

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
      console.log("Fetching user role for:", userId);
      
      // First try to find role in user_roles table
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (userRoleError) {
        console.error('Error fetching user role from user_roles table:', userRoleError);
        console.log("Falling back to profiles table for role lookup");
        fallbackToProfilesTable(userId);
        return;
      }
      
      if (userRoleData) {
        console.log('Role found in user_roles table:', userRoleData.role);
        setUserRole(userRoleData.role as UserRole);
        return;
      }
      
      console.log("No role found in user_roles table, falling back to profiles table");
      fallbackToProfilesTable(userId);
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('user' as UserRole);
    }
  };
  
  const fallbackToProfilesTable = async (userId: string) => {
    try {
      console.log("Looking up role in profiles table for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user role from profiles table:', error);
        console.log("Setting default role to 'user'");
        setUserRole('user' as UserRole);
        return;
      }
      
      console.log('Role found in profiles table:', data.role);
      setUserRole((data?.role as UserRole) ?? 'user' as UserRole);
    } catch (error) {
      console.error('Error in fallbackToProfilesTable:', error);
      setUserRole('user' as UserRole);
    }
  };

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user || !userRole) {
      console.log("hasRole check failed: user or userRole is null", { user: !!user, userRole });
      return false;
    }

    if (Array.isArray(requiredRole)) {
      const hasRequiredRole = requiredRole.includes(userRole);
      console.log(`hasRole check (array): user has role ${userRole}, needs one of [${requiredRole.join(', ')}] = ${hasRequiredRole}`);
      return hasRequiredRole;
    }

    const hasRequiredRole = userRole === requiredRole;
    console.log(`hasRole check (single): user has role ${userRole}, needs ${requiredRole} = ${hasRequiredRole}`);
    return hasRequiredRole;
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("User authenticated:", session.user.email);
          // Use setTimeout to avoid deadlocks with supabase auth
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          console.log("No authenticated user");
          setUserRole(null);
        }
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email);
          navigate('/profile');
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in."
          });
        }
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          navigate('/login');
          toast({
            title: "Signed out",
            description: "You've been signed out successfully."
          });
        }
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery detected');
          toast({
            title: "Password reset requested",
            description: "Please enter a new password."
          });
        }
        setIsLoading(false);
      }
    );

    const initializeAuth = async () => {
      try {
        console.log("Initial auth session check...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial auth session check:", session ? "Session exists" : "No session");
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("User is already authenticated", session.user.email);
          // Use setTimeout to avoid deadlocks with supabase auth
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          console.log("No authenticated user found during initialization");
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    return () => subscription.unsubscribe();
  }, [navigate, toast]);

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
      console.log("Sign up with redirect to:", `${currentOrigin}/profile`);
      
      // First attempt to sign up the user
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${currentOrigin}/profile`,
          data: {
            full_name: email.split('@')[0], // Create basic profile data
          }
        } 
      });
      
      if (error) throw error;
      
      // If signup was successful, ensure a profile exists
      if (data && data.user) {
        try {
          console.log("Creating profile for new user:", data.user.id);
          let retries = 0;
          const maxRetries = 3;
          let profileCreated = false;
          
          // First attempt
          profileCreated = await ensureUserProfile(data.user.id, email);
          
          // Retry with exponential backoff if needed
          while (retries < maxRetries && !profileCreated) {
            retries++;
            console.warn(`Profile creation attempt ${retries} failed, retrying...`);
            // Exponential backoff: 500ms, 1000ms, 2000ms
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries - 1)));
            profileCreated = await ensureUserProfile(data.user.id, email);
          }

          if (!profileCreated) {
            console.error("Failed to create user profile after multiple attempts");
            // Continue since the auth user was created even if profile creation failed
          }
        } catch (profileError) {
          console.error("Exception ensuring user profile during signup:", profileError);
          // Continue since the auth user was created even if profile creation failed
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (password: string) => {
    setIsLoading(true);
    try {
      console.log("Updating password");
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error("Password update error:", error);
        throw error;
      }

      console.log("Password updated successfully");
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });
      
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Password reset exception:", error);
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
