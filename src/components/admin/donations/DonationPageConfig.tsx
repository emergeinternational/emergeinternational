
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { DonationPageSettings } from "@/services/donationTypes";

const settingsSchema = z.object({
  hero_title: z.string().min(1, "Title is required"),
  hero_description: z.string().nullable(),
  hero_image_url: z.string().nullable(),
  featured_member: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    image_url: z.string()
  }).nullable(),
  min_donation_amount: z.number().min(0),
  max_donation_amount: z.number().min(0),
  suggested_amounts: z.array(z.number()),
  currency_options: z.array(z.string()),
  payment_methods: z.array(z.string()),
  thank_you_message: z.string()
});

const DonationPageConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<'hero' | 'featured' | null>(null);

  const { data: settings } = useQuery<DonationPageSettings>({
    queryKey: ["donation-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donation_page_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof settingsSchema>) => {
      const { error } = await supabase
        .from("donation_page_settings")
        .update(values)
        .eq("id", settings?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation-page-settings"] });
      toast({
        title: "Settings updated",
        description: "The donation page settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings || {
      hero_title: "",
      hero_description: "",
      hero_image_url: "",
      featured_member: null,
      min_donation_amount: 10,
      max_donation_amount: 1000000,
      suggested_amounts: [20, 50, 100, 500],
      currency_options: ["ETB", "USD"],
      payment_methods: ["bank_transfer", "mobile_money"],
      thank_you_message: "",
    },
  });

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'hero' | 'featured'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(type);
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('donation-page')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('donation-page')
        .getPublicUrl(filePath);

      if (type === 'hero') {
        form.setValue('hero_image_url', publicUrl);
      } else {
        const featuredMember = form.getValues('featured_member') || {
          name: '',
          role: '',
          bio: '',
          image_url: ''
        };
        form.setValue('featured_member', {
          ...featuredMember,
          image_url: publicUrl
        });
      }

      toast({
        title: "Image uploaded",
        description: "The image has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(null);
    }
  };

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation Page Settings</CardTitle>
        <CardDescription>
          Customize how the donation page appears to your users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hero Section</h3>
              
              <FormField
                control={form.control}
                name="hero_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hero_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Hero Image</Label>
                <div className="flex items-center gap-4">
                  {settings?.hero_image_url && (
                    <img 
                      src={settings.hero_image_url} 
                      alt="Hero" 
                      className="w-40 h-24 object-cover rounded"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('hero-image-upload')?.click()}
                    disabled={uploadingImage === 'hero'}
                  >
                    {uploadingImage === 'hero' ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <input
                    id="hero-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'hero')}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Featured Member</h3>
              
              <FormField
                control={form.control}
                name="featured_member.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured_member.role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured_member.bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Member Image</Label>
                <div className="flex items-center gap-4">
                  {form.watch('featured_member.image_url') && (
                    <img 
                      src={form.watch('featured_member.image_url')} 
                      alt="Featured Member" 
                      className="w-40 h-40 object-cover rounded-full"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('featured-image-upload')?.click()}
                    disabled={uploadingImage === 'featured'}
                  >
                    {uploadingImage === 'featured' ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <input
                    id="featured-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'featured')}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Donation Settings</h3>
              
              <FormField
                control={form.control}
                name="min_donation_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Donation Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_donation_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Donation Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thank_you_message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thank You Message</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      This message will be shown after a successful donation
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading || mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DonationPageConfig;
