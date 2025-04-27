
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Edit, Trash2, Plus, Loader } from "lucide-react";
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
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Event, TicketType } from "@/hooks/useEvents";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  CreateEventPayload,
  UpdateEventPayload
} from "@/services/eventService";
import { Badge } from "@/components/ui/badge";

// Schema for ticket types
const ticketTypeSchema = z.object({
  name: z.string().min(1, "Ticket name is required"),
  price: z.coerce.number().min(0, "Price must be zero or greater"),
  description: z.string().optional(),
  quantity: z.coerce.number().int().positive("Quantity must be a positive number"),
  benefits: z.array(z.string()).optional()
});

// Schema for creating/editing an event
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

  // Query for fetching all events
  const { 
    data: events, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: getEvents,
    refetchOnWindowFocus: false,
  });

  // Form for creating/editing events
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

  // Field array for ticket types
  const { fields, append, remove } = useFieldArray({
    control: eventForm.control,
    name: "ticketTypes"
  });

  // Mutation for creating an event
  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventPayload) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast({
        title: "Event created",
        description: "The event has been created successfully.",
      });
      eventForm.reset();
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

  // Mutation for updating an event
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

  // Mutation for deleting an event
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

  // Handle form submission for creating/editing an event
  const handleSubmitEvent = async (values: EventFormValues) => {
    if (isEditMode && currentEvent) {
      // Update existing event
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
      // Create new event
      createEventMutation.mutate({
        ...values,
        ticket_types: values.ticketTypes?.map(ticket => ({
          name: ticket.name,
          price: ticket.price,
          description: ticket.description,
          quantity: ticket.quantity,
          benefits: ticket.benefits
        }))
      });
    }
  };

  // Setup edit mode with current event data
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
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete.id);
    }
  };

  // Confirm deletion
  const confirmDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  // Reset form when closing the dialog
  const handleDialogClose = () => {
    if (!createEventMutation.isPending && !updateEventMutation.isPending) {
      eventForm.reset();
      setIsEditMode(false);
      setCurrentEvent(null);
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
            <Dialog onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "Edit Event" : "Create New Event"}</DialogTitle>
                </DialogHeader>
                <Form {...eventForm}>
                  <form onSubmit={eventForm.handleSubmit(handleSubmitEvent)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={eventForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter event name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date*</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={eventForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Event description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={eventForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Event location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="Event category" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={eventForm.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacity</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Event capacity" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="max_tickets"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Tickets</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Maximum ticket limit" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={eventForm.control}
                        name="image_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="Image URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="currency_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency Code</FormLabel>
                            <FormControl>
                              <Input placeholder="ETB" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={eventForm.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                          <FormLabel>Feature this event</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!isEditMode && (
                      <>
                        <div className="border-t mt-6 pt-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Ticket Types</h3>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => append({ 
                                name: "", 
                                price: 0, 
                                description: "", 
                                quantity: 1,
                                benefits: [] 
                              })}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add Ticket Type
                            </Button>
                          </div>

                          {fields.map((field, index) => (
                            <div key={field.id} className="border rounded-md p-4 mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Ticket Type {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                <FormField
                                  control={eventForm.control}
                                  name={`ticketTypes.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Name*</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Ticket name" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={eventForm.control}
                                  name={`ticketTypes.${index}.price`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Price*</FormLabel>
                                      <FormControl>
                                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={eventForm.control}
                                name={`ticketTypes.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder="Ticket description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={eventForm.control}
                                name={`ticketTypes.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem className="mt-2">
                                    <FormLabel>Quantity*</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          ))}

                          {fields.length === 0 && (
                            <div className="text-center py-4 bg-gray-50 rounded-md">
                              <p className="text-gray-500">No ticket types added yet</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => append({ 
                                  name: "", 
                                  price: 0, 
                                  description: "", 
                                  quantity: 1,
                                  benefits: [] 
                                })}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add Ticket Type
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <DialogFooter className="mt-6">
                      <Button type="submit" disabled={createEventMutation.isPending || updateEventMutation.isPending}>
                        {(createEventMutation.isPending || updateEventMutation.isPending) ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            {isEditMode ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          isEditMode ? "Update Event" : "Create Event"
                        )}
                      </Button>
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
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tickets</TableHead>
                  {canEdit && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <div>
                        {event.name}
                        {event.is_featured && (
                          <Badge variant="secondary" className="ml-2">Featured</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {event.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>{event.location || "—"}</TableCell>
                    <TableCell>
                      {new Date(event.date) > new Date() ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                          Upcoming
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Past</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{event.ticket_types?.length || 0} types</span>
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="tickets">
                            <AccordionTrigger className="py-1 text-xs text-gray-500">
                              View tickets
                            </AccordionTrigger>
                            <AccordionContent>
                              {event.ticket_types && event.ticket_types.length > 0 ? (
                                <div className="space-y-2">
                                  {event.ticket_types.map((ticket) => (
                                    <div key={ticket.id} className="border-b pb-1 last:border-0">
                                      <div className="flex justify-between text-sm">
                                        <span>{ticket.name}</span>
                                        <span className="font-medium">{event.currency_code} {ticket.price}</span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {ticket.tickets_sold || 0}/{ticket.quantity} sold
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 py-1">No tickets defined</div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditEvent(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => confirmDeleteEvent(event)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4">
            <p>Are you sure you want to delete <strong>{eventToDelete?.name}</strong>?</p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone. All associated tickets and registrations will be permanently removed.
            </p>
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEvent}
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default EventsPage;
