
import { useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/utils/imageCompression";

interface AvatarUploadProps {
  url: string | null;
  onUpload: (url: string) => void;
  userId: string;
}

const AvatarUpload = ({ url, onUpload, userId }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      setUploading(true);
      const file = event.target.files[0];
      
      // Validate original file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      console.log(`Starting upload process for file: ${file.name}, size: ${file.size} bytes`);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("User is not authenticated");
        throw new Error("You must be logged in to upload an avatar");
      }
      console.log("User is authenticated");

      // Compress image if needed
      console.log(`Compressing image: ${file.name}, size: ${file.size} bytes`);
      const compressedFile = await compressImage(file);
      console.log(`Compressed to: ${compressedFile.size} bytes`);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${userId}-${Date.now()}.${fileExt}`;
      
      console.log(`Uploading to avatars/${fileName}`);
      
      // List available buckets to check if avatars exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
      } else {
        console.log("Available buckets:", buckets?.map(b => b.name));
        const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
        console.log("Avatars bucket exists:", avatarBucketExists);
      }
      
      // Upload compressed image
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Upload error details:", uploadError);
        console.error("Error code:", uploadError.code);
        console.error("Error message:", uploadError.message);
        console.error("Error name:", uploadError.name);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
      
      if (!data || !data.path) {
        console.error("Upload succeeded but no path returned");
        throw new Error("Failed to get uploaded file path");
      }
      
      console.log("Upload successful, data:", data);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);
      
      console.log("Public URL:", publicUrlData.publicUrl);
      onUpload(publicUrlData.publicUrl);
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error: any) {
      console.error("Error uploading:", error);
      toast({
        title: "Upload Failed",
        description: error?.message || "Error uploading avatar",
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
          {url ? "Profile" : "No image"}
        </AvatarFallback>
      </Avatar>
      
      <div className="relative">
        <input
          type="file"
          accept="image/jpeg, image/png, image/jpg, image/webp"
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
