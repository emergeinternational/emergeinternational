
import { supabase } from "@/integrations/supabase/client";

export const generateQRCode = async (registrationId: string) => {
  try {
    // Using direct table operations instead of RPC
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id, user_id, event_id, ticket_type')
      .eq('id', registrationId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Move interface outside of function scope
interface ValidateQRCodeResult {
  valid: boolean;
  message: string;
  registrationId?: string;
  userId?: string;
  eventId?: string;
  ticketType?: string;
}

export const validateQRCode = async (qrCode: string): Promise<ValidateQRCodeResult> => {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id, user_id, event_id, ticket_type, payment_status')
      .eq('id', qrCode)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) {
      return { valid: false, message: 'QR Code not found' };
    }
    
    if (data.payment_status !== 'approved') {
      return { 
        valid: false, 
        message: 'Payment not approved',
        registrationId: data.id
      };
    }
    
    return {
      valid: true,
      message: 'QR Code is valid',
      registrationId: data.id,
      userId: data.user_id,
      eventId: data.event_id,
      ticketType: data.ticket_type
    };
  } catch (error) {
    console.error('Error validating QR code:', error);
    throw error;
  }
};

export const deactivateQRCode = async (registrationId: string) => {
  try {
    const { error } = await supabase
      .from('event_registrations')
      .update({ payment_status: 'used' })
      .eq('id', registrationId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deactivating QR code:', error);
    throw error;
  }
};
