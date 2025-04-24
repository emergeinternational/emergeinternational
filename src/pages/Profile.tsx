
import Navigation from "@/components/Navigation";
import ProfileForm from "@/components/ProfileForm";

const Profile = () => {
  return (
    <div className="min-h-screen bg-emerge-darkBg">
      <Navigation variant="dark" />
      <div className="emerge-container pt-24">
        <div className="max-w-md mx-auto bg-white/10 p-6 rounded-lg">
          <h1 className="text-2xl font-serif text-white mb-6 text-center">Your Profile</h1>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
};

export default Profile;
