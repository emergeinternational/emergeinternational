
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BasicInfoSection from "./profile/BasicInfoSection";
import ContactSection from "./profile/ContactSection";
import AvatarUpload from "./profile/AvatarUpload";
import { useStorage } from "@/hooks/useStorage"; // Import our hook

const ProfileForm = () => {
  const { user } = useAuth();
  const { createProfile, isLoading } = useProfile();
  const { toast } = useToast();
  const { ensureBucket } = useStorage(); // Use our hook
  const [formData, setFormData] = useState({
    full_name: "",
    country: "",
    city: "",
    language: "",
    email: "",
    phone_number: "",
    social_media_handle: "",
    telegram_name: "",
    avatar_url: ""
  });

  // Check for the avatars bucket when component mounts
  useEffect(() => {
    if (user) {
      // Verify the avatars bucket exists
      ensureBucket('avatars', { 
        public: true,
        fileSizeLimit: 5 * 1024 * 1024 // 5MB limit
      }).catch(err => {
        console.error("Failed to ensure avatars bucket exists:", err);
        // Just log the error, don't show to user
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setFormData({
            full_name: data.full_name || "",
            country: data.country || "",
            city: data.city || "",
            language: data.language || "",
            email: data.email || "",
            phone_number: data.phone_number || "",
            social_media_handle: data.social_media_handle || "",
            telegram_name: data.telegram_name || "",
            avatar_url: data.avatar_url || ""
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      console.log("Submitting profile data:", formData);
      const success = await createProfile(user.id, formData);
      
      if (success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated."
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (url: string) => {
    console.log("Avatar URL updated:", url);
    setFormData(prev => ({
      ...prev,
      avatar_url: url
    }));
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <AvatarUpload 
        url={formData.avatar_url} 
        onUpload={handleAvatarUpload}
        userId={user.id}
      />
      
      <BasicInfoSection formData={formData} onChange={handleChange} />
      <ContactSection formData={formData} onChange={handleChange} />

      <button 
        type="submit" 
        className="emerge-button-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
};

export default ProfileForm;
