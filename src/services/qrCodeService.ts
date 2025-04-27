
import { supabase } from "@/integrations/supabase/client";
import QRCode from 'qrcode.react';
import { EventRegistration } from './workshopService';

export const generateQRCode = (registration: EventRegistration): string => {
  // Generate a unique, secure QR code value
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
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('qr_code', qrCodeValue)
      .eq('payment_status', 'approved')
      .eq('qr_code_active', true)
      .single();

    return !!data && !error;
  } catch (error) {
    console.error("QR Code Validation Error:", error);
    return false;
  }
};
