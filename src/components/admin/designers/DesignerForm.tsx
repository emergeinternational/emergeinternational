import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Designer, CreatorCategory } from "@/services/designerTypes";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Define the creator categories
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

// Define the form schema with validation rules
const designerFormSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  specialty: z.enum(["apparel", "accessories", "footwear", "jewelry", "other"]),
  category: z.enum([
    "fashion_designer",
    "interior_designer",
    "graphic_designer",
    "visual_artist",
    "photographer",
    "event_planner",
    "model",
    "creative_director"
  ]),
  bio: z.string().optional().or(z.literal("")),
  portfolio_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  image_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  social_media: z.object({
    instagram: z.string().optional().or(z.literal("")),
    facebook: z.string().optional().or(z.literal("")),
    twitter: z.string().optional().or(z.literal("")),
    website: z.string().optional().or(z.literal("")),
  }).optional(),
  featured_project: z.object({
    title: z.string(),
    description: z.string().optional(),
    image_url: z.string().optional(),
    link: z.string().optional(),
  }).optional(),
  achievements: z.array(z.string()).optional(),
  showcase_images: z.array(z.string()).optional(),
});

interface DesignerFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  designer: Designer | null;
  onSuccess?: () => void;
}

const DesignerForm = ({ open, setOpen, designer, onSuccess }: DesignerFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof designerFormSchema>>({
    resolver: zodResolver(designerFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      specialty: "apparel",
      category: "fashion_designer",
      bio: "",
      portfolio_url: "",
      image_url: "",
      featured: false,
      social_media: {
        instagram: "",
        facebook: "",
        twitter: "",
        website: "",
      },
      featured_project: {
        title: "",
        description: "",
        image_url: "",
        link: "",
      },
      achievements: [],
      showcase_images: [],
    },
  });

  useEffect(() => {
    if (designer) {
      form.reset({
        full_name: designer.full_name,
        email: designer.email || "",
        specialty: designer.specialty,
        category: designer.category,
        bio: designer.bio || "",
        portfolio_url: designer.portfolio_url || "",
        image_url: designer.image_url || "",
        featured: designer.featured,
        social_media: designer.social_media || {
          instagram: "",
          facebook: "",
          twitter: "",
          website: "",
        },
        featured_project: designer.featured_project || {
          title: "",
          description: "",
          image_url: "",
          link: "",
        },
        achievements: designer.achievements || [],
        showcase_images: designer.showcase_images || [],
      });
    } else {
      form.reset({
        full_name: "",
        email: "",
        specialty: "apparel",
        category: "fashion_designer",
        bio: "",
        portfolio_url: "",
        image_url: "",
        featured: false,
        social_media: {
          instagram: "",
          facebook: "",
          twitter: "",
          website: "",
        },
        featured_project: {
          title: "",
          description: "",
          image_url: "",
          link: "",
        },
        achievements: [],
        showcase_images: [],
      });
    }
  }, [designer, form]);

  const onSubmit = async (values: z.infer<typeof designerFormSchema>) => {
    setIsSubmitting(true);
    try {
      if (designer) {
        const { error } = await supabase
          .from("designers")
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq("id", designer.id);

        if (error) throw error;

        toast({
          title: "Designer updated",
          description: `${values.full_name} has been updated successfully.`,
        });
      } else {
        const { error } = await supabase.from("designers").insert([
          {
            ...values,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        toast({
          title: "Designer created",
          description: `${values.full_name} has been added successfully.`,
        });
      }

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{designer ? "Edit Creator" : "Add Creator"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creator Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {creatorCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
                    </FormControl>
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apparel">Apparel</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="footwear">Footwear</SelectItem>
                        <SelectItem value="jewelry">Jewelry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Featured Designer</FormLabel>
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

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Designer biography"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="portfolio_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Social Media</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="social_media.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="Instagram username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="social_media.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="Facebook profile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="social_media.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input placeholder="Twitter handle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="social_media.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="Personal website" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Featured Project */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Featured Project</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="featured_project.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Project title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured_project.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Project description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : designer
                  ? "Update Designer"
                  : "Create Designer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DesignerForm;
