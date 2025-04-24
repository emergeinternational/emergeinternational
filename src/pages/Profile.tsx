
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerge-darkBg flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerge-darkBg">
      <Navigation variant="dark" />
      <div className="emerge-container pt-24 pb-16">
        <div className="max-w-2xl mx-auto bg-white/10 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-serif text-white mb-6 text-center">Your Profile</h1>
          {user && <ProfileForm />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
