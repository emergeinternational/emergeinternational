import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, Ticket } from 'lucide-react';
import { EventDetails as EventDetailsComponent } from '@/components/events/EventDetails';
import { TicketSelector } from '@/components/events/TicketSelector';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        // Replace with your actual event fetching logic
        // This is a placeholder implementation
        const mockEvent = {
          id: eventId,
          name: "Fashion Showcase 2025",
          description: "Join us for the annual fashion showcase featuring emerging designers from across Africa.",
          date: new Date().toISOString(),
          location: "Addis Ababa Convention Center",
          image_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop",
          price: 250,
          currency_code: "ETB",
          status: "active",
          capacity: 200,
          tickets_sold: 120,
          organizer: "Emerge Fashion Academy"
        };
        
        setEvent(mockEvent);
      } catch (error) {
        console.error('Failed to fetch event details:', error);
        toast({
          title: "Error",
          description: "Could not load event details. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, toast]);
  
  const handleTicketSelect = (ticket: any) => {
    navigate(`/event-payment/${eventId}?ticket=${ticket.type}&price=${ticket.price}`);
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="emerge-container py-12">
          <div className="flex justify-center">
            <div className="animate-pulse text-emerge-gold">Loading event details...</div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!event) {
    return (
      <MainLayout>
        <div className="emerge-container py-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
                <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => navigate('/events')}>
                  View All Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EventDetailsComponent event={event} />
          </div>
          
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Get Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-emerge-gold" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-emerge-gold" />
                    <span>{new Date(event.date).toLocaleTimeString('en-US', { 
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-emerge-gold" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-emerge-gold" />
                    <span>{event.capacity - (event.tickets_sold || 0)} spots remaining</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <TicketSelector 
                    eventId={eventId || ''} 
                    onSelectTicket={handleTicketSelect}
                    defaultPrice={event.price}
                    currency={event.currency_code || 'ETB'}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EventDetails;
