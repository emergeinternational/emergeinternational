
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';

const eventFormSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().optional(),
  date: z.string(),
  location: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().positive().optional(),
});

const EventsPage = () => {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const canEdit = hasRole(['admin', 'editor']);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, ticket_types(*)')
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const eventForm = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      date: "",
      location: "",
      capacity: undefined,
      price: undefined,
    },
  });

  const editForm = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      date: "",
      location: "",
      capacity: undefined,
      price: undefined,
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (values: z.infer<typeof eventFormSchema>) => {
      const { error, data } = await supabase
        .from('events')
        .insert([{
          name: values.name,
          description: values.description,
          date: new Date(values.date).toISOString(),
          location: values.location,
          capacity: values.capacity,
          price: values.price,
          organizer_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'published',
        }]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Event Created",
        description: "The event has been created successfully",
      });
      eventForm.reset();
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
    onError: (error) => {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string, values: z.infer<typeof eventFormSchema> }) => {
      const { error, data } = await supabase
        .from('events')
        .update({
          name: values.name,
          description: values.description,
          date: new Date(values.date).toISOString(),
          location: values.location,
          capacity: values.capacity,
          price: values.price,
        })
        .eq('id', id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Event Updated",
        description: "The event has been updated successfully",
      });
      setSelectedEvent(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
    onError: (error) => {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
    onError: (error) => {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = (values: z.infer<typeof eventFormSchema>) => {
    createEventMutation.mutate(values);
  };

  const handleUpdateEvent = (values: z.infer<typeof eventFormSchema>) => {
    if (!selectedEvent) return;
    updateEventMutation.mutate({ id: selectedEvent.id, values });
  };

  const handleEditClick = (event: any) => {
    setSelectedEvent(event);
    
    // Format the date for the datetime-local input
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toISOString().slice(0, 16);
    
    editForm.reset({
      name: event.name,
      description: event.description || "",
      date: formattedDate,
      location: event.location || "",
      capacity: event.capacity || undefined,
      price: event.price || undefined,
    });
  };

  const handleDeleteClick = (event: any) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEvent) {
      deleteEventMutation.mutate(selectedEvent.id);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Events Management</h1>
          </div>
          <div className="text-center py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-100 h-48 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Events Management</h1>
          </div>
          <div className="text-center py-8 text-red-500">
            <p>Error loading events. Please try again.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Events Management</h1>
          </div>
          
          {canEdit && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <Form {...eventForm}>
                  <form onSubmit={eventForm.handleSubmit(handleCreateEvent)} className="space-y-4">
                    <FormField
                      control={eventForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={eventForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Event description" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={eventForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={eventForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Event location" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={eventForm.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Event capacity" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={eventForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (ETB)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="Event price" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Create Event</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!events || events.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 mb-4">No events found</p>
            {canEdit && <p className="text-sm">Add your first event using the button above.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between mb-2">
                  <h3 className="text-lg font-semibold">{event.name}</h3>
                  {canEdit && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(event)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(event)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600 text-sm mt-2">{event.description}</p>
                <div className="mt-4">
                  <p><strong>Location:</strong> {event.location || 'Not specified'}</p>
                  <p><strong>Capacity:</strong> {event.capacity || 'Not specified'}</p>
                  <p><strong>Price:</strong> {event.price ? `ETB ${event.price}` : 'Free'}</p>
                  <p><strong>Ticket Types:</strong> {event.ticket_types?.length || 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={!!selectedEvent && !isDeleteDialogOpen} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdateEvent)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (ETB)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Update Event</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEvent?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default EventsPage;
