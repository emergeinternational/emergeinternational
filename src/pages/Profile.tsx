import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ProfileForm from "@/components/ProfileForm";
import ShippingAddresses from "@/components/profile/ShippingAddresses";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useStorage } from "@/hooks/useStorage"; // Import our hook
import UserTickets from '@/components/profile/UserTickets';

const Profile = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ensureBucket } = useStorage(); // Use our hook
  
  // Check if the avatars bucket exists when component mounts
  useEffect(() => {
    if (user) {
      // Check for the avatars bucket
      ensureBucket('avatars', { 
        public: true,
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      }).catch(err => {
        console.error("Failed to ensure avatars bucket exists:", err);
        // Just log the error, don't show to user as it's likely a permissions issue
        // and the bucket probably already exists on the server
      });
    }
  }, [user]);
  
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
          </div>
          
          <ProfileForm />
          
          <div className="border-t border-white/10 pt-8">
            <UserTickets />
          </div>
          
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
