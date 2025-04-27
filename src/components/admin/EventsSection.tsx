
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEventsAdmin } from "@/hooks/useEvents";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { createEvent, updateEvent, deleteEvent } from "@/services/eventService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "@/hooks/useEvents";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const EventsSection = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const { data: events, isLoading } = useEventsAdmin();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    description: '',
    location: '',
    is_featured: false
  });

  const canEdit = hasRole(['admin', 'editor']);

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast({
        title: "Event Created",
        description: "The event has been created successfully."
      });
      setIsAddDialogOpen(false);
      setNewEvent({
        name: '',
        date: '',
        description: '',
        location: '',
        is_featured: false
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast({
        title: "Event Updated",
        description: "The event has been updated successfully."
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully."
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const handleAddEvent = () => {
    const eventData = {
      ...newEvent,
      date: new Date(newEvent.date).toISOString()
    };
    createEventMutation.mutate(eventData);
  };

  const handleUpdateEvent = () => {
    if (!selectedEvent) return;
    
    const updatedData = {
      name: selectedEvent.name,
      description: selectedEvent.description,
      date: selectedEvent.date,
      location: selectedEvent.location,
      is_featured: selectedEvent.is_featured
    };
    
    updateEventMutation.mutate({ id: selectedEvent.id, data: updatedData });
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    deleteEventMutation.mutate(selectedEvent.id);
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center text-emerge-gold"
                variant="ghost"
                disabled={!canEdit}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span>ADD NEW EVENT</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Event Name*</Label>
                  <Input 
                    id="name" 
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                    placeholder="Enter event name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Event Date*</Label>
                  <div className="relative">
                    <Input 
                      id="date" 
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Enter event location"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Enter event description"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_featured" 
                    checked={newEvent.is_featured}
                    onCheckedChange={(checked) => 
                      setNewEvent({...newEvent, is_featured: checked as boolean})
                    }
                  />
                  <Label htmlFor="is_featured">Feature this event</Label>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleAddEvent}
                  disabled={!newEvent.name || !newEvent.date || createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? "Adding..." : "Add Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            className="bg-emerge-gold hover:bg-yellow-600 text-black"
            disabled={!canEdit}
          >
            MANAGE TICKET TYPES
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

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Event Name*</Label>
                <Input 
                  id="edit-name" 
                  value={selectedEvent.name}
                  onChange={(e) => setSelectedEvent({...selectedEvent, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Event Date*</Label>
                <div className="relative">
                  <Input 
                    id="edit-date" 
                    type="date"
                    value={selectedEvent.date.slice(0, 10)}
                    onChange={(e) => setSelectedEvent({...selectedEvent, date: e.target.value})}
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input 
                  id="edit-location" 
                  value={selectedEvent.location || ''}
                  onChange={(e) => setSelectedEvent({...selectedEvent, location: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={selectedEvent.description || ''}
                  onChange={(e) => setSelectedEvent({...selectedEvent, description: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-is_featured" 
                  checked={selectedEvent.is_featured}
                  onCheckedChange={(checked) => 
                    setSelectedEvent({...selectedEvent, is_featured: checked as boolean})
                  }
                />
                <Label htmlFor="edit-is_featured">Feature this event</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateEvent}
              disabled={!selectedEvent?.name || !selectedEvent?.date || updateEventMutation.isPending}
            >
              {updateEventMutation.isPending ? "Updating..." : "Update Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
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
