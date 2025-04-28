import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Designer } from "@/services/designerTypes";

interface DesignerFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  designer: Designer | null;
}

const DesignerForm = ({ open, setOpen, designer }: DesignerFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Designer>>({
    full_name: "",
    email: "",
    specialty: "apparel",
    bio: "",
    portfolio_url: "",
    image_url: "",
    featured: false,
    social_media: { instagram: "", facebook: "", twitter: "", website: "" },
  });

  // Load designer data when editing
  useEffect(() => {
    if (designer) {
      setFormData({
        full_name: designer.full_name,
        email: designer.email,
        specialty: designer.specialty,
        bio: designer.bio,
        portfolio_url: designer.portfolio_url,
        image_url: designer.image_url,
        featured: designer.featured,
        social_media: designer.social_media || { instagram: "", facebook: "", twitter: "", website: "" },
      });
    }
  }, [designer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      social_media: { ...prev.social_media, [name]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Make sure required fields are present
      if (!formData.full_name || !formData.specialty) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (designer) {
        // Update existing designer
        const { error } = await supabase
          .from("designers")
          .update(formData)
          .eq("id", designer.id);

        if (error) throw error;

        toast({
          title: "Designer updated",
          description: "The designer has been successfully updated.",
        });
      } else {
        // Create new designer
        const { error } = await supabase
          .from("designers")
          .insert([formData as Required<Pick<Designer, 'full_name' | 'specialty'>>]);

        if (error) throw error;

        toast({
          title: "Designer created",
          description: "The designer has been successfully created.",
        });
      }

      // Close the form and reset
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error saving designer",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{designer ? "Edit Designer" : "Add New Designer"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className="w-full p-2 border rounded-md"
                value={formData.full_name || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full p-2 border rounded-md"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="specialty" className="text-sm font-medium">
                Specialty <span className="text-red-500">*</span>
              </label>
              <select
                id="specialty"
                name="specialty"
                className="w-full p-2 border rounded-md"
                value={formData.specialty || "apparel"}
                onChange={handleChange}
                required
              >
                <option value="apparel">Apparel</option>
                <option value="accessories">Accessories</option>
                <option value="footwear">Footwear</option>
                <option value="jewelry">Jewelry</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="portfolio_url" className="text-sm font-medium">
                Portfolio URL
              </label>
              <input
                id="portfolio_url"
                name="portfolio_url"
                type="url"
                className="w-full p-2 border rounded-md"
                value={formData.portfolio_url || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="image_url" className="text-sm font-medium">
                Image URL
              </label>
              <input
                id="image_url"
                name="image_url"
                type="url"
                className="w-full p-2 border rounded-md"
                value={formData.image_url || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 flex items-center">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                className="mr-2"
                checked={formData.featured || false}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Featured Designer
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              className="w-full p-2 border rounded-md"
              value={formData.bio || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="instagram" className="text-sm">
                  Instagram
                </label>
                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.social_media?.instagram || ""}
                  onChange={handleSocialMediaChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="facebook" className="text-sm">
                  Facebook
                </label>
                <input
                  id="facebook"
                  name="facebook"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.social_media?.facebook || ""}
                  onChange={handleSocialMediaChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="twitter" className="text-sm">
                  Twitter
                </label>
                <input
                  id="twitter"
                  name="twitter"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.social_media?.twitter || ""}
                  onChange={handleSocialMediaChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="website" className="text-sm">
                  Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.social_media?.website || ""}
                  onChange={handleSocialMediaChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : designer ? "Update Designer" : "Create Designer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DesignerForm;
