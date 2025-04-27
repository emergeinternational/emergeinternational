
import { supabase } from "@/integrations/supabase/client";

export const generateQRCode = (registration: { id: string, event_id: string }): string => {
  return `EVT-${registration.event_id}-${registration.id}-${Date.now()}`;
};

export const validateQRCode = async (qrCodeValue: string): Promise<boolean> => {
  try {
    // First, query without accessing qr_code_active to check if record exists
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id, qr_code')
      .eq('qr_code', qrCodeValue)
      .eq('payment_status', 'approved')
      .maybeSingle();

    if (error) {
      console.log("QR code validation error:", error);
      return false;
    }

    if (!data) {
      console.log("QR code not found");
      return false;
    }

    // If record exists, check if the qr_code is still active
    const { data: activeData, error: activeError } = await supabase
      .from('event_registrations')
      .select('qr_code_active')
      .eq('id', data.id)
      .maybeSingle();

    if (activeError || !activeData || activeData.qr_code_active === false) {
      console.log("QR code inactive");
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
