
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Ensures a storage bucket exists, creates it if not
   */
  const ensureBucket = async (bucketName: string, options?: { 
    public?: boolean;
    fileSizeLimit?: number;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Checking if bucket ${bucketName} exists...`);
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error checking buckets:", listError);
        console.error("Error message:", listError.message);
        throw new Error(`Failed to check storage buckets: ${listError.message}`);
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      console.log(`Bucket ${bucketName} exists: ${bucketExists}`);
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName} with options:`, options);
        
        // Only an authenticated admin or service role should try to create buckets
        // This will likely fail for regular users due to RLS policies
        const { error: createError } = await supabase.storage
          .createBucket(bucketName, {
            public: options?.public ?? true,
            fileSizeLimit: options?.fileSizeLimit ?? 1024 * 1024 * 5 // Default 5MB
          });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          console.error("Error message:", createError.message);
          // Don't throw here - just log the error and continue
          // This allows the function to handle both admin and non-admin users
          console.warn(`Unable to create bucket ${bucketName}, but continuing operation`);
          return false;
        }
        
        console.log(`Successfully created bucket: ${bucketName}`);
        return true;
      } else {
        console.log(`Bucket ${bucketName} already exists`);
        return true;
      }
    } catch (err) {
      console.error(`Error ensuring bucket exists ${bucketName}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Uploads a file to a specified bucket
   */
  const uploadFile = async (
    bucketName: string, 
    file: File, 
    path?: string,
    options?: { upsert?: boolean; cacheControl?: string }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("User is not authenticated");
        throw new Error("You must be logged in to upload files");
      }
      console.log("User authenticated for upload");

      // Generate file path if not provided
      const filePath = path || `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      console.log(`Attempting to upload file to ${bucketName}/${filePath}`);
      console.log(`File size: ${file.size} bytes`);
      console.log("Upload options:", { 
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert !== undefined ? options.upsert : true
      });
      
      // Upload file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert !== undefined ? options.upsert : true
        });
      
      if (error) {
        console.error("Storage upload error:", error);
        console.error("Error message:", error.message);
        throw error;
      }
      
      if (!data || !data.path) {
        console.error("Upload succeeded but no path returned");
        throw new Error("Failed to get uploaded file path");
      }

      console.log("Upload successful, data:", data);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      console.log("Public URL:", publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error(`Error uploading to ${bucketName}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    ensureBucket,
    uploadFile,
    isLoading,
    error
  };
};
