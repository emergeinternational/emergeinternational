import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];

const talentFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  age: z.number().min(16, "Must be at least 16 years old"),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say", "Other"]),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  socialMediaHandle: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  category: z.enum(["Model", "Dancer", "Singer", "Actor", "Other"]),
  talentDescription: z.string()
    .min(10, "Please provide a description")
    .max(300, "Description must not exceed 300 characters"),
  availability: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, "You must agree to be contacted"),
});

type TalentFormData = z.infer<typeof talentFormSchema>;

interface TalentRegistrationFormProps {
  onSubmitSuccess: () => void;
}

const TalentRegistrationForm = ({ onSubmitSuccess }: TalentRegistrationFormProps) => {
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { toast } = useToast();
  const form = useForm<TalentFormData>({
    resolver: zodResolver(talentFormSchema),
    defaultValues: {
      consent: false,
    },
  });

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("talent_media")
      .upload(path, file);

    if (error) throw error;
    return data.path;
  };

  const handleFileUpload = async (files: FileList | null, type: "photo" | "video") => {
    if (!files || files.length === 0) return [];

    const uploadPromises = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (type === "photo" && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload only image files (JPG, PNG, WebP)",
          variant: "destructive",
        });
        continue;
      }
      if (type === "video" && !ACCEPTED_VIDEO_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload only video files (MP4, MOV, AVI)",
          variant: "destructive",
        });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Files must be less than 100MB",
          variant: "destructive",
        });
        continue;
      }

      const path = `${type}s/${Date.now()}-${file.name}`;
      uploadPromises.push(uploadFile(file, path));
    }

    return await Promise.all(uploadPromises);
  };

  const onSubmit = async (data: TalentFormData) => {
    try {
      setUploadingFiles(true);

      // Handle photo uploads
      const photoInput = document.querySelector<HTMLInputElement>('#photos');
      const photoUrls = await handleFileUpload(photoInput?.files || null, "photo");

      if (photoUrls.length === 0) {
        toast({
          title: "Photos required",
          description: "Please upload at least one photo",
          variant: "destructive",
        });
        return;
      }

      // Handle video upload
      const videoInput = document.querySelector<HTMLInputElement>('#video');
      const videoUrls = await handleFileUpload(videoInput?.files || null, "video");

      // Use Supabase's server side REST endpoint with the public anon key from the client
      const SUPABASE_URL = "https://dqfnetchkvnzrtacgvfw.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZm5ldGNoa3ZuenJ0YWNndmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODkyNTgsImV4cCI6MjA2MTA2NTI1OH0.h6eC1M8Kxt1r-kATr_dXNfL41jQFd8khGqf7XLSupvg";

      const response = await fetch(`${SUPABASE_URL}/rest/v1/talent_registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          full_name: data.fullName,
          email: data.email,
          phone_number: data.phoneNumber,
          age: data.age,
          gender: data.gender,
          city: data.city,
          country: data.country,
          social_media_handle: data.socialMediaHandle,
          portfolio_url: data.portfolioUrl,
          category: data.category,
          talent_description: data.talentDescription,
          availability: data.availability,
          photo_urls: photoUrls,
          video_url: videoUrls[0],
          consent_given: data.consent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Success!",
        description: "Your registration has been submitted successfully.",
      });
      
      onSubmitSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-serif text-emerge-darkBg mb-6 text-center">
        Talent Registration Form
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender Identity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Model">Model</SelectItem>
                      <SelectItem value="Dancer">Dancer</SelectItem>
                      <SelectItem value="Singer">Singer</SelectItem>
                      <SelectItem value="Actor">Actor</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="socialMediaHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram or TikTok Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@yourusername" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="portfolioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio or Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yourportfolio.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="talentDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Talent Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about your experience and skills (max 300 characters)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Weekends only, Full-time, etc." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div>
              <FormLabel>Professional Photos (1-3 photos)</FormLabel>
              <Input
                id="photos"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                multiple
                max={3}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload 1-3 professional photos (JPG, PNG, WebP)
              </p>
            </div>

            <div>
              <FormLabel>Performance Video or Reel (Optional)</FormLabel>
              <Input
                id="video"
                type="file"
                accept={ACCEPTED_VIDEO_TYPES.join(",")}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a video up to 100MB (MP4, MOV, AVI)
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to be contacted regarding casting opportunities
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={uploadingFiles}
          >
            {uploadingFiles ? "Uploading Files..." : "Submit Registration"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default TalentRegistrationForm;
