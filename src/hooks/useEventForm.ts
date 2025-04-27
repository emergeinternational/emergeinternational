
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent, updateEvent } from "@/services/eventService";
import { Event } from "@/hooks/useEvents";
import { useToast } from "@/hooks/use-toast";

// Event form schema definition
export const eventFormSchema = z.object({
  name: z.string().min(3, "Event name is required"),
  date: z.string().min(3, "Event date is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  capacity: z.number().optional(),
  max_tickets: z.number().optional(),
  price: z.number().optional(),
  image_url: z.string().optional(),
  currency_code: z.string().default("ETB"),
  is_featured: z.boolean().default(false),
  ticket_types: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Ticket name is required"),
      price: z.number().min(0, "Price must be a positive number"),
      description: z.string().optional(),
      quantity: z.number().min(1, "At least one ticket must be available"),
      benefits: z.array(z.string()).default([])
    })
  ).default([])
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const useEventForm = (onSuccess?: () => void) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: '',
      date: '',
      description: '',
      location: '',
      category: '',
      capacity: undefined,
      max_tickets: undefined,
      price: undefined,
      image_url: '',
      currency_code: 'ETB',
      is_featured: false,
      ticket_types: []
    }
  });

  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event created successfully!"
      });
      setIsDialogOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event updated successfully!"
      });
      setIsDialogOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && currentEvent) {
        // Ensure we're passing the correct ticket types with proper IDs
        const ticketTypes = values.ticket_types.map(ticket => {
          // Create a clean ticket data object
          const ticketData: any = {
            name: ticket.name,
            price: ticket.price,
            description: ticket.description || '',
            quantity: ticket.quantity,
            benefits: ticket.benefits || []
          };
          
          // Only include ID if it's a valid UUID
          if (ticket.id && typeof ticket.id === 'string' && 
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticket.id)) {
            ticketData.id = ticket.id;
          }
          
          return ticketData;
        });
        
        await updateEventMutation.mutateAsync({
          id: currentEvent.id,
          data: {
            name: values.name,
            date: values.date,
            description: values.description,
            location: values.location,
            category: values.category,
            capacity: values.capacity,
            max_tickets: values.max_tickets,
            price: values.price,
            image_url: values.image_url,
            currency_code: values.currency_code,
            is_featured: values.is_featured,
            ticket_types: ticketTypes
          }
        });
      } else {
        await createEventMutation.mutateAsync({
          name: values.name,
          date: values.date,
          description: values.description,
          location: values.location,
          category: values.category,
          capacity: values.capacity,
          max_tickets: values.max_tickets,
          price: values.price,
          image_url: values.image_url,
          currency_code: values.currency_code,
          is_featured: values.is_featured,
          ticket_types: values.ticket_types.map(ticket => ({
            name: ticket.name,
            price: ticket.price,
            description: ticket.description,
            quantity: ticket.quantity,
            benefits: ticket.benefits
          }))
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEvent = () => {
    form.reset({
      name: '',
      date: '',
      description: '',
      location: '',
      category: '',
      capacity: undefined,
      max_tickets: undefined,
      price: undefined,
      image_url: '',
      currency_code: 'ETB',
      is_featured: false,
      ticket_types: []
    });
    setIsEditMode(false);
    setCurrentEvent(null);
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    // Make sure ticket types are correctly initialized with IDs
    const formattedTicketTypes = event.ticket_types?.map(ticket => ({
      id: ticket.id,
      name: ticket.name,
      price: ticket.price,
      description: ticket.description || '',
      quantity: ticket.quantity,
      benefits: Array.isArray(ticket.benefits) ? ticket.benefits : defaultBenefits
    })) || [];
    
    form.reset({
      name: event.name,
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      description: event.description || '',
      location: event.location || '',
      category: event.category || '',
      capacity: event.capacity,
      max_tickets: event.max_tickets,
      price: event.price,
      image_url: event.image_url || '',
      currency_code: event.currency_code || 'ETB',
      is_featured: event.is_featured || false,
      ticket_types: formattedTicketTypes
    });
    setIsEditMode(true);
    setCurrentEvent(event);
    setIsDialogOpen(true);
  };

  return {
    form,
    isDialogOpen,
    setIsDialogOpen,
    isEditMode,
    currentEvent,
    isSubmitting: isSubmitting || createEventMutation.isPending || updateEventMutation.isPending,
    onSubmit,
    handleCreateEvent,
    handleEditEvent
  };
};

// Default benefits for ticket types
const defaultBenefits = ["Event Access", "Networking", "Certificate"];
