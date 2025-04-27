
import { useQuery } from "@tanstack/react-query";
import { getEvents, getEventById } from "@/services/eventService";
import type { Event, TicketType } from "@/services/events/types";

// Use type-only exports to avoid circular dependencies
export type { Event, TicketType };

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
