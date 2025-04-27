
import { useQuery } from "@tanstack/react-query";
import { getEvents, getEventById } from "@/services/eventService";

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
    queryFn: getEvents,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useEvent = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventId ? getEventById(eventId) : Promise.reject('No event ID provided'),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!eventId, // Only run the query if eventId is provided
  });
};

export const useEventsAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'events'],
    queryFn: getEvents,
    refetchOnWindowFocus: true, // Enable auto-refresh for admin panel
    staleTime: 1000 * 60, // Cache for 1 minute for admin
  });
};
