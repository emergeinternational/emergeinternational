
import { useState } from "react";
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
  
  // Create the profile-pictures bucket if it doesn't exist
  const createBucketIfNotExists = async () => {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error checking buckets:", listError);
        throw new Error(`Failed to check storage buckets: ${listError.message}`);
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'profile-pictures');
      
      if (!bucketExists) {
        console.log("Creating profile-pictures bucket");
        const { data, error: createError } = await supabase.storage
          .createBucket('profile-pictures', { 
            public: true,
            fileSizeLimit: 5 * 1024 * 1024 // 5MB limit for profile pictures
          });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          throw new Error(`Failed to create storage bucket: ${createError.message}`);
        }
        
        console.log("Bucket created successfully:", data);
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring bucket exists:", error);
      throw error;
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Check file size - limit to 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error(`File size too large. Please select an image less than 5MB.`);
      }
      
      // Ensure proper bucket exists
      await createBucketIfNotExists();
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type // Explicitly set content type
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      onUpload(data.publicUrl);

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error uploading avatar",
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
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload profile picture"
        />
        <button
          className="emerge-button-secondary flex items-center gap-2 px-4 py-2"
          type="button"
          disabled={uploading}
        >
          <Camera className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default AvatarUpload;
