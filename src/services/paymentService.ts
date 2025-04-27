
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
    const filePath = `payment_proofs/${registrationId}/${file.name}`;
    
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

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path);

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

    if (now < validFrom || (validUntil && now > validUntil)) {
      return { valid: false };
    }

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
    // Use the rpc method to call a database function that increments the discount code usage
    const { error } = await supabase
      .rpc('increment_discount_code_usage', { code_id: codeId });
    
    // If there's no database function available, we can use a different approach
    // by first getting the current count and then updating with the incremented value
    if (error && error.message.includes('function "increment_discount_code_usage" does not exist')) {
      console.log("Fallback: Using get and update instead of rpc function");
      
      // Get current uses first
      const { data: codeData } = await supabase
        .from('discount_codes')
        .select('current_uses')
        .eq('id', codeId)
        .single();
      
      if (codeData) {
        const newUses = (codeData.current_uses || 0) + 1;
        
        // Then update with new value
        const { error: updateError } = await supabase
          .from('discount_codes')
          .update({ current_uses: newUses })
          .eq('id', codeId);
        
        if (updateError) {
          console.error("Error incrementing discount code usage:", updateError);
          return false;
        }
        
        return true;
      }
      
      return false;
    }
    
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
