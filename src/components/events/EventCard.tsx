import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventWithTickets } from "@/services/eventService";
import { Currency, formatCurrency } from "@/services/currencyService";

interface EventCardProps {
  event: EventWithTickets;
  selectedCurrency: Currency;
  currencies: Currency[];
}

export const EventCard = ({ event, selectedCurrency, currencies }: EventCardProps) => {
  const navigate = useNavigate();
  const hasTickets = event.tickets && event.tickets.length > 0;
  
  // Get the lowest price from available tickets with fallback to 0
  const lowestPrice = hasTickets
    ? Math.min(...event.tickets.map(ticket => ticket.price))
    : 0;
  
  // Convert price to selected currency
  const convertPrice = (price: number): number => {
    if (selectedCurrency.code === event.currency_code) return price;
    
    const baseRate = currencies.find(c => c.code === event.currency_code)?.exchange_rate || 1;
    const targetRate = selectedCurrency.exchange_rate;
    
    return (price / baseRate) * targetRate;
  };
  
  const price = convertPrice(lowestPrice);
  const formattedPrice = formatCurrency(price, selectedCurrency.code, currencies);
  const eventDate = new Date(event.date);
  
  // Calculate total available tickets with validation
  const totalAvailable = hasTickets ? 
    event.tickets.reduce((sum, ticket) => {
      const available = ticket.available_quantity || 0;
      const sold = ticket.sold_quantity || 0;
      return sum + Math.max(0, available - sold);
    }, 0) : 
    (event.capacity || 0);
  
  const handleViewDetails = () => {
    navigate(`/events/${event.id}`);
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Calendar size={24} className="text-emerge-gold" />
        <CardTitle className="text-xl line-clamp-2">
          {event.name || "Untitled Event"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="space-y-2 text-gray-600">
            <p>
              <strong>Date:</strong> {format(eventDate, "EEEE, MMMM d, yyyy")}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {event.start_time ? format(new Date(`2000-01-01T${event.start_time}`), "h:mm a") : "TBA"}
              {event.end_time ? ` - ${format(new Date(`2000-01-01T${event.end_time}`), "h:mm a")}` : ""}
            </p>
            <p>
              <strong>Location:</strong> {event.location || "Location TBA"}
            </p>
            {event.organizer && (
              <p>
                <strong>Organizer:</strong> {event.organizer}
              </p>
            )}
            {event.description && (
              <p className="text-sm line-clamp-2 mt-2">{event.description}</p>
            )}
          </div>

          <div className="pt-2 flex justify-between items-center mt-auto">
            <span className="text-sm text-gray-500">
              {totalAvailable > 0 
                ? `${totalAvailable} ${totalAvailable === 1 ? 'spot' : 'spots'} available` 
                : "Sold out"}
            </span>
            <div>
              {hasTickets && (
                <div className="text-right mb-2">
                  <span className="font-semibold">From {formattedPrice}</span>
                </div>
              )}
              <Button 
                size="sm" 
                className="bg-emerge-gold hover:bg-emerge-gold/90"
                onClick={handleViewDetails}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
