
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { EventDetails } from '@/components/events/EventDetails';
import { TicketSelector } from '@/components/events/TicketSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TicketType } from '@/hooks/useEvents';

const EventPayment = () => {
  const { eventId } = useParams();
  const { selectedCurrency } = useCurrency();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        const { data: ticketData, error: ticketError } = await supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', eventId);

        if (ticketError) throw ticketError;
        
        setEvent(eventData);
        
        // Transform ticket data to match our TicketType interface
        const transformedTickets = ticketData.map(ticket => ({
          ...ticket,
          name: ticket.name, // Make sure we're mapping the right property
          available_quantity: Math.max(0, ticket.quantity - (ticket.tickets_sold || 0))
        }));
        
        setTicketTypes(transformedTickets);
        
        if (transformedTickets.length > 0) {
          setSelectedTicket(transformedTickets[0]);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, toast]);

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase tickets",
        variant: "destructive"
      });
      // Redirect to login page with return URL
      navigate('/login?redirect=' + encodeURIComponent(`/event-payment/${eventId}`));
      return;
    }

    if (!selectedTicket) {
      toast({
        title: "No Ticket Selected",
        description: "Please select a ticket type",
        variant: "destructive"
      });
      return;
    }

    // Here you would process the purchase or redirect to a payment page
    toast({
      title: "Purchase Initiated",
      description: `Processing purchase for ${quantity} ${selectedTicket.name} ticket(s)`,
    });
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-gray-100 animate-pulse h-96 rounded-lg"></div>
            ) : event ? (
              <EventDetails event={event} />
            ) : (
              <div className="bg-red-50 p-6 rounded-lg">
                <p className="text-red-500">Event not found</p>
              </div>
            )}
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Select Tickets</h2>
              
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : ticketTypes.length > 0 ? (
                <>
                  <TicketSelector
                    tickets={ticketTypes}
                    selectedTicket={selectedTicket}
                    onSelectTicket={setSelectedTicket}
                    currency={selectedCurrency}
                  />
                  
                  <div className="mt-6">
                    <div className="flex justify-between py-2 border-t border-b my-4">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">
                        {selectedCurrency?.symbol} {selectedTicket ? 
                          (selectedCurrency?.exchange_rate * selectedTicket.price).toFixed(2) : "0.00"}
                      </span>
                    </div>
                    
                    <Button 
                      className="w-full mt-2" 
                      onClick={handlePurchase}
                      disabled={!selectedTicket || selectedTicket.available_quantity < 1}
                    >
                      Purchase Ticket
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">No tickets available for this event</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EventPayment;
