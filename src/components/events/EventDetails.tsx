import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";
import { Event } from '@/hooks/useEvents';

interface EventDetailsProps {
  event: Event;
}

export const EventDetails: React.FC<EventDetailsProps> = ({ event }) => {
  const { selectedCurrency, convertPrice } = useCurrency();
  const eventDate = new Date(event.date);
  
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Helper function to safely convert and format price
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) {
      return 'Free';
    }
    
    try {
      const converted = convertPrice(price);
      return `${selectedCurrency?.symbol || ''} ${converted.toFixed(2)}`;
    } catch (error) {
      console.error('Error converting price:', error);
      return `${selectedCurrency?.symbol || ''} ${price.toFixed(2)}`;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-emerge-cream h-48 flex items-center justify-center">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <h2 className="text-2xl font-bold text-center px-4">{event.name}</h2>
        )}
        {event.is_featured && (
          <Badge 
            variant="secondary" 
            className="absolute top-4 right-4 bg-emerge-gold text-black"
          >
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-6">
        {!event.image_url && <h2 className="text-2xl font-bold mb-4">{event.name}</h2>}
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">{formattedDate}</p>
                <p className="font-medium">{formattedTime}</p>
              </div>
              {event.location && (
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              )}
            </div>
          </div>

          {event.price !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Starting Price</p>
              <p className="font-bold text-lg">
                {formatPrice(event.price)}
              </p>
            </div>
          )}

          {event.description && (
            <div>
              <h3 className="font-semibold text-lg">Description</h3>
              <div className="mt-2 text-gray-700 whitespace-pre-wrap">
                {event.description}
              </div>
            </div>
          )}

          {event.ticket_types && event.ticket_types.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg">What You'll Get</h3>
              {event.ticket_types.map((ticket) => (
                <div key={ticket.id} className="mt-4">
                  <h4 className="font-medium">{ticket.name}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ticket.benefits?.map((benefit, index) => (
                      <Badge key={index} variant="secondary">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
