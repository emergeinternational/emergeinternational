
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
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName}`);
        
        const { error } = await supabase.storage
          .createBucket(bucketName, {
            public: options?.public ?? true,
            fileSizeLimit: options?.fileSizeLimit ?? 1024 * 1024 // Default 1MB
          });
        
        if (error) throw error;
        return true;
      } else {
        console.log(`Bucket ${bucketName} already exists`);
        return true;
      }
    } catch (err) {
      console.error(`Error ensuring bucket ${bucketName}:`, err);
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
      // Ensure bucket exists
      const bucketReady = await ensureBucket(bucketName);
      if (!bucketReady) throw new Error(`Failed to ensure bucket ${bucketName}`);
      
      // Generate file path if not provided
      const filePath = path || `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      // Upload file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert !== undefined ? options.upsert : true
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
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
