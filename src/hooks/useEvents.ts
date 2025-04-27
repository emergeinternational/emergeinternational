
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Event {
  id: string;
  name: string;
  date: string;
  description?: string;
  location?: string;
  price?: number;
  capacity?: number;
  image_url?: string;
  category?: string;
  ticket_types?: TicketType[];
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  tickets_sold: number;
  available_quantity: number;
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
      
      // Transform the data to match our interface
      return data.map((event: any) => ({
        ...event,
        ticket_types: event.ticket_types?.map((ticket: any) => ({
          ...ticket,
          available_quantity: Math.max(0, ticket.quantity - (ticket.tickets_sold || 0))
        })) || []
      }));
    }
  });
};
