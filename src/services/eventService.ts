import { supabase } from "@/integrations/supabase/client";

export interface TicketType {
  id: string;
  event_id: string;
  type: string;
  price: number;
  description: string;
  benefits: string[];
  available_quantity: number;
  sold_quantity: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  capacity?: number;
  currency_code: string;
  organizer?: string;
  event_type?: string;
  venue_map?: string;
  featured?: boolean;
  start_time?: string;
  end_time?: string;
  contact_email?: string;
  contact_phone?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export interface EventWithTickets extends Event {
  tickets: TicketType[];
}

export const fetchEvents = async (): Promise<EventWithTickets[]> => {
  try {
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select()
      .order('date', { ascending: true });
    
    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    if (!events || events.length === 0) {
      return [];
    }

    const eventIds = events.map(event => event.id);
    const { data: tickets, error: ticketsError } = await supabase
      .from("ticket_types")
      .select()
      .in('event_id', eventIds);

    if (ticketsError) {
      console.error("Error fetching ticket types:", ticketsError);
      throw ticketsError;
    }

    // Combine events with their tickets
    const eventsWithTickets = events.map(event => ({
      ...event,
      tickets: (tickets || []).filter(ticket => ticket.event_id === event.id)
    }));

    return eventsWithTickets;
  } catch (error) {
    console.error("Error in fetchEvents:", error);
    return [];
  }
};

export const fetchEventDetails = async (eventId: string): Promise<EventWithTickets | null> => {
  try {
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select()
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error("Error fetching event details:", eventError);
      return null;
    }

    const { data: tickets, error: ticketsError } = await supabase
      .from("ticket_types")
      .select()
      .eq('event_id', eventId);

    if (ticketsError) {
      console.error("Error fetching ticket types:", ticketsError);
      throw ticketsError;
    }

    return {
      ...event,
      tickets: tickets || []
    };
  } catch (error) {
    console.error("Error in fetchEventDetails:", error);
    return null;
  }
};

export const registerForEvent = async (
  eventId: string,
  ticketTypeId: string,
  ticketType: string,
  amount: number,
  currency: string,
  paymentMethodId: string,
  originalAmount: number,
  exchangeRate: number
): Promise<{ success: boolean; registrationId?: string; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "You must be logged in to register for events" };
    }

    // Create the registration
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id,
        ticket_type: ticketType,
        amount: amount,
        payment_status: 'pending',
        payment_method_id: paymentMethodId,
        currency_code: currency,
        original_amount: originalAmount,
        exchange_rate: exchangeRate
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event registration:", error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      registrationId: data.id 
    };
  } catch (error: any) {
    console.error("Error in registerForEvent:", error);
    return { success: false, error: error.message };
  }
};
