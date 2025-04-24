
import { useEffect, useState, createContext, useContext } from 'react';
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
      // Fetch the user's role from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      if (data?.role) {
        setUserRole(data.role as UserRole);
      } else {
        // Default role if not set
        setUserRole('user');
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
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
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial auth session check:", session ? "Session exists" : "No session");
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log("User is already authenticated", session.user.email);
          await fetchUserRole(session.user.id);
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
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${currentOrigin}/profile`
        } 
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
