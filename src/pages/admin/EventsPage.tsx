import { useQuery } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Event } from "@/hooks/useEvents";

const eventFormSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string(),
  date: z.string(),
  location: z.string(),
  capacity: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().positive().optional(),
});

const EventsPage = () => {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const canEdit = hasRole(['admin', 'editor']);

  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
    refetchOnWindowFocus: false,
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

  const handleAddEvent = async (values: z.infer<typeof eventFormSchema>) => {
    try {
      const { error } = await supabase
        .from('events')
        .insert([{
          name: values.name,
          description: values.description,
          date: new Date(values.date).toISOString(),
          location: values.location,
          capacity: values.capacity,
          price: values.price,
        }]);

      if (error) throw error;

      toast({
        title: "Event Added",
        description: "The event has been created successfully.",
      });
      
      eventForm.reset();
      refetch();
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
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
                  <form onSubmit={eventForm.handleSubmit(handleAddEvent)} className="space-y-4">
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
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600 text-sm mt-2">{event.description}</p>
                <div className="mt-4">
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Capacity:</strong> {event.capacity || 'Not specified'}</p>
                  <p><strong>Price:</strong> {event.price ? `ETB ${event.price}` : 'Free'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EventsPage;
