
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
  ticket_types?: {
    name: string;
    price: number;
    description?: string;
    quantity: number;
    benefits?: string[];
  }[];
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
  ticket_types?: {
    id?: string;
    name: string;
    price: number;
    description?: string;
    quantity: number;
    benefits?: string[];
  }[];
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
        event_id: eventData_.id,
        benefits: ticket.benefits || []
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
    console.log(`Updating event ${eventId} with data:`, eventData);
    
    // First, update the event itself (without ticket_types)
    const eventUpdateData = { ...eventData };
    delete eventUpdateData.ticket_types; // Remove ticket_types from event update data
    
    // Update the event
    const { data: updatedEvent, error: eventError } = await supabase
      .from('events')
      .update(eventUpdateData)
      .eq('id', eventId)
      .select()
      .single();

    if (eventError) {
      console.error('Error updating event:', eventError);
      throw new Error(`Error updating event: ${eventError.message}`);
    }

    // If ticket types were provided, handle them separately
    if (eventData.ticket_types && eventData.ticket_types.length > 0) {
      // Get existing ticket types for this event
      const { data: existingTickets, error: fetchError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId);

      if (fetchError) {
        console.error('Error fetching existing tickets:', fetchError);
        throw new Error(`Error fetching ticket types: ${fetchError.message}`);
      }
      
      // Create a map of existing tickets by ID for easier lookup
      const existingTicketsMap = new Map();
      existingTickets?.forEach(ticket => {
        existingTicketsMap.set(ticket.id, ticket);
      });
      
      // Process each ticket type from the update payload
      for (const ticket of eventData.ticket_types) {
        if (ticket.id && typeof ticket.id === 'string' && 
            ticket.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          // Valid UUID format - update existing ticket
          console.log(`Updating existing ticket ${ticket.id}:`, ticket);
          const ticketUpdateData = {
            name: ticket.name,
            price: ticket.price,
            description: ticket.description,
            quantity: ticket.quantity,
            benefits: ticket.benefits || []
          };
          
          const { error: updateTicketError } = await supabase
            .from('ticket_types')
            .update(ticketUpdateData)
            .eq('id', ticket.id);
            
          if (updateTicketError) {
            console.error('Error updating ticket type:', updateTicketError);
            throw new Error(`Error updating ticket type: ${updateTicketError.message}`);
          }
          
          // Remove from map to track which ones are processed
          existingTicketsMap.delete(ticket.id);
        } else if (!ticket.id || (typeof ticket.id === 'string' && !ticket.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))) {
          // No ID or invalid UUID format - create new ticket
          console.log(`Creating new ticket for event ${eventId}:`, ticket);
          const newTicketData = {
            name: ticket.name,
            price: ticket.price,
            description: ticket.description,
            quantity: ticket.quantity,
            event_id: eventId,
            benefits: ticket.benefits || []
          };
          
          const { error: insertTicketError } = await supabase
            .from('ticket_types')
            .insert(newTicketData);
            
          if (insertTicketError) {
            console.error('Error creating new ticket type:', insertTicketError);
            throw new Error(`Error creating ticket type: ${insertTicketError.message}`);
          }
        }
      }
      
      // Delete any tickets that weren't included in the update
      for (const [id, ticket] of existingTicketsMap.entries()) {
        console.log(`Deleting ticket ${id} that was not included in the update`);
        const { error: deleteError } = await supabase
          .from('ticket_types')
          .delete()
          .eq('id', id);
          
        if (deleteError) {
          console.error('Error deleting ticket type:', deleteError);
          throw new Error(`Error deleting ticket type: ${deleteError.message}`);
        }
      }
    }
    
    // Fetch the updated event with its ticket types
    const { data: finalEvent, error: fetchFinalError } = await supabase
      .from('events')
      .select(`
        *,
        ticket_types (*)
      `)
      .eq('id', eventId)
      .single();
      
    if (fetchFinalError) {
      console.error('Error fetching updated event:', fetchFinalError);
      throw new Error(`Error fetching updated event: ${fetchFinalError.message}`);
    }
    
    return {
      ...finalEvent,
      ticket_types: finalEvent.ticket_types || []
    } as Event;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    throw error instanceof Error ? error : new Error('Unknown error updating event');
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
