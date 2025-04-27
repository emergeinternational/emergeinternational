
import { supabase } from "@/integrations/supabase/client";

export const generateQRCode = (registration: { id: string, event_id: string }): string => {
  return `EVT-${registration.event_id}-${registration.id}-${Date.now()}`;
};

export const validateQRCode = async (qrCodeValue: string): Promise<boolean> => {
  try {
    // First, check if the QR code exists and is for an approved payment
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id, qr_code')
      .eq('qr_code', qrCodeValue)
      .eq('payment_status', 'approved')
      .maybeSingle();

    if (error) {
      console.error("QR code validation error:", error);
      return false;
    }

    if (!data) {
      console.log("QR code not found");
      return false;
    }

    // For now, since qr_code_active doesn't exist yet, we'll handle tickets differently
    // We'll need to track used QR codes separately

    // Mark this QR code as used by updating payment_status
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ 
        payment_status: 'used',
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id);

    if (updateError) {
      console.error("Error marking QR code as used:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("QR Code Validation Error:", error);
    return false;
  }
};
