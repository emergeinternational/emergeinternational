
import { supabase } from "@/integrations/supabase/client";
import { TicketType, CreateTicketTypePayload, UpdateEventPayload } from "./types";

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

export const updateEventTickets = async (eventId: string, eventData: UpdateEventPayload): Promise<void> => {
  try {
    if (!eventData.ticket_types) return;

    const { data: existingTickets, error: fetchError } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('event_id', eventId);

    if (fetchError) throw fetchError;

    const existingTicketsMap = new Map();
    existingTickets?.forEach(ticket => {
      existingTicketsMap.set(ticket.id, ticket);
    });

    for (const ticket of eventData.ticket_types) {
      const hasValidId = ticket.id && 
                        typeof ticket.id === 'string' && 
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticket.id);

      if (hasValidId && existingTicketsMap.has(ticket.id)) {
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

        if (updateTicketError) throw updateTicketError;

        existingTicketsMap.delete(ticket.id);
      } else {
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

        if (insertTicketError) throw insertTicketError;
      }
    }

    for (const [id] of existingTicketsMap.entries()) {
      const { error: deleteError } = await supabase
        .from('ticket_types')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    }
  } catch (error) {
    console.error(`Error updating tickets for event ${eventId}:`, error);
    throw error;
  }
};
