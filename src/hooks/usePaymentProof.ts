
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStorage } from '@/hooks/useStorage';

export const usePaymentProof = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { ensureBucket, uploadFile } = useStorage();

  const uploadPaymentProof = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      // Ensure payment_proofs bucket exists
      await ensureBucket('payment_proofs', { 
        public: false,
        fileSizeLimit: 5242880 // 5MB
      });

      // Generate a unique file path
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = `payment_proofs/${fileName}`;

      // Upload the file
      const publicUrl = await uploadFile('payment_proofs', file, filePath);

      toast({
        title: "Payment proof uploaded",
        description: "Your payment screenshot has been uploaded successfully.",
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your payment proof. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadPaymentProof,
    isUploading
  };
};
