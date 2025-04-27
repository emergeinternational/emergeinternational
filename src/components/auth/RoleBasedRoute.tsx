
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const RoleBasedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = "/login" 
}: RoleBasedRouteProps) => {
  const { user, isLoading, hasRole, userRole } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    console.log(`RoleBasedRoute check at ${location.pathname}:`, { 
      isLoading,
      userAuthenticated: !!user,
      userRole,
      allowedRoles,
      hasRequiredRole: user ? hasRole(allowedRoles) : false
    });
    
    if (!isLoading && !user) {
      console.log("User not authenticated, will redirect to:", redirectTo);
    } else if (!isLoading && user && !hasRole(allowedRoles)) {
      console.log("User doesn't have required role:", {
        userRole,
        requiredRoles: allowedRoles
      });
      
      toast({
        title: "Access Denied",
        description: `You don't have the required permissions (${allowedRoles.join(', ')}) to access this page.`,
        variant: "destructive"
      });
    }
  }, [user, isLoading, hasRole, allowedRoles, redirectTo, location.pathname, userRole, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerge-darkBg flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
