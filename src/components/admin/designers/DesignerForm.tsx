
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Designer } from "@/services/designerTypes";
import { useToast } from "@/hooks/use-toast";
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
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define the designer specialties
const specialties = [
  { value: "apparel", label: "Apparel" },
  { value: "accessories", label: "Accessories" },
  { value: "footwear", label: "Footwear" },
  { value: "jewelry", label: "Jewelry" },
  { value: "other", label: "Other" },
];

// Define the form schema with validation rules
const designerFormSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  specialty: z.enum(["apparel", "accessories", "footwear", "jewelry", "other"]),
  bio: z.string().optional().or(z.literal("")),
  portfolio_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  image_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  social_media: z
    .object({
      instagram: z.string().optional().or(z.literal("")),
      facebook: z.string().optional().or(z.literal("")),
      twitter: z.string().optional().or(z.literal("")),
      website: z.string().optional().or(z.literal("")),
    })
    .optional(),
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

  // Create form with validation
  const form = useForm<z.infer<typeof designerFormSchema>>({
    resolver: zodResolver(designerFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      specialty: "apparel",
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
    },
  });

  // Load designer data when editing
  useEffect(() => {
    if (designer) {
      form.reset({
        full_name: designer.full_name,
        email: designer.email || "",
        specialty: designer.specialty,
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
      });
    } else {
      form.reset({
        full_name: "",
        email: "",
        specialty: "apparel",
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
      });
    }
  }, [designer, form]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof designerFormSchema>) => {
    setIsSubmitting(true);
    try {
      if (designer) {
        // Update existing designer
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
        // Create new designer
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

      // Close form and refresh data
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
          <DialogTitle>{designer ? "Edit Designer" : "Add Designer"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty.value} value={specialty.value}>
                            {specialty.label}
                          </SelectItem>
                        ))}
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
