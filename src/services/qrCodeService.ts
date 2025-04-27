
import { supabase } from "@/integrations/supabase/client";
import { EventRegistration } from './workshopService';

export const generateQRCode = (registration: EventRegistration): string => {
  return `EVT-${registration.event_id}-${registration.id}-${Date.now()}`;
};

export const sendQRCodeNotification = async (registration: EventRegistration) => {
  try {
    // Placeholder for email/notification sending logic
    console.log(`Sending QR Code for Event: ${registration.events?.name}`);
  } catch (error) {
    console.error("QR Code Notification Error:", error);
  }
};

export const validateQRCode = async (qrCodeValue: string): Promise<boolean> => {
  try {
    const { data: registration, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('qr_code', qrCodeValue)
      .eq('payment_status', 'approved')
      .eq('qr_code_active', true)
      .single();

    if (error || !registration) {
      return false;
    }

    // Deactivate the QR code after successful scan
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ qr_code_active: false })
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
