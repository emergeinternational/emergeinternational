
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  ticket_types?: TicketType[];
}

export interface TicketType {
  id: string;
  event_id: string;
  type: string;
  price: number;
  description?: string;
  quantity: number;
  tickets_sold?: number;
  benefits?: string[];
  created_at: string;
  updated_at: string;
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
      return data as Event[];
    }
  });
};
