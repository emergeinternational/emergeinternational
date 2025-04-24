
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const ProfileForm = () => {
  const { user } = useAuth();
  const { createProfile, isLoading } = useProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: "",
    country: "",
    city: "",
    language: ""
  });

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
        <label htmlFor="full_name" className="block text-sm font-medium mb-1">
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          className="emerge-input w-full"
          required
        />
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium mb-1">
          Country
        </label>
        <input
          id="country"
          type="text"
          value={formData.country}
          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
          className="emerge-input w-full"
          required
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium mb-1">
          City
        </label>
        <input
          id="city"
          type="text"
          value={formData.city}
          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          className="emerge-input w-full"
          required
        />
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium mb-1">
          Preferred Language
        </label>
        <input
          id="language"
          type="text"
          value={formData.language}
          onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
          className="emerge-input w-full"
          required
        />
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
