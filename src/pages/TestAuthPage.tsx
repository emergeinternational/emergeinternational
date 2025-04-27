
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Code } from "@/components/ui/code";

export default function TestAuthPage() {
  const { user, isLoading, userRole, hasRole, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [profileData, setProfileData] = useState<any>(null);
  const [userRoleData, setUserRoleData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchUserRoleData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      setProfileData(data);
    } catch (error) {
      console.error("Error in fetchProfileData:", error);
    }
  };
  
  const fetchUserRoleData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching user role:", error);
        return;
      }
      
      setUserRoleData(data);
    } catch (error) {
      console.error("Error in fetchUserRoleData:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const checkAdminAccess = async () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="pt-24 px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
        
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</p>
            <p><strong>Authenticated:</strong> {user ? "Yes" : "No"}</p>
            <p><strong>User Email:</strong> {user?.email || "Not logged in"}</p>
            <p><strong>User ID:</strong> {user?.id || "Not logged in"}</p>
            <p><strong>User Role:</strong> {userRole || "Not available"}</p>
            <p><strong>Is Admin:</strong> {hasRole("admin") ? "Yes" : "No"}</p>
          </div>
        </div>
        
        {!user && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Login</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </div>
          </div>
        )}
        
        {user && (
          <>
            <div className="bg-white p-6 rounded shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Admin Access Test</h2>
              <Button onClick={checkAdminAccess}>
                Try to Access Admin Panel
              </Button>
            </div>
            
            <div className="bg-white p-6 rounded shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Profile Data</h2>
              {profileData ? (
                <Code>
                  {JSON.stringify(profileData, null, 2)}
                </Code>
              ) : (
                <p>Loading profile data...</p>
              )}
            </div>
            
            <div className="bg-white p-6 rounded shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">User Role Data</h2>
              {userRoleData ? (
                <Code>
                  {JSON.stringify(userRoleData, null, 2)}
                </Code>
              ) : (
                <p>No user role data found in separate table</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
