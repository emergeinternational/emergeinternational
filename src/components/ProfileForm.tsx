
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, Instagram, MessageCircle } from "lucide-react";

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
    telegram_name: ""
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
          telegram_name: data.telegram_name || ""
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-white mb-1">
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          className="emerge-input w-full"
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-white mb-1">
            Country
          </label>
          <input
            id="country"
            type="text"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            className="emerge-input w-full"
            placeholder="Enter your country"
            required
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-white mb-1">
            City
          </label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="emerge-input w-full"
            placeholder="Enter your city"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-white mb-1">
          Preferred Language
        </label>
        <input
          id="language"
          type="text"
          value={formData.language}
          onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
          className="emerge-input w-full"
          placeholder="Enter your preferred language"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="emerge-input w-full pl-10"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-white mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              className="emerge-input w-full pl-10"
              placeholder="Enter your phone number"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="social_media_handle" className="block text-sm font-medium text-white mb-1">
            Social Media Handle
          </label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="social_media_handle"
              type="text"
              value={formData.social_media_handle}
              onChange={(e) => setFormData(prev => ({ ...prev, social_media_handle: e.target.value }))}
              className="emerge-input w-full pl-10"
              placeholder="Enter your social media handle"
            />
          </div>
        </div>

        <div>
          <label htmlFor="telegram_name" className="block text-sm font-medium text-white mb-1">
            Telegram Username
          </label>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="telegram_name"
              type="text"
              value={formData.telegram_name}
              onChange={(e) => setFormData(prev => ({ ...prev, telegram_name: e.target.value }))}
              className="emerge-input w-full pl-10"
              placeholder="Enter your Telegram username"
            />
          </div>
        </div>
      </div>

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
