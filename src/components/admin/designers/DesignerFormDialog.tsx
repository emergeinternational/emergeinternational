
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Designer, getSpecialtyOptions, CreatorCategory } from "@/services/designerTypes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface DesignerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designer?: Designer | null;
  onSave?: () => void;
}

const DesignerFormDialog = ({
  open,
  onOpenChange,
  designer,
  onSave
}: DesignerFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Designer>>(
    designer
      ? { ...designer }
      : {
          full_name: "",
          email: "",
          bio: "",
          category: "fashion_designer" as CreatorCategory,
          specialty: "apparel", // Changed to string to match database
          portfolio_url: "",
          location: "",
          social_media: {
            instagram: "",
            website: "",
            twitter: "",
          },
          image_url: "",
          featured: false,
        }
  );
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      social_media: {
        ...formData.social_media,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleCategoryChange = (value: string) => {
    const category = value as CreatorCategory;
    const specialtyOptions = getSpecialtyOptions(category);
    
    setFormData({
      ...formData,
      category,
      specialty: specialtyOptions[0].value
    });
  };

  const handleSpecialtyChange = (value: string) => {
    setFormData({
      ...formData,
      specialty: value // Store directly as string to match database
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const designerData = {
        full_name: formData.full_name!,
        email: formData.email,
        bio: formData.bio!,
        specialty: formData.specialty as string, // Store as string
        category: formData.category!,
        portfolio_url: formData.portfolio_url,
        location: formData.location,
        social_media: formData.social_media,
        image_url: formData.image_url,
        featured: formData.featured,
        updated_at: new Date().toISOString()
      };

      if (designer?.id) {
        // Update existing designer
        const { error } = await supabase
          .from("designers")
          .update(designerData)
          .eq("id", designer.id);

        if (error) throw error;

        toast({
          title: "Designer updated",
          description: `${formData.full_name} has been updated successfully.`,
        });
      } else {
        // Create new designer
        const { error } = await supabase
          .from("designers")
          .insert({
            ...designerData,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Designer created",
          description: `${formData.full_name} has been added to the platform.`,
        });
      }

      onOpenChange(false);
      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving designer:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save designer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {designer?.id ? "Edit Designer" : "Add New Designer"}
          </DialogTitle>
          <DialogDescription>
            {designer?.id
              ? "Update this designer's information"
              : "Add a new designer to the platform"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                name="bio"
                className="min-h-[100px]"
                value={formData.bio || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion_designer">Fashion Designer</SelectItem>
                    <SelectItem value="interior_designer">Interior Designer</SelectItem>
                    <SelectItem value="graphic_designer">Graphic Designer</SelectItem>
                    <SelectItem value="visual_artist">Visual Artist</SelectItem>
                    <SelectItem value="photographer">Photographer</SelectItem>
                    <SelectItem value="event_planner">Event Planner</SelectItem>
                    <SelectItem value="model">Model</SelectItem>
                    <SelectItem value="creative_director">Creative Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={handleSpecialtyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.category && getSpecialtyOptions(formData.category).map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                name="portfolio_url"
                value={formData.portfolio_url || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image_url">Profile Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url || ""}
                onChange={handleInputChange}
              />
            </div>
            <h3 className="font-medium pt-2">Social Media</h3>
            <div className="grid gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                value={formData.social_media?.instagram || ""}
                onChange={handleSocialMediaChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.social_media?.website || ""}
                onChange={handleSocialMediaChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                name="twitter"
                value={formData.social_media?.twitter || ""}
                onChange={handleSocialMediaChange}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
                }
              />
              <Label htmlFor="featured">Featured Designer</Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : designer?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DesignerFormDialog;
