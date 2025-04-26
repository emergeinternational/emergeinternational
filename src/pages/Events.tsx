
import MainLayout from "@/layouts/MainLayout";
import { Calendar, CalendarDays, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EventTicket {
  type: string;
  price: string;
  description: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  capacity?: number;
  price?: number;
  icon?: JSX.Element;
  tickets?: EventTicket[];
}

const Events = () => {
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Directly fetch from events table
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true })
          .gte('date', new Date().toISOString()); // Only get future events
        
        if (error) {
          throw error;
        }
        
        // Transform events with ticket information
        const eventsWithTickets: Event[] = (data || []).map(event => ({
          ...event,
          icon: getEventIcon(event.name),
          tickets: generateTicketsForEvent(event)
        }));
        
        setEvents(eventsWithTickets);
        console.log("Fetched events:", eventsWithTickets);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error loading events",
          description: "Could not load events. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [toast]);

  const getEventIcon = (name: string) => {
    if (name.toLowerCase().includes('workshop')) {
      return <CalendarDays size={24} className="text-emerge-gold" />;
    } else if (name.toLowerCase().includes('networking')) {
      return <CalendarPlus size={24} className="text-emerge-gold" />;
    } else {
      return <Calendar size={24} className="text-emerge-gold" />;
    }
  };

  const generateTicketsForEvent = (event: Event): EventTicket[] => {
    const defaultTickets: EventTicket[] = [
      { 
        type: "Standard", 
        price: event.price ? `ETB ${event.price}` : "ETB 1,000", 
        description: "Regular admission" 
      },
    ];

    // If event has a specific price set
    if (event.price) {
      // For premium events with higher prices, add VIP option
      if (event.price >= 1000) {
        defaultTickets.push({
          type: "VIP",
          price: `ETB ${Math.round(event.price * 1.5)}`,
          description: "Premium experience with special seating"
        });
      }
    }
    
    return defaultTickets;
  };

  const handleTicketSelect = (eventId: string, ticketType: string) => {
    setSelectedTickets(prev => ({
      ...prev,
      [eventId]: ticketType
    }));
  };

  const handleRegister = async (eventId: string) => {
    if (!selectedTickets[eventId]) {
      toast({
        title: "Please select a ticket type",
        description: "Choose your preferred ticket option before proceeding.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(prev => ({ ...prev, [eventId]: true }));

    try {
      const event = events.find(e => e.id === eventId);
      const selectedTicket = event?.tickets?.find(t => t.type === selectedTickets[eventId]);
      
      if (!event || !selectedTicket) {
        throw new Error("Invalid event or ticket selection");
      }

      const priceValue = parseInt(selectedTicket.price.replace("ETB ", ""), 10);

      navigate('/payment', {
        state: {
          amount: priceValue,
          description: `${event.name} - ${selectedTicket.type} Ticket`,
          eventId: eventId,
          ticketType: selectedTickets[eventId]
        }
      });

    } catch (error) {
      toast({
        title: "Processing Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="emerge-container py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-emerge-darkBg">Upcoming Events</h1>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-emerge-darkBg">Upcoming Events</h1>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? events.map((event) => (
            <Card 
              key={event.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openEventDetails(event)}
            >
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                {event.icon}
                <CardTitle className="text-xl">{event.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit' 
                    })}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    <p className="text-sm line-clamp-2">{event.description || "Join us for this exciting event!"}</p>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {event.capacity ? `${event.capacity} spots available` : "Limited spots available"}
                    </span>
                    <Button 
                      size="sm" 
                      className="bg-emerge-gold hover:bg-emerge-gold/90"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium mb-2">No events currently scheduled</h3>
              <p className="text-gray-500">Check back soon for new events</p>
            </div>
          )}
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEvent?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-3 text-gray-600">
              <p><strong>Date:</strong> {selectedEvent && new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit' 
              })}</p>
              <p><strong>Location:</strong> {selectedEvent?.location}</p>
              <p><strong>Available Spots:</strong> {selectedEvent?.spots || "Limited availability"}</p>
              <div className="pt-2">
                <p className="font-medium mb-1">Description:</p>
                <p>{selectedEvent?.description || "Join us for this exciting event hosted by Emerge International!"}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Select Ticket Type:</p>
              {selectedEvent && (
                <RadioGroup
                  value={selectedTickets[selectedEvent.id]}
                  onValueChange={(value) => handleTicketSelect(selectedEvent.id, value)}
                  className="gap-3"
                >
                  {selectedEvent.tickets.map((ticket) => (
                    <div key={ticket.type} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={ticket.type} id={`${selectedEvent.id}-${ticket.type}`} />
                      <div className="flex-1">
                        <label
                          htmlFor={`${selectedEvent.id}-${ticket.type}`}
                          className="font-medium cursor-pointer"
                        >
                          {ticket.type} - {ticket.price}
                        </label>
                        <p className="text-sm text-gray-500">{ticket.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                onClick={() => selectedEvent && handleRegister(selectedEvent.id)}
                disabled={selectedEvent && (isProcessing[selectedEvent.id] || !selectedTickets[selectedEvent.id])}
                size="lg" 
                className="bg-emerge-gold hover:bg-emerge-gold/90 w-full sm:w-auto"
              >
                {selectedEvent && isProcessing[selectedEvent.id] ? "Processing..." : "Register Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Events;
