
import { supabase } from "@/integrations/supabase/client";
import { Event, CreateEventPayload, UpdateEventPayload } from "./types";

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

export const createEvent = async (eventData: CreateEventPayload): Promise<Event> => {
  try {
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

      return {
        ...eventData_,
        ticket_types: ticketData
      } as Event;
    }

    return {
      ...eventData_,
      ticket_types: []
    } as Event;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const { error: ticketError } = await supabase
      .from('ticket_types')
      .delete()
      .eq('event_id', eventId);

    if (ticketError) throw ticketError;

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
