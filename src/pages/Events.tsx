
import MainLayout from "@/layouts/MainLayout";
import { CalendarPlus, Calendar, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Events = () => {
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();

  const events = [
    {
      id: 1,
      name: "Emerge Addis Fashion Show",
      date: "June 12, 2025",
      time: "7:00 PM",
      location: "Addis Ababa Convention Center",
      description: "Annual fashion showcase featuring emerging Ethiopian designers",
      registrations: 45,
      icon: <Calendar size={24} className="text-emerge-gold" />,
      tickets: [
        { type: "Standard", price: "ETB 1,000", description: "Regular seating" },
        { type: "VIP", price: "ETB 2,500", description: "Premium seating + cocktail reception" },
        { type: "VVIP", price: "ETB 5,000", description: "Front row + meet & greet with designers" }
      ]
    },
    {
      id: 2,
      name: "Designer Workshop",
      date: "July 8, 2025",
      time: "10:00 AM",
      location: "Emerge Creative Hub",
      description: "Intensive design and entrepreneurship workshop for young creatives",
      registrations: 23,
      icon: <CalendarDays size={24} className="text-emerge-gold" />,
      tickets: [
        { type: "Early Bird", price: "ETB 800", description: "Limited availability" },
        { type: "Regular", price: "ETB 1,200", description: "Standard admission" },
        { type: "Group (3+)", price: "ETB 1,000", description: "Per person for groups" }
      ]
    },
    {
      id: 3,
      name: "International Fashion Networking",
      date: "August 15, 2025",
      time: "6:00 PM",
      location: "Hilton Hotel, Addis Ababa",
      description: "Exclusive networking event for fashion industry professionals",
      registrations: 35,
      icon: <CalendarPlus size={24} className="text-emerge-gold" />,
      tickets: [
        { type: "Professional", price: "ETB 1,500", description: "Industry professionals" },
        { type: "Student", price: "ETB 750", description: "Valid student ID required" },
        { type: "Corporate", price: "ETB 3,000", description: "Includes business matchmaking" }
      ]
    }
  ];

  const handleTicketSelect = (eventId: number, ticketType: string) => {
    setSelectedTickets(prev => ({
      ...prev,
      [eventId]: ticketType
    }));
  };

  const handleRegister = (eventId: number) => {
    if (!selectedTickets[eventId]) {
      toast({
        title: "Please select a ticket type",
        description: "Choose your preferred ticket option before proceeding.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Proceeding to payment",
      description: `Selected ${selectedTickets[eventId]} ticket`
    });
    // Will integrate with payment system later
  };

  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-emerge-darkBg">Upcoming Events</h1>
          <Button variant="outline" className="flex items-center space-x-2 border-emerge-gold text-emerge-gold hover:bg-emerge-gold/10">
            <CalendarPlus size={18} />
            <span>Create Event</span>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                {event.icon}
                <CardTitle className="text-xl">{event.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Date:</strong> {event.date}</p>
                    <p><strong>Time:</strong> {event.time}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    <p className="text-sm">{event.description}</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Select Ticket Type:</p>
                    <RadioGroup
                      value={selectedTickets[event.id]}
                      onValueChange={(value) => handleTicketSelect(event.id, value)}
                      className="gap-3"
                    >
                      {event.tickets.map((ticket) => (
                        <div key={ticket.type} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={ticket.type} id={`${event.id}-${ticket.type}`} />
                          <div className="flex-1">
                            <label
                              htmlFor={`${event.id}-${ticket.type}`}
                              className="font-medium cursor-pointer"
                            >
                              {ticket.type} - {ticket.price}
                            </label>
                            <p className="text-sm text-gray-500">{ticket.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {event.registrations} Registrations
                    </span>
                    <Button 
                      onClick={() => handleRegister(event.id)}
                      size="sm" 
                      className="bg-emerge-gold hover:bg-emerge-gold/90"
                    >
                      Register Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Events;
