
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
        max_tickets: eventData.max_tickets,
        price: eventData.price
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

export const updateEvent = async (eventId: string, eventData: UpdateEventPayload): Promise<Event> => {
  try {
    // First update the event data
    const updateData: any = {};
    
    if (eventData.name !== undefined) updateData.name = eventData.name;
    if (eventData.description !== undefined) updateData.description = eventData.description;
    if (eventData.date !== undefined) updateData.date = eventData.date;
    if (eventData.location !== undefined) updateData.location = eventData.location;
    if (eventData.capacity !== undefined) updateData.capacity = eventData.capacity;
    if (eventData.is_featured !== undefined) updateData.is_featured = eventData.is_featured;
    if (eventData.category !== undefined) updateData.category = eventData.category;
    if (eventData.image_url !== undefined) updateData.image_url = eventData.image_url;
    if (eventData.currency_code !== undefined) updateData.currency_code = eventData.currency_code;
    if (eventData.max_tickets !== undefined) updateData.max_tickets = eventData.max_tickets;
    if (eventData.price !== undefined) updateData.price = eventData.price;

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();

    if (updateError) throw updateError;

    // If ticket types are provided, update them
    if (eventData.ticket_types) {
      await updateEventTickets(eventId, eventData);
    }

    // Fetch the updated event with ticket types
    const { data: eventWithTickets, error: fetchError } = await supabase
      .from('events')
      .select(`
        *,
        ticket_types (*)
      `)
      .eq('id', eventId)
      .single();

    if (fetchError) throw fetchError;

    return {
      ...eventWithTickets,
      ticket_types: eventWithTickets.ticket_types || []
    } as Event;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
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
