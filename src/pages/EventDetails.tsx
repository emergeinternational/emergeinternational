
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  benefits: string[];
  quantity: number;
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEventDetails(id);
      fetchTicketTypes(id);
    }
  }, [id]);

  const fetchEventDetails = async (eventId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      if (!data) {
        toast({
          title: "Event not found",
          description: "The event you're looking for doesn't exist or has been removed.",
          variant: "destructive",
        });
        navigate('/events');
        return;
      }

      setEvent(data);
    } catch (error: any) {
      toast({
        title: "Error loading event",
        description: error.message || "Failed to load event details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketTypes = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .order('price', { ascending: true });

      if (error) throw error;
      setTicketTypes(data || []);
      
      // Set default selected ticket if available
      if (data && data.length > 0) {
        setSelectedTicket(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching ticket types:', error);
    }
  };

  const handleSelectTicket = (ticket: TicketType) => {
    setSelectedTicket(ticket.id);
  };

  const handleRegister = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for this event",
        variant: "default",
      });
      navigate('/login', { state: { from: `/event-details/${id}` } });
      return;
    }

    if (!selectedTicket) {
      toast({
        title: "No ticket selected",
        description: "Please select a ticket type to continue",
        variant: "default",
      });
      return;
    }

    const selectedTicketDetails = ticketTypes.find(ticket => ticket.id === selectedTicket);
    
    // Navigate to payment page with ticket details
    navigate(`/event-payment/${id}`, {
      state: {
        ticketType: selectedTicketDetails?.name,
        ticketPrice: selectedTicketDetails?.price,
        eventName: event?.name,
        eventDate: event?.date
      }
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="emerge-container py-12 text-center">
          <p>Loading event details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="emerge-container py-12 text-center">
          <p>Event not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="emerge-container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{event.name}</h1>
          
          <div className="mb-8">
            <img 
              src={event.image_url || "/placeholder.svg"}
              alt={event.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                <p className="text-gray-700">{event.description || "No description provided."}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Date & Time:</span>
                    <p className="text-gray-700">
                      {new Date(event.date).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <p className="text-gray-700">{event.location}</p>
                  </div>
                  {event.capacity && (
                    <div>
                      <span className="font-medium">Capacity:</span>
                      <p className="text-gray-700">{event.capacity} attendees</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Tickets</h2>
                {ticketTypes.length > 0 ? (
                  <div className="space-y-4">
                    {ticketTypes.map(ticket => (
                      <div 
                        key={ticket.id}
                        onClick={() => handleSelectTicket(ticket)}
                        className={`border rounded-lg p-4 cursor-pointer ${
                          selectedTicket === ticket.id 
                            ? 'border-emerge-gold bg-amber-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{ticket.name}</h3>
                          <span className="font-bold text-emerge-gold">
                            {event.currency_code || 'ETB'} {ticket.price.toLocaleString()}
                          </span>
                        </div>
                        {ticket.description && (
                          <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                        )}
                        {ticket.benefits && ticket.benefits.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Includes:</span>
                            <ul className="text-xs text-gray-500 list-disc list-inside">
                              {ticket.benefits.map((benefit, idx) => (
                                <li key={idx}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <button
                      onClick={handleRegister}
                      disabled={!selectedTicket}
                      className="w-full bg-emerge-gold text-black font-medium py-2 px-4 rounded hover:bg-emerge-gold/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Register Now
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">No tickets available for this event.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EventDetails;
