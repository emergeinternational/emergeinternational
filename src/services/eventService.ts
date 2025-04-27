import { supabase } from "@/integrations/supabase/client";
import { Event, TicketType } from "@/hooks/useEvents";

// Type for creating a new event
export interface CreateEventPayload {
  name: string;
  description?: string;
  date: string;
  location?: string;
  capacity?: number;
  is_featured?: boolean;
  category?: string;
  image_url?: string;
  currency_code?: string;
  max_tickets?: number;
  ticket_types?: CreateTicketTypePayload[];
}

// Type for creating a ticket type
export interface CreateTicketTypePayload {
  name: string;
  price: number;
  description?: string;
  quantity: number;
}

// Type for updating an event
export interface UpdateEventPayload {
  name?: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number;
  is_featured?: boolean;
  category?: string;
  image_url?: string;
  currency_code?: string;
  max_tickets?: number;
}

// Get all events with their ticket types
export const getEvents = async (): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        ticket_types (*)
      `)
      .order('date', { ascending: true });

    if (error) throw error;

    const eventsWithTickets = data.map(event => ({
      ...event,
      ticket_types: event.ticket_types || []
    }));

    return eventsWithTickets as Event[];
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get a single event by ID with its ticket types
export const getEventById = async (eventId: string): Promise<Event> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        ticket_types (*)
      `)
      .eq('id', eventId)
      .single();

    if (error) throw error;

    return {
      ...data,
      ticket_types: data.ticket_types || []
    } as Event;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (eventData: CreateEventPayload): Promise<Event> => {
  try {
    // Create the event first
    const { data: eventData_, error: eventError } = await supabase
      .from('events')
      .insert({
        name: eventData.name,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        capacity: eventData.capacity,
        is_featured: eventData.is_featured || false,
        category: eventData.category,
        image_url: eventData.image_url,
        currency_code: eventData.currency_code || 'ETB',
        max_tickets: eventData.max_tickets
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // If ticket types were provided, create them
    if (eventData.ticket_types && eventData.ticket_types.length > 0) {
      const ticketTypesWithEventId = eventData.ticket_types.map(ticket => ({
        name: ticket.name,
        price: ticket.price,
        description: ticket.description,
        quantity: ticket.quantity,
        event_id: eventData_.id
      }));

      const { data: ticketData, error: ticketError } = await supabase
        .from('ticket_types')
        .insert(ticketTypesWithEventId)
        .select();

      if (ticketError) throw ticketError;

      // Return the event with ticket types
      return {
        ...eventData_,
        ticket_types: ticketData
      } as Event;
    }

    // Return the event without ticket types
    return {
      ...eventData_,
      ticket_types: []
    } as Event;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (eventId: string, eventData: UpdateEventPayload): Promise<Event> => {
  try {
    // Create update object only with fields that are provided
    const updateData: { [key: string]: any } = {};
    Object.entries(eventData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // Update the event
    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select(`
        *,
        ticket_types (*)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      ticket_types: data.ticket_types || []
    } as Event;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    throw error;
  }
};

// Create a new ticket type for an event
export const createTicketType = async (eventId: string, ticketData: CreateTicketTypePayload): Promise<TicketType> => {
  try {
    const { data, error } = await supabase
      .from('ticket_types')
      .insert({
        ...ticketData,
        event_id: eventId
      })
      .select()
      .single();

    if (error) throw error;

    return data as TicketType;
  } catch (error) {
    console.error(`Error creating ticket type for event ${eventId}:`, error);
    throw error;
  }
};

// Update an existing ticket type
export const updateTicketType = async (
  ticketId: string, 
  ticketData: Partial<CreateTicketTypePayload>
): Promise<TicketType> => {
  try {
    const { data, error } = await supabase
      .from('ticket_types')
      .update(ticketData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;

    return data as TicketType;
  } catch (error) {
    console.error(`Error updating ticket type ${ticketId}:`, error);
    throw error;
  }
};

// Delete a ticket type
export const deleteTicketType = async (ticketId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('ticket_types')
      .delete()
      .eq('id', ticketId);

    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting ticket type ${ticketId}:`, error);
    throw error;
  }
};

// Delete an event and its associated ticket types
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    // First delete all ticket types associated with the event
    const { error: ticketError } = await supabase
      .from('ticket_types')
      .delete()
      .eq('event_id', eventId);

    if (ticketError) throw ticketError;

    // Then delete the event itself
    const { error: eventError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (eventError) throw eventError;
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    throw error;
  }
};
