
import { supabase } from "@/integrations/supabase/client";

// Define explicit types for our registration data
interface QrRegistration {
  id: string;
  qr_code?: string | null;
  qr_code_active?: boolean | null;
}

export const generateQRCode = (registration: { id: string, event_id: string }): string => {
  return `EVT-${registration.event_id}-${registration.id}-${Date.now()}`;
};

export const validateQRCode = async (qrCodeValue: string): Promise<boolean> => {
  try {
    // First, find the registration with this QR code
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('qr_code', qrCodeValue)
      .eq('payment_status', 'approved')
      .maybeSingle();

    if (error) {
      console.log("QR code validation error:", error);
      return false;
    }

    // If no registration found, QR code is invalid
    if (!data) {
      console.log("QR code not found");
      return false;
    }

    // Check if the QR code is active in a separate query
    const { data: statusData, error: statusError } = await supabase
      .from('event_registrations')
      .select('qr_code_active')
      .eq('id', data.id)
      .single();

    if (statusError) {
      console.error("Error checking QR code status:", statusError);
      return false;
    }

    // If QR code is not active, validation fails
    if (!statusData || statusData.qr_code_active === false) {
      console.log("QR code is inactive");
      return false;
    }

    // Deactivate the QR code after successful scan
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ 
        qr_code_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id);

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
