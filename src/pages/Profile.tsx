import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      console.log("No authenticated user found in Profile page, redirecting to login");
      navigate("/login");
    } else if (user) {
      console.log("User authenticated in Profile page:", user.email);
    }
  }, [user, isLoading, navigate]);

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerge-darkBg flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  // If there's no user and we're not loading, the useEffect will redirect
  // But just in case, return null
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-emerge-darkBg">
      <Navigation variant="dark" />
      <div className="emerge-container pt-24 pb-16">
        <div className="max-w-2xl mx-auto bg-white/10 p-6 rounded-lg shadow-lg">
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
