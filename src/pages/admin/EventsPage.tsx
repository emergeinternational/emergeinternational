
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Event } from "@/hooks/useEvents";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  CreateEventPayload,
  UpdateEventPayload
} from "@/services/eventService";
import EventList from "@/components/events/EventList";
import EventForm from "@/components/events/EventForm";
import DeleteEventDialog from "@/components/events/DeleteEventDialog";

const ticketTypeSchema = z.object({
  name: z.string().min(1, "Ticket name is required"),
  price: z.coerce.number().min(0, "Price must be zero or greater"),
  description: z.string().optional(),
  quantity: z.coerce.number().int().positive("Quantity must be a positive number"),
  benefits: z.array(z.string()).optional()
});

const eventFormSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().optional(),
  date: z.string(),
  location: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  is_featured: z.boolean().default(false),
  category: z.string().optional(),
  image_url: z.string().optional(),
  currency_code: z.string().default("ETB"),
  max_tickets: z.coerce.number().int().positive().optional(),
  ticketTypes: z.array(ticketTypeSchema).optional()
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const EventsPage = () => {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const canEdit = hasRole(['admin', 'editor']);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  const { 
    data: events, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: getEvents,
    refetchOnWindowFocus: false,
  });

  const eventForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      date: "",
      location: "",
      capacity: undefined,
      is_featured: false,
      category: "",
      image_url: "",
      currency_code: "ETB",
      max_tickets: undefined,
      ticketTypes: []
    },
  });

  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventPayload) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast({
        title: "Event created",
        description: "The event has been created successfully.",
      });
      eventForm.reset();
      setFormDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventPayload }) => 
      updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast({
        title: "Event updated",
        description: "The event has been updated successfully.",
      });
      setIsEditMode(false);
      setCurrentEvent(null);
      eventForm.reset();
      setFormDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmitEvent = async (values: EventFormValues) => {
    console.log("Submitting event form with values:", values);
    
    if (isEditMode && currentEvent) {
      updateEventMutation.mutate({
        id: currentEvent.id,
        data: {
          name: values.name,
          description: values.description,
          date: values.date,
          location: values.location,
          capacity: values.capacity,
          is_featured: values.is_featured,
          category: values.category,
          image_url: values.image_url,
          currency_code: values.currency_code,
          max_tickets: values.max_tickets
        }
      });
    } else {
      const eventPayload: CreateEventPayload = {
        name: values.name,
        description: values.description,
        date: values.date,
        location: values.location,
        capacity: values.capacity,
        is_featured: values.is_featured,
        category: values.category,
        image_url: values.image_url,
        currency_code: values.currency_code,
        max_tickets: values.max_tickets
      };
      
      if (values.ticketTypes && values.ticketTypes.length > 0) {
        eventPayload.ticket_types = values.ticketTypes.map(ticket => ({
          name: ticket.name,
          price: ticket.price,
          description: ticket.description,
          quantity: ticket.quantity,
          benefits: ticket.benefits
        }));
      }
      
      console.log("Creating event with payload:", eventPayload);
      createEventMutation.mutate(eventPayload);
    }
  };

  const handleEditEvent = (event: Event) => {
    setCurrentEvent(event);
    setIsEditMode(true);
    
    eventForm.reset({
      name: event.name,
      description: event.description || "",
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location || "",
      capacity: event.capacity,
      is_featured: event.is_featured || false,
      category: event.category || "",
      image_url: event.image_url || "",
      currency_code: event.currency_code || "ETB",
      max_tickets: event.max_tickets,
      ticketTypes: event.ticket_types?.map(ticket => ({
        name: ticket.name,
        price: ticket.price,
        description: ticket.description || "",
        quantity: ticket.quantity,
        benefits: ticket.benefits || []
      })) || []
    });
    
    setFormDialogOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete.id);
    }
  };

  const confirmDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const handleAddEventClick = () => {
    setIsEditMode(false);
    setCurrentEvent(null);
    eventForm.reset({
      name: "",
      description: "",
      date: "",
      location: "",
      capacity: undefined,
      is_featured: false,
      category: "",
      image_url: "",
      currency_code: "ETB",
      max_tickets: undefined,
      ticketTypes: []
    });
    setFormDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Events Management</h1>
          </div>
          
          {canEdit && (
            <Button 
              className="flex items-center gap-2"
              onClick={handleAddEventClick}
            >
              <CalendarPlus className="h-4 w-4" />
              Add Event
            </Button>
          )}
        </div>

        <EventList 
          events={events}
          isLoading={isLoading}
          error={error as Error}
          onAddEvent={handleAddEventClick}
          onEditEvent={handleEditEvent}
          onDeleteEvent={confirmDeleteEvent}
        />
      </div>

      <EventForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        form={eventForm}
        isEditMode={isEditMode}
        onSubmit={handleSubmitEvent}
        isSubmitting={createEventMutation.isPending || updateEventMutation.isPending}
        currentEvent={currentEvent}
      />

      <DeleteEventDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        event={eventToDelete}
        onDelete={handleDeleteEvent}
        isDeleting={deleteEventMutation.isPending}
      />
    </AdminLayout>
  );
};

export default EventsPage;
