import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, Edit, Trash2, CheckCircle, XCircle, Eye } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventRegistrations, updateRegistrationStatus } from "@/services/workshopService";

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
      try {
        const mockEvents = [
          {
            id: '1',
            name: "Emerge Addis Fashion Show",
            description: "Annual fashion show featuring local designers",
            date: new Date("2025-06-12").toISOString(),
            location: "Addis Ababa Exhibition Center",
            capacity: 200,
            price: 500
          },
          {
            id: '2',
            name: "Designer Workshop",
            description: "Workshop for aspiring fashion designers",
            date: new Date("2025-07-08").toISOString(),
            location: "Emerge Headquarters",
            capacity: 50,
            price: 300
          }
        ];

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });

        if (error) {
          console.error("Supabase error:", error);
          return mockEvents;
        }
        
        return data && data.length > 0 ? data : mockEvents;
      } catch (err) {
        console.error("Error fetching events:", err);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  const { 
    data: registrations, 
    isLoading: registrationsLoading, 
    refetch: refetchRegistrations 
  } = useQuery({
    queryKey: ['admin', 'event_registrations'],
    queryFn: getEventRegistrations,
    refetchOnWindowFocus: false,
    staleTime: 30000,
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

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      });
      
      refetch();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRegistrationStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateRegistrationStatus(id, status);
      
      toast({
        title: status === 'approved' ? "Registration Approved" : "Registration Rejected",
        description: `The registration has been ${status} successfully.`,
      });
      
      refetchRegistrations();
    } catch (error) {
      console.error("Error updating registration status:", error);
      toast({
        title: "Error",
        description: "Failed to update registration status. Please try again.",
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
        <Tabs defaultValue="events">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Events Management</h1>
              <TabsList className="mt-2">
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="registrations">Registrations</TabsTrigger>
              </TabsList>
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

          <TabsContent value="events" className="space-y-4">
            {!events || events.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 mb-4">No events found</p>
                {canEdit && <p className="text-sm">Add your first event using the button above.</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{event.name}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      {canEdit && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                    <div className="space-y-2 text-sm">
                      <p><strong>Location:</strong> {event.location}</p>
                      <p><strong>Capacity:</strong> {event.capacity || 'Not specified'}</p>
                      <p><strong>Price:</strong> {event.price ? `ETB ${event.price}` : 'Free'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="registrations">
            {registrationsLoading ? (
              <div className="py-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-gray-100 h-16 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : !registrations || registrations.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 mb-4">No registrations found</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <li key={registration.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {registration.profiles?.full_name || 'Unnamed User'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {registration.profiles?.email}
                              </p>
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <span className="mr-2">Event:</span>
                                <span className="font-medium">{registration.events?.name}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {registration.ticket_type} · ETB {registration.amount}
                              </p>
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                  ${registration.payment_status === 'approved' ? 'bg-green-100 text-green-800' : 
                                  registration.payment_status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'}`}
                                >
                                  {registration.payment_status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex ml-4 space-x-2">
                          {registration.payment_proof_url && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye size={16} className="mr-1" /> 
                                  View Proof
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Payment Proof</DialogTitle>
                                  <DialogDescription>
                                    Uploaded by {registration.profiles?.full_name || 'User'} for {registration.events?.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center justify-center py-4">
                                  <img 
                                    src={registration.payment_proof_url} 
                                    alt="Payment Proof" 
                                    className="max-w-full max-h-96 object-contain rounded"
                                  />
                                </div>
                                <DialogFooter className="flex justify-between space-x-2">
                                  {registration.payment_status !== 'approved' && (
                                    <Button 
                                      variant="default"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleUpdateRegistrationStatus(registration.id, 'approved')}
                                    >
                                      <CheckCircle size={16} className="mr-1" /> Approve
                                    </Button>
                                  )}
                                  {registration.payment_status !== 'rejected' && (
                                    <Button 
                                      variant="destructive"
                                      onClick={() => handleUpdateRegistrationStatus(registration.id, 'rejected')}
                                    >
                                      <XCircle size={16} className="mr-1" /> Reject
                                    </Button>
                                  )}
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {registration.payment_status === 'pending' && (
                            <>
                              <Button 
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleUpdateRegistrationStatus(registration.id, 'approved')}
                              >
                                <CheckCircle size={16} />
                              </Button>
                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUpdateRegistrationStatus(registration.id, 'rejected')}
                              >
                                <XCircle size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EventsPage;
