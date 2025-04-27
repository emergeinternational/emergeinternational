import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEventsAdmin } from "@/hooks/useEvents";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { deleteEvent } from "@/services/eventService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "@/services/events/types";

interface EventsSectionProps {
  onCreateEvent?: () => void;
  onEditEvent?: (event: Event) => void;
}

const EventsSection = ({ onCreateEvent, onEditEvent }: EventsSectionProps) => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const { data: events, isLoading, refetch } = useEventsAdmin();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const canEdit = hasRole(['admin', 'editor']);
  
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully."
      });
      setIsDeleteDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    deleteEventMutation.mutate(selectedEvent.id);
  };

  const openEditDialog = (event: Event) => {
    if (onEditEvent) {
      onEditEvent(event);
    }
  };

  const openDeleteDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <div>
      <div className="bg-emerge-cream p-4 rounded mb-5">
        <div className="flex justify-between items-center">
          <Button 
            className="flex items-center text-emerge-gold"
            variant="ghost"
            disabled={!canEdit}
            onClick={() => {
              if (onCreateEvent) {
                onCreateEvent();
                setTimeout(() => refetch(), 500);
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>ADD NEW EVENT</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="text-sm"
          >
            Refresh Events
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {events && events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="bg-white p-5 rounded shadow">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium mb-2">{event.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">
                    Date: {event.date ? format(new Date(event.date), 'MMMM dd, yyyy') : 'No date set'}
                  </p>
                  <p className="text-sm mb-2">
                    Location: {event.location || 'No location set'}
                  </p>
                  <div className="flex gap-2">
                    {event.is_featured && (
                      <Badge className="bg-emerge-gold text-xs">Featured</Badge>
                    )}
                    <Badge className="bg-gray-100 text-gray-800 text-xs">
                      {event.ticket_types?.reduce((sum, ticket) => sum + (ticket.tickets_sold || 0), 0) || 0} Registrations
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {event.ticket_types?.length || 0} Ticket Types
                    </Badge>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEditDialog(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      onClick={() => openDeleteDialog(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No events found. Create your first event by clicking the "ADD NEW EVENT" button.
          </div>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this event?</p>
            <p className="font-medium mt-2">{selectedEvent?.name}</p>
            <p className="text-sm text-red-600 mt-2">
              This will also delete all ticket types and registrations associated with this event. This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteEvent}
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsSection;
