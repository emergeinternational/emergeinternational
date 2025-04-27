
import { supabase } from "@/integrations/supabase/client";

// Define explicit types for our registration data
interface QrRegistration {
  id: string;
  qr_code?: string | null;
  qr_code_active?: boolean | null;
  payment_status?: string;
}

export const generateQRCode = (registration: { id: string, event_id: string }): string => {
  return `EVT-${registration.event_id}-${registration.id}-${Date.now()}`;
};

export const validateQRCode = async (qrCodeValue: string): Promise<boolean> => {
  try {
    const { data: registration } = await supabase
      .from('event_registrations')
      .select('id, qr_code_active')
      .eq('qr_code', qrCodeValue)
      .eq('payment_status', 'approved')
      .single();

    // If no data found or QR is inactive, validation fails
    if (!registration || registration.qr_code_active === false) {
      console.log("QR code not found or inactive");
      return false;
    }

    // Deactivate the QR code after successful scan
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ 
        qr_code_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', registration.id);

    if (updateError) {
      console.error("Error deactivating QR code:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("QR Code Validation Error:", error);
    return false;
  }
};
