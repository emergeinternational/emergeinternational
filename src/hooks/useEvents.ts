
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
  tickets_sold?: number;
  benefits?: string[];
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  location?: string;
  capacity?: number;
  price?: number;
  created_at: string;
  updated_at: string;
  currency_code: string;
  is_featured: boolean;
  max_tickets?: number;
  category?: string;
  image_url?: string;
  organizer_id?: string;
  ticket_types?: TicketType[];
}

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
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
    }
  });
};
