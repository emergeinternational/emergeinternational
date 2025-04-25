import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ProfileForm from "@/components/ProfileForm";
import ShippingAddresses from "@/components/profile/ShippingAddresses";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Profile = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("No authenticated user found in Profile page, redirecting to login");
      navigate("/login");
    } else if (user) {
      console.log("User authenticated in Profile page:", user.email);
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerge-darkBg flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  const handleRequestPasswordReset = async () => {
    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/email-login`;
      
      console.log("Reset password redirect URL:", redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: redirectTo
      });
      
      if (error) throw error;
      
      toast({
        title: "Reset email sent",
        description: "Check your email for the password reset link."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not send reset email",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-emerge-darkBg">
      <Navigation variant="dark" />
      <div className="emerge-container pt-24 pb-16">
        <div className="max-w-2xl mx-auto bg-white/10 p-6 rounded-lg space-y-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif text-white">Your Profile</h1>
            <Button
              variant="ghost"
              className="text-white hover:text-emerge-gold hover:bg-white/10"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
          
          <div className="mb-6 text-center text-white">
            <p>Signed in as: <span className="font-bold">{user.email}</span></p>
            <button 
              onClick={handleRequestPasswordReset}
              className="text-emerge-gold text-sm hover:underline mt-2"
            >
              Change Password
            </button>
          </div>
          
          <ProfileForm />
          
          <div className="border-t border-white/10 pt-8">
            <ShippingAddresses />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Profile;
