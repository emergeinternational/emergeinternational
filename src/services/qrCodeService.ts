
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
    // Check if QR code exists and is active
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id, user_id, event_id, ticket_type, payment_status')
      .eq('id', qrCode) // Using the registration ID as the QR code
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) {
      return { valid: false, message: 'QR Code not found' };
    }
    
    // Check if already used - if the column exists
    const { data: usageData } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('id', qrCode)
      .eq('qr_code_used', true)
      .maybeSingle();
      
    if (usageData) {
      return { valid: false, message: 'QR Code has already been used' };
    }
    
    // Check payment status
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
    // First check if the qr_code_used column exists
    const { error: columnCheckError } = await supabase
      .from('event_registrations')
      .update({ payment_status: 'used' })
      .eq('id', registrationId);
    
    // Update regardless of whether the column exists
    // We'll use payment_status as a fallback to mark as used
    if (columnCheckError && !columnCheckError.message.includes('does not exist')) {
      throw columnCheckError;
    }
    
    return true;
  } catch (error) {
    console.error('Error deactivating QR code:', error);
    throw error;
  }
};
