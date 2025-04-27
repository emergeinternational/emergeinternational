
import { supabase } from "@/integrations/supabase/client";

export const generateQRCode = (registration: { id: string, event_id: string }): string => {
  return `EVT-${registration.event_id}-${registration.id}-${Date.now()}`;
};

export const validateQRCode = async (qrCodeValue: string): Promise<boolean> => {
  try {
    // Using a more explicit type approach to avoid excessive type instantiation
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('qr_code', qrCodeValue)
      .eq('payment_status', 'approved')
      .eq('qr_code_active', true)
      .maybeSingle();

    const registration = data as { id: string } | null;

    if (error || !registration) {
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
