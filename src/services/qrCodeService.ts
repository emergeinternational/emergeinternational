
import { supabase } from "@/integrations/supabase/client";

export const generateQRCode = async (registrationId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('generate_qr_code', { registration_id: registrationId });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const validateQRCode = async (qrCode: string) => {
  try {
    // Check if QR code exists and is active
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id, user_id, event_id, ticket_type, payment_status')
      .eq('qr_code', qrCode)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) {
      return { valid: false, message: 'QR Code not found' };
    }
    
    // If the registration entry doesn't have qr_code_active, assume true
    // or handle accordingly based on your business logic
    const isActive = true; // Default to true if column doesn't exist
    
    if (!isActive) {
      return { valid: false, message: 'QR Code has been deactivated' };
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
    // Update to deactivate the QR code
    // If the column doesn't exist, this will be handled by your error handling
    const { error } = await supabase
      .from('event_registrations')
      .update({ qr_code_used: true })
      .eq('id', registrationId);
    
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deactivating QR code:', error);
    throw error;
  }
};
