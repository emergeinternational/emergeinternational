import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BasicInfoSection from "./profile/BasicInfoSection";
import CareerSection from "./profile/CareerSection";
import FashionSection from "./profile/FashionSection";
import ContactSection from "./profile/ContactSection";
import AvatarUpload from "./profile/AvatarUpload";

const ProfileForm = () => {
  const { user } = useAuth();
  const { createProfile, isLoading } = useProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: "",
    country: "",
    city: "",
    language: "",
    email: "",
    phone_number: "",
    social_media_handle: "",
    telegram_name: "",
    profession: "",
    industry: "",
    fashion_style: "",
    favorite_brands: [] as string[],
    linkedin_url: "",
    preferred_shopping_locations: [] as string[],
    size_preferences: {} as Record<string, any>,
    avatar_url: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
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
          profession: data.profession || "",
          industry: data.industry || "",
          fashion_style: data.fashion_style || "",
          favorite_brands: data.favorite_brands || [],
          linkedin_url: data.linkedin_url || "",
          preferred_shopping_locations: data.preferred_shopping_locations || [],
          size_preferences: typeof data.size_preferences === 'object' && data.size_preferences !== null 
            ? data.size_preferences 
            : {},
          avatar_url: data.avatar_url || ""
        });
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const success = await createProfile(user.id, formData);
      if (success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated."
        });
      }
    } catch (error) {
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
    setFormData(prev => ({
      ...prev,
      avatar_url: url
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <AvatarUpload 
        url={formData.avatar_url} 
        onUpload={handleAvatarUpload}
        userId={user?.id || ''}
      />
      
      <BasicInfoSection formData={formData} onChange={handleChange} />
      <CareerSection formData={formData} onChange={handleChange} />
      <FashionSection formData={formData} onChange={handleChange} />
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
