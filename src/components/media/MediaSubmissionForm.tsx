
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_MEDIA_SIZE = 250 * 1024 * 1024; // 250MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_MEDIA_TYPES = [
  "video/mp4", "video/quicktime", "application/pdf", 
  "application/zip", "application/x-zip-compressed"
];

const mediaFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  age: z.string().min(1, "Age is required"),
  category: z.enum(["Top Model", "Top Performer", "Top Dancer", "Fashion Designer"]),
  description: z.string().min(10, "Please provide a description").max(500, "Description must not exceed 500 characters"),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
});

type MediaFormData = z.infer<typeof mediaFormSchema>;

interface MediaSubmissionFormProps {
  onSubmitSuccess: () => void;
}

// Defining the valid status types based on the Supabase schema
type TalentStatus = "pending" | "approved" | "rejected" | "on_hold";

const MediaSubmissionForm = ({ onSubmitSuccess }: MediaSubmissionFormProps) => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      category: undefined,
    },
  });

  const validateFile = (file: File, type: "photo" | "media") => {
    const maxSize = type === "photo" ? MAX_IMAGE_SIZE : MAX_MEDIA_SIZE;
    const acceptedTypes = type === "photo" ? ACCEPTED_IMAGE_TYPES : ACCEPTED_MEDIA_TYPES;
    
    if (file.size > maxSize) {
      const sizeMB = type === "photo" ? "5MB" : "250MB";
      toast({
        title: "File too large",
        description: `${file.name} exceeds the maximum size of ${sizeMB}`,
        variant: "destructive",
      });
      return false;
    }
    
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a supported file type`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file, "photo")) {
        setPhotoFile(file);
      } else {
        e.target.value = '';
        setPhotoFile(null);
      }
    }
  };
  
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file, "media")) {
        setMediaFile(file);
      } else {
        e.target.value = '';
        setMediaFile(null);
      }
    }
  };

  const uploadFile = async (file: File, bucketName: string): Promise<string | null> => {
    try {
      if (!file) return null;
      
      console.log(`Uploading file ${file.name} (${file.size} bytes) to ${bucketName} bucket`);
      console.log(`File type: ${file.type}`);
      
      const timestamp = Date.now();
      const safeFilename = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
      const filePath = `public/${timestamp}-${safeFilename}`;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`Upload error for ${file.name}:`, error);
        console.error("Error message:", error.message);
        console.error("File details:", { name: file.name, size: file.size, type: file.type });
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }
      
      if (!data || !data.path) {
        throw new Error("Upload succeeded but no path returned");
      }
      
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      console.log("File uploaded successfully, URL:", publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Upload file function error:", error);
      throw error;
    }
  };

  const onSubmit = async (data: MediaFormData) => {
    try {
      if (!photoFile) {
        toast({
          title: "Photo required",
          description: "Please upload a photo or headshot",
          variant: "destructive",
        });
        return;
      }
      
      setUploading(true);
      setUploadProgress(0);
      
      let photoUrl: string | null = null;
      try {
        setUploadProgress(10);
        photoUrl = await uploadFile(photoFile, 'talent_media');
        if (!photoUrl) {
          throw new Error("Failed to get photo URL after upload");
        }
        setUploadProgress(50);
      } catch (error) {
        console.error("Error uploading photo:", error);
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload photo",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      
      let mediaUrl: string | null = null;
      if (mediaFile) {
        try {
          setUploadProgress(60);
          mediaUrl = await uploadFile(mediaFile, 'talent_media');
          setUploadProgress(80);
        } catch (error) {
          console.error("Error uploading media:", error);
          toast({
            title: "Warning",
            description: `Media file upload failed, but continuing with submission: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
      }
      
      setUploadProgress(90);
      
      const submissionData = {
        full_name: data.fullName,
        email: data.email,
        phone: data.phoneNumber,
        age: parseInt(data.age, 10),
        category_type: data.category,
        notes: data.description,
        photo_url: photoUrl,
        portfolio_url: mediaUrl,
        social_media: {
          instagram: data.instagramHandle || null,
          tiktok: data.tiktokHandle || null
        },
        status: "pending" as TalentStatus // explicitly typed as TalentStatus
      };
      
      console.log("Submitting entry:", submissionData);
      
      const { error: insertError } = await supabase
        .from('talent_applications')
        .insert(submissionData);
      
      if (insertError) {
        console.error("Database insertion error:", insertError);
        toast({
          title: "Submission Error",
          description: `Failed to save your submission: ${insertError.message}`,
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      
      setUploadProgress(100);
      
      toast({
        title: "Success!",
        description: "Your entry has been submitted for review.",
      });
      
      form.reset();
      setPhotoFile(null);
      setMediaFile(null);
      onSubmitSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Failed to process your submission",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-emerge-gold rounded-lg p-6 md:p-8">
      <h2 className="text-2xl font-serif text-emerge-gold mb-6 text-center">
        Submit Your Entry
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} className="bg-gray-800 border-gray-700 text-white" />
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
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} className="bg-gray-800 border-gray-700 text-white" />
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
                  <FormLabel className="text-white">Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1234567890" {...field} className="bg-gray-800 border-gray-700 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Age</FormLabel>
                  <FormControl>
                    <Input placeholder="Your age" {...field} className="bg-gray-800 border-gray-700 text-white" />
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
                  <FormLabel className="text-white">Select Your Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="Top Model">Top Model</SelectItem>
                      <SelectItem value="Top Performer">Top Performer</SelectItem>
                      <SelectItem value="Top Dancer">Top Dancer</SelectItem>
                      <SelectItem value="Fashion Designer">Fashion Designer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Talent Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about yourself and your experience (max 500 characters)" 
                    {...field} 
                    className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="instagramHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Instagram Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@yourusername" {...field} className="bg-gray-800 border-gray-700 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tiktokHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">TikTok Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@yourtiktok" {...field} className="bg-gray-800 border-gray-700 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div>
              <FormLabel className={!photoFile ? "text-destructive" : "text-white"}>
                Upload Your Photo or Headshot*
              </FormLabel>
              <Input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={handlePhotoChange}
                className={`mt-1 bg-gray-800 border-gray-700 text-white ${!photoFile ? "border-destructive" : ""}`}
              />
              <p className="text-sm text-gray-400 mt-1">
                Required - JPG, PNG, WebP only (max 5MB)
              </p>
              {photoFile && (
                <p className="text-sm text-green-500">Selected: {photoFile.name}</p>
              )}
            </div>

            <div>
              <FormLabel className="text-white">
                Upload a Video or Portfolio (Optional)
              </FormLabel>
              <Input
                type="file"
                accept={[...ACCEPTED_MEDIA_TYPES, ...ACCEPTED_IMAGE_TYPES].join(",")}
                onChange={handleMediaChange}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-sm text-gray-400 mt-1">
                Optional - MP4, MOV, PDF, ZIP formats accepted (max 250MB)
              </p>
              {mediaFile && (
                <p className="text-sm text-green-500">Selected: {mediaFile.name}</p>
              )}
            </div>
            
            {uploading && uploadProgress > 0 && (
              <div className="mt-4">
                <p className="text-sm text-white mb-1">Uploading: {uploadProgress}%</p>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={uploading} 
            className="w-full bg-emerge-gold hover:bg-yellow-500 text-black font-medium"
          >
            {uploading ? "Uploading..." : "Submit Entry"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default MediaSubmissionForm;
