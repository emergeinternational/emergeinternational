
import { useQuery } from "@tanstack/react-query";
import { EventWithTickets, fetchEvents } from "@/services/eventService";

export const useEvents = () => {
  return useQuery<EventWithTickets[], Error>({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 60000, // Cache for 1 minute
  });
};
