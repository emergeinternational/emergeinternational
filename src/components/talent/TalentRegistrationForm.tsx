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
const ACCEPTED_PORTFOLIO_TYPES = ["application/pdf", ...ACCEPTED_IMAGE_TYPES];

const talentFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  age: z.coerce.number().min(16, "Must be at least 16 years old"),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say", "Other"]),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  socialMediaHandle: z.string().optional(),
  telegramHandle: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  category: z.enum(["Model", "Dancer", "Singer", "Actor", "Designer", "Other"]),
  talentDescription: z.string()
    .min(10, "Please provide a description")
    .max(300, "Description must not exceed 300 characters"),
  availability: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, "You must agree to be contacted"),
});

type TalentFormData = z.infer<typeof talentFormSchema>;
type TalentStatus = 'pending' | 'approved' | 'rejected' | 'on_hold';

interface TalentRegistrationFormProps {
  onSubmitSuccess: () => void;
}

const TalentRegistrationForm = ({ onSubmitSuccess }: TalentRegistrationFormProps) => {
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [photoFilesCount, setPhotoFilesCount] = useState(0);
  const { toast } = useToast();
  const form = useForm<TalentFormData>({
    resolver: zodResolver(talentFormSchema),
    defaultValues: {
      consent: false,
      age: undefined,
      gender: undefined,
      category: undefined,
    },
  });

  const validateFiles = (files: FileList | null, type: "photo" | "video" | "portfolio") => {
    if (!files || files.length === 0) return true;
    
    if (type === "photo" && files.length > 3) {
      toast({
        title: "Too many files",
        description: "Please upload a maximum of 3 photos",
        variant: "destructive",
      });
      return false;
    }
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Files must be less than 100MB`,
          variant: "destructive",
        });
        return false;
      }
      
      let acceptedTypes: string[] = [];
      let typeDescription = "";
      
      if (type === "photo") {
        acceptedTypes = ACCEPTED_IMAGE_TYPES;
        typeDescription = "image files (JPG, PNG, WebP)";
      } else if (type === "video") {
        acceptedTypes = ACCEPTED_VIDEO_TYPES;
        typeDescription = "video files (MP4, MOV, AVI)";
      } else if (type === "portfolio") {
        acceptedTypes = ACCEPTED_PORTFOLIO_TYPES;
        typeDescription = "image or PDF files";
      }
      
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not valid. Please upload only ${typeDescription}`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };

  const ensureBucketExists = async () => {
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error checking buckets:", listError);
        return false;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'talent_media');
      
      if (!bucketExists) {
        const { data, error: createError } = await supabase.storage
          .createBucket('talent_media', { 
            public: true,
            fileSizeLimit: MAX_FILE_SIZE
          });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring bucket exists:", error);
      return false;
    }
  }

  const uploadFile = async (file: File, path: string) => {
    try {
      const bucketReady = await ensureBucketExists();
      
      if (!bucketReady) {
        throw new Error("Storage bucket could not be created or accessed");
      }
      
      const { data, error } = await supabase.storage
        .from("talent_media")
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from("talent_media")
        .getPublicUrl(data.path);
        
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error in uploadFile function:", error);
      throw error;
    }
  };

  const handleFileUpload = async (files: FileList | null, type: "photo" | "video" | "portfolio") => {
    if (!files || files.length === 0) return [];
    
    if (!validateFiles(files, type)) {
      return [];
    }

    const uploadPromises = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${type}s/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      uploadPromises.push(uploadFile(file, path));
    }

    return await Promise.all(uploadPromises);
  };

  const handlePhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotoFilesCount(e.target.files.length);
    }
  };

  const onSubmit = async (data: TalentFormData) => {
    try {
      setUploadingFiles(true);

      const photoInput = document.querySelector<HTMLInputElement>('#photos');
      
      if (!photoInput?.files || photoInput.files.length === 0) {
        toast({
          title: "Photos required",
          description: "Please upload at least one photo",
          variant: "destructive",
        });
        setUploadingFiles(false);
        return;
      }
      
      let photoUrls: string[] = [];
      try {
        photoUrls = await handleFileUpload(photoInput?.files || null, "photo");
        
        if (photoUrls.length === 0) {
          setUploadingFiles(false);
          return;
        }
      } catch (uploadError) {
        console.error("Error uploading photos:", uploadError);
        toast({
          title: "Upload Error",
          description: "Failed to upload photos. Please try again.",
          variant: "destructive",
        });
        setUploadingFiles(false);
        return;
      }

      const socialMedia = {
        instagram: data.socialMediaHandle || null,
        telegram: data.telegramHandle || null,
      };

      const submissionData = {
        full_name: data.fullName,
        email: data.email,
        phone: data.phoneNumber,
        age: data.age,
        country: data.country,
        photo_url: photoUrls[0],
        portfolio_url: data.portfolioUrl || null,
        category_type: data.category,
        social_media: socialMedia,
        status: 'pending' as TalentStatus,
      };

      console.log("Submitting talent application:", submissionData);

      const { data: insertedData, error } = await supabase
        .from('talent_applications')
        .insert(submissionData);

      if (error) {
        console.error("Supabase insertion error:", error);
        let errorMessage = "There was a problem submitting your registration.";
        
        if (error.message) {
          errorMessage += ` ${error.message}`;
        }
        
        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setUploadingFiles(false);
        return;
      }

      console.log("Talent application submitted successfully:", insertedData);

      toast({
        title: "Success!",
        description: "Your registration has been submitted successfully.",
      });
      
      form.reset();
      if (photoInput) photoInput.value = '';
      setPhotoFilesCount(0);
      
      onSubmitSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Submission error: ${error.message}` 
          : "There was a problem submitting your registration. Please try again.",
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
                      placeholder="Age"
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
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
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
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
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
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
                      <SelectItem value="Designer">Designer</SelectItem>
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
                  <FormLabel>Instagram Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@yourusername" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telegramHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@yourtelegram" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="portfolioUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio or Website URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://yourportfolio.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
              <FormLabel className={photoFilesCount === 0 ? "text-destructive" : ""}>
                Professional Photos (1-3 photos)*
              </FormLabel>
              <Input
                id="photos"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                multiple
                className={`mt-1 ${photoFilesCount === 0 ? "border-destructive" : ""}`}
                onChange={handlePhotoInputChange}
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload 1-3 professional photos (JPG, PNG, WebP)
              </p>
              {photoFilesCount === 0 && (
                <p className="text-sm text-destructive">At least one photo is required</p>
              )}
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

            <div>
              <FormLabel>Portfolio or Design Samples (Optional)</FormLabel>
              <Input
                id="portfolio"
                type="file"
                accept={ACCEPTED_PORTFOLIO_TYPES.join(",")}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload portfolio (PDF) or design samples (JPG, PNG, WebP)
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
