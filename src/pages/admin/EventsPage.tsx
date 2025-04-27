import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from '@/layouts/AdminLayout';
import EventsSection from '@/components/admin/EventsSection';
import DiscountCodeManager from '@/components/admin/DiscountCodeManager';
import EventRegistrations from '@/components/admin/EventRegistrations';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Event } from "@/hooks/useEvents";
import EventForm from '@/components/events/EventForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEventsAdmin } from "@/hooks/useEvents";
import { createEvent, updateEvent } from "@/services/eventService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Update the schema to include ticket types
const eventFormSchema = z.object({
  name: z.string().min(3, "Event name is required"),
  date: z.string().min(3, "Event date is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  capacity: z.number().optional(),
  max_tickets: z.number().optional(),
  image_url: z.string().optional(),
  currency_code: z.string().default("ETB"),
  is_featured: z.boolean().default(false),
  ticket_types: z.array(
    z.object({
      name: z.string().min(1, "Ticket name is required"),
      price: z.number().min(0, "Price must be a positive number"),
      description: z.string().optional(),
      quantity: z.number().min(1, "At least one ticket must be available"),
      benefits: z.array(z.string()).default([])
    })
  ).default([])
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState('management');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refetch: refetchEvents } = useEventsAdmin();
  
  // Initialize form with react-hook-form and zod validation
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
      image_url: '',
      currency_code: 'ETB',
      is_featured: false,
      ticket_types: []
    }
  });

  // Create event mutation
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
      refetchEvents();
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
    mutationFn: ({ id, data }: { id: string; data: any }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event updated successfully!"
      });
      setIsDialogOpen(false);
      refetchEvents();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Function to handle form submission
  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && currentEvent) {
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
            image_url: values.image_url,
            currency_code: values.currency_code,
            is_featured: values.is_featured,
            ticket_types: values.ticket_types
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
          image_url: values.image_url,
          currency_code: values.currency_code,
          is_featured: values.is_featured,
          ticket_types: values.ticket_types
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to open form for creating a new event
  const handleCreateEvent = () => {
    form.reset({
      name: '',
      date: '',
      description: '',
      location: '',
      category: '',
      capacity: undefined,
      max_tickets: undefined,
      image_url: '',
      currency_code: 'ETB',
      is_featured: false,
      ticket_types: []
    });
    setIsEditMode(false);
    setCurrentEvent(null);
    setIsDialogOpen(true);
  };

  // Function to open form for editing an existing event
  const handleEditEvent = (event: Event) => {
    form.reset({
      name: event.name,
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      description: event.description || '',
      location: event.location || '',
      category: event.category || '',
      capacity: event.capacity,
      max_tickets: event.max_tickets,
      image_url: event.image_url || '',
      currency_code: event.currency_code || 'ETB',
      is_featured: event.is_featured || false,
      ticket_types: event.ticket_types?.map(ticket => ({
        name: ticket.name,
        price: ticket.price,
        description: ticket.description || '',
        quantity: ticket.quantity,
        benefits: []
      })) || []
    });
    setIsEditMode(true);
    setCurrentEvent(event);
    setIsDialogOpen(true);
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Event Management</h1>
        
        <Tabs defaultValue="management" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="management">Event Management</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="discounts">Discount Codes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="management" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Events & Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <EventsSection onCreateEvent={handleCreateEvent} onEditEvent={handleEditEvent} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="registrations" className="space-y-4">
            <EventRegistrations />
          </TabsContent>
          
          <TabsContent value="discounts" className="space-y-4">
            <DiscountCodeManager />
          </TabsContent>
        </Tabs>

        <EventForm 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          form={form}
          isEditMode={isEditMode}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting || createEventMutation.isPending || updateEventMutation.isPending}
          currentEvent={currentEvent}
        />
      </div>
    </AdminLayout>
  );
};

export default EventsPage;
