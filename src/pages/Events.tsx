
import MainLayout from "@/layouts/MainLayout";
import { CalendarPlus, CalendarEvent, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Events = () => {
  const events = [
    {
      id: 1,
      name: "Emerge Addis Fashion Show",
      date: "June 12, 2025",
      time: "7:00 PM",
      location: "Addis Ababa Convention Center",
      description: "Annual fashion showcase featuring emerging Ethiopian designers",
      registrations: 45,
      icon: <CalendarEvent size={24} className="text-emerge-gold" />
    },
    {
      id: 2,
      name: "Designer Workshop",
      date: "July 8, 2025",
      time: "10:00 AM",
      location: "Emerge Creative Hub",
      description: "Intensive design and entrepreneurship workshop for young creatives",
      registrations: 23,
      icon: <CalendarDays size={24} className="text-emerge-gold" />
    },
    {
      id: 3,
      name: "International Fashion Networking",
      date: "August 15, 2025",
      time: "6:00 PM",
      location: "Hilton Hotel, Addis Ababa",
      description: "Exclusive networking event for fashion industry professionals",
      registrations: 35,
      icon: <CalendarPlus size={24} className="text-emerge-gold" />
    }
  ];

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
                <div className="space-y-2 text-gray-600">
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Time:</strong> {event.time}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p className="text-sm">{event.description}</p>
                  <div className="pt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {event.registrations} Registrations
                    </span>
                    <Button size="sm" className="bg-emerge-gold hover:bg-emerge-gold/90">
                      Register
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

