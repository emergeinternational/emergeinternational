
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Designer, CreatorCategory, DesignerSpecialty, getSpecialtyOptions } from "@/services/designerTypes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload } from "lucide-react";

interface DesignerFormDialogProps {
  open: boolean;
  designer?: Designer | null;
  onClose: (refresh: boolean) => void;
}

const creatorCategories: { value: CreatorCategory; label: string }[] = [
  { value: "fashion_designer", label: "Fashion Designer" },
  { value: "interior_designer", label: "Interior Designer" },
  { value: "graphic_designer", label: "Graphic Designer" },
  { value: "visual_artist", label: "Visual Artist" },
  { value: "photographer", label: "Photographer" },
  { value: "event_planner", label: "Event Planner" },
  { value: "model", label: "Model" },
  { value: "creative_director", label: "Creative Director" },
];

const DesignerFormDialog = ({
  open,
  designer,
  onClose,
}: DesignerFormDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState<string>("apparel");
  const [category, setCategory] = useState<CreatorCategory>("fashion_designer");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [location, setLocation] = useState("");
  
  // Get specialty options based on the current category
  const specialtyOptions = getSpecialtyOptions(category);

  useEffect(() => {
    if (designer) {
      setFullName(designer.full_name);
      setEmail(designer.email || "");
      setBio(designer.bio || "");
      setSpecialty(designer.specialty);
      setCategory(designer.category);
      setPortfolioUrl(designer.portfolio_url || "");
      setInstagram(designer.social_media?.instagram || "");
      setTwitter(designer.social_media?.twitter || "");
      setWebsite(designer.social_media?.website || "");
      setImageUrl(designer.image_url || "");
      setFeatured(designer.featured);
      setLocation(designer.location || "");
    } else {
      resetForm();
    }
  }, [designer]);

  // Set initial specialty when category changes
  useEffect(() => {
    if (specialtyOptions.length > 0) {
      setSpecialty(specialtyOptions[0].value);
    }
  }, [category]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setBio("");
    setCategory("fashion_designer");
    setSpecialty("apparel");
    setPortfolioUrl("");
    setInstagram("");
    setTwitter("");
    setWebsite("");
    setImageUrl("");
    setFeatured(false);
    setLocation("");
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('designers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('designers')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast({
        title: "Image uploaded successfully",
        description: "The professional's image has been uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName) {
      toast({
        title: "Missing information",
        description: "Please provide the professional's name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const designerData = {
        full_name: fullName,
        email: email || null,
        bio: bio || null,
        specialty: specialty as DesignerSpecialty,
        category,
        portfolio_url: portfolioUrl || null,
        location: location || null,
        social_media: {
          instagram: instagram || null,
          twitter: twitter || null,
          website: website || null,
        },
        image_url: imageUrl || null,
        featured,
        updated_at: new Date().toISOString(),
      };

      if (designer?.id) {
        const { error } = await supabase
          .from("designers")
          .update(designerData)
          .eq("id", designer.id);

        if (error) throw error;
        
        toast({
          title: "Professional updated",
          description: `${fullName}'s profile has been updated successfully.`,
        });
      } else {
        const { error } = await supabase
          .from("designers")
          .insert([{
            ...designerData,
            created_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast({
          title: "Professional created",
          description: `${fullName}'s profile has been added successfully.`,
        });
      }

      onClose(true);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error saving professional",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {designer ? `Edit Creative Professional: ${designer.full_name}` : "Add New Creative Professional"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter bio or description"
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value as CreatorCategory);
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {creatorCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={specialty}
                  onValueChange={(value) => setSpecialty(value as DesignerSpecialty)}
                >
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Social Media / Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Links & Social Media</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://example.com/portfolio"
                />
              </div>
              
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Username without @"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Personal Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
          
          {/* Image Upload */}
          <div className="space-y-4">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4">
              {imageUrl && (
                <div className="relative h-24 w-24 rounded-full overflow-hidden border">
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer flex items-center gap-2 border rounded-md px-3 py-2 hover:bg-gray-100"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{imageUrl ? "Change Image" : "Upload Image"}</span>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </div>
            </div>
          </div>
          
          {/* Featured Status */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="featured" 
                checked={featured}
                onCheckedChange={(checked) => setFeatured(!!checked)}
              />
              <Label htmlFor="featured">Featured Professional</Label>
            </div>
          </div>
          
          {/* Form Buttons */}
          <div className="flex justify-end gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !fullName}
              className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{designer ? "Update Professional" : "Create Professional"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DesignerFormDialog;
