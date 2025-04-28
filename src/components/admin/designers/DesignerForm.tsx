import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreatorCategory, getSpecialtyOptions } from "@/services/designerTypes";

interface DesignerFormProps {
  initialData?: {
    id?: string;
    full_name?: string;
    email?: string;
    bio?: string;
    specialty?: string;
    category?: CreatorCategory;
    portfolio_url?: string;
    location?: string;
    social_media?: {
      instagram?: string;
      website?: string;
      twitter?: string;
    };
    image_url?: string;
    featured?: boolean;
  };
  onSuccess?: () => void;
}

const formSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  category: z.enum([
    'fashion_designer',
    'interior_designer',
    'graphic_designer',
    'visual_artist',
    'photographer',
    'event_planner',
    'model',
    'creative_director'
  ] as const),
  specialty: z.string().min(1, "Please select a specialty"),
  portfolio_url: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  location: z.string().min(2, "Location must be at least 2 characters"),
  instagram: z.string().optional(),
  website: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
  twitter: z.string().optional(),
  image_url: z.string().optional(),
  featured: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

const DesignerForm = ({ initialData = {}, onSuccess }: DesignerFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CreatorCategory>(initialData?.category || 'fashion_designer');
  const { toast } = useToast();

  const specialtyOptions = getSpecialtyOptions(selectedCategory);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: initialData.full_name || "",
      email: initialData.email || "",
      bio: initialData.bio || "",
      category: initialData.category || "fashion_designer",
      specialty: initialData.specialty || specialtyOptions[0].value,
      portfolio_url: initialData.portfolio_url || "",
      location: initialData.location || "",
      instagram: initialData.social_media?.instagram || "",
      website: initialData.social_media?.website || "",
      twitter: initialData.social_media?.twitter || "",
      image_url: initialData.image_url || "",
      featured: initialData.featured || false
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const designerData = {
        full_name: data.full_name,
        email: data.email,
        bio: data.bio,
        specialty: data.specialty, // Using string instead of typed specialty
        category: data.category,
        portfolio_url: data.portfolio_url,
        location: data.location,
        social_media: {
          instagram: data.instagram,
          website: data.website,
          twitter: data.twitter
        },
        image_url: data.image_url,
        featured: data.featured,
        updated_at: new Date().toISOString()
      };

      if (initialData?.id) {
        // Update existing designer
        const { error } = await supabase
          .from('designers')
          .update(designerData)
          .eq('id', initialData.id);

        if (error) throw error;
        
        toast({
          title: "Designer updated",
          description: `${data.full_name} has been updated successfully.`
        });
      } else {
        // Create new designer
        const { error } = await supabase
          .from('designers')
          .insert({
            ...designerData,
            updated_at: new Date().toISOString() // Instead of created_at
          });

        if (error) throw error;
        
        toast({
          title: "Designer created",
          description: `${data.full_name} has been added to the platform.`
        });
        
        // Reset form if not updating
        form.reset({
          full_name: "",
          email: "",
          bio: "",
          category: "fashion_designer",
          specialty: specialtyOptions[0].value,
          portfolio_url: "",
          location: "",
          instagram: "",
          website: "",
          twitter: "",
          image_url: "",
          featured: false
        });
      }
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error saving designer:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-md shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about this designer..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-md shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value: string) => {
                      field.onChange(value);
                      setSelectedCategory(value as CreatorCategory);
                      // Reset specialty when category changes
                      const newOptions = getSpecialtyOptions(value as CreatorCategory);
                      form.setValue('specialty', newOptions[0].value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialty</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialtyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4">
            <FormField
              control={form.control}
              name="portfolio_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to the designer's portfolio website
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-md shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Social Media</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="@username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter/X</FormLabel>
                  <FormControl>
                    <Input placeholder="@username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-md shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Image & Status</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    URL to the designer's profile image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Designer</FormLabel>
                    <FormDescription>
                      Feature this designer on the homepage
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData?.id ? "Update Designer" : "Create Designer"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DesignerForm;
