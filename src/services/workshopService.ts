import { supabase } from "@/integrations/supabase/client";

export interface Workshop {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  spots?: number;
  is_archived: boolean;
  registration_link?: string;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  ticket_type: string;
  amount: number;
  payment_status: 'pending' | 'approved' | 'rejected';
  payment_proof_url?: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
  };
  events?: {
    name: string;
    date: string;
    location: string | null;
  };
}

export const getWorkshops = async (showArchived: boolean = false): Promise<Workshop[]> => {
  try {
    console.log(`Fetching workshops with archived=${showArchived}`);
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('is_archived', showArchived)
      .order('date', { ascending: true });
    
    if (error) {
      console.error("Error fetching workshops:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error in getWorkshops:", error);
    return [];
  }
};

export const getArchivedWorkshops = async (): Promise<Workshop[]> => {
  return getWorkshops(true);
};

export const saveEventRegistration = async (
  eventId: string, 
  ticketType: string,
  amount: number,
  paymentProofUrl?: string
): Promise<EventRegistration> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be authenticated to register for events");
    }
    
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id,
        ticket_type: ticketType,
        amount: amount,
        payment_status: 'pending',
        payment_proof_url: paymentProofUrl
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving event registration:", error);
      throw error;
    }

    return data as EventRegistration;
  } catch (error) {
    console.error("Error in saveEventRegistration:", error);
    throw error;
  }
};

export const getEventRegistrations = async (): Promise<EventRegistration[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_event_registrations');

    if (error) {
      console.error("Error fetching event registrations:", error);
      return [];
    }

    return data as EventRegistration[];
  } catch (error) {
    console.error("Error in getEventRegistrations:", error);
    return [];
  }
};

export const updateRegistrationStatus = async (
  registrationId: string,
  status: 'approved' | 'rejected'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('event_registrations')
      .update({
        payment_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', registrationId);

    if (error) {
      console.error("Error updating registration status:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateRegistrationStatus:", error);
    throw error;
  }
};

export const updatePaymentProof = async (
  registrationId: string,
  paymentProofUrl: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('event_registrations')
      .update({
        payment_proof_url: paymentProofUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', registrationId);

    if (error) {
      console.error("Error updating payment proof:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updatePaymentProof:", error);
    throw error;
  }
};
