
import { supabase } from "@/integrations/supabase/client";

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  instructions: string;
  is_active: boolean;
  requires_verification: boolean;
  countries: string[];
}

export interface DiscountCode {
  id: string;
  event_id: string;
  code: string;
  discount_percent?: number;
  discount_amount?: number;
  valid_from: string;
  valid_until?: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
}

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const { data, error } = await supabase
      .from("payment_methods")
      .select()
      .eq('is_active', true);

    if (error) {
      console.error("Error fetching payment methods:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in fetchPaymentMethods:", error);
    return [];
  }
};

export const uploadPaymentProof = async (
  registrationId: string, 
  file: File
): Promise<string | null> => {
  try {
    // Generate a unique file path for the payment proof
    const filePath = `payment_proofs/${registrationId}/${file.name}`;
    
    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error("Error uploading payment proof:", error);
      throw error;
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path);

    // Update the registration record with the payment proof URL
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ payment_proof_url: publicUrl })
      .eq('id', registrationId);

    if (updateError) {
      console.error("Error updating registration with payment proof:", updateError);
      throw updateError;
    }

    return publicUrl;
  } catch (error) {
    console.error("Error in uploadPaymentProof:", error);
    return null;
  }
};

export const verifyDiscountCode = async (
  code: string,
  eventId: string
): Promise<{ valid: boolean; discountPercent?: number; discountAmount?: number; codeId?: string }> => {
  try {
    const { data, error } = await supabase
      .from("discount_codes")
      .select()
      .eq('code', code)
      .eq('event_id', eventId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { valid: false };
    }

    const now = new Date();
    const validFrom = new Date(data.valid_from);
    const validUntil = data.valid_until ? new Date(data.valid_until) : null;

    // Check if the code is within its valid date range
    if (now < validFrom || (validUntil && now > validUntil)) {
      return { valid: false };
    }

    // Check if the code has reached its maximum usage
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return { valid: false };
    }

    return {
      valid: true,
      codeId: data.id,
      discountPercent: data.discount_percent || undefined,
      discountAmount: data.discount_amount || undefined
    };
  } catch (error) {
    console.error("Error in verifyDiscountCode:", error);
    return { valid: false };
  }
};

export const useDiscountCode = async (codeId: string): Promise<boolean> => {
  try {
    // Use a custom RPC function to increment the usage count of the discount code
    // Since we need to use an RPC function and not a direct database call,
    // we need to make sure the function name matches what's defined in Supabase
    
    // Update to use correct function name from Supabase config
    const { error } = await supabase.rpc('increment_discount_code_usage', { code_id: codeId });
    
    if (error) {
      console.error("Error incrementing discount code usage:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in useDiscountCode:", error);
    return false;
  }
};
