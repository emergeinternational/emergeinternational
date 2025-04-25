
import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AvatarUploadProps {
  url: string | null;
  onUpload: (url: string) => void;
  userId: string;
}

const AvatarUpload = ({ url, onUpload, userId }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [bucketReady, setBucketReady] = useState(false);
  
  // Immediately attempt to ensure bucket exists when component mounts
  useEffect(() => {
    const prepareBucket = async () => {
      try {
        await ensureBucketExists();
        setBucketReady(true);
      } catch (error) {
        console.error("Failed to prepare bucket:", error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize storage. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    prepareBucket();
  }, []);
  
  // Create or verify the profile-pictures bucket
  const ensureBucketExists = async () => {
    try {
      // First check if bucket exists - use list buckets which is more reliable
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error checking buckets:", listError);
        throw new Error(`Failed to check storage buckets: ${listError.message}`);
      }
      
      // Check if the bucket exists in the returned array
      const bucketExists = buckets?.some(bucket => bucket.name === 'profile-pictures');
      
      if (!bucketExists) {
        console.log("Profile pictures bucket not found, attempting to create it");
        
        // Create the bucket with appropriate settings
        const { data, error: createError } = await supabase.storage
          .createBucket('profile-pictures', { 
            public: true,
            fileSizeLimit: 2 * 1024 * 1024 // Reduced to 2MB limit for profile pictures
          });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          throw new Error(`Failed to create storage bucket: ${createError.message}`);
        }
        
        console.log("Bucket created successfully:", data);
      } else {
        console.log("Profile pictures bucket already exists");
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring bucket exists:", error);
      throw error;
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // First make sure bucket is ready
      if (!bucketReady) {
        await ensureBucketExists();
        setBucketReady(true);
      }
      
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Stricter file validation
      // 1. Check file size - reduced to 2MB
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error(`File size too large. Please select an image less than 2MB.`);
      }
      
      // 2. Verify file type
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        throw new Error('Only JPEG, PNG and WebP images are allowed.');
      }
      
      // Create a unique filename to prevent collisions
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
      const filePath = `${sanitizedUserId}/${timestamp}.${fileExt}`;

      console.log(`Attempting to upload file: ${filePath}`);
      console.log(`File size: ${file.size} bytes, type: ${file.type}`);

      // Try the upload with careful error handling
      const { data, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Replace if exists
          contentType: file.type
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("Upload successful, getting public URL");
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      console.log("Public URL obtained:", urlData.publicUrl);
      
      // Update the profile with the new avatar URL
      onUpload(urlData.publicUrl);

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error("Upload process error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Error uploading avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={url || undefined} alt="Profile" />
        <AvatarFallback>
          {uploading ? "..." : url ? "Profile" : "No image"}
        </AvatarFallback>
      </Avatar>
      
      <div className="relative">
        <input
          type="file"
          accept="image/jpeg, image/png, image/jpg, image/webp"
          onChange={uploadAvatar}
          disabled={uploading || !bucketReady}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload profile picture"
        />
        <button
          className="emerge-button-secondary flex items-center gap-2 px-4 py-2"
          type="button"
          disabled={uploading || !bucketReady}
        >
          <Camera className="h-4 w-4" />
          {uploading ? "Uploading..." : !bucketReady ? "Initializing..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default AvatarUpload;
