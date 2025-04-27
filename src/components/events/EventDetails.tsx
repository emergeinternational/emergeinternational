
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";

interface EventDetailsProps {
  event: {
    name: string;
    description?: string;
    date: string;
    location?: string;
    price?: number;
  };
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

  return (
    <Card className="overflow-hidden">
      <div className="bg-emerge-cream h-48 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-center px-4">{event.name}</h2>
      </div>
      <CardContent className="p-6">
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
                {selectedCurrency?.symbol} {convertPrice(event.price).toFixed(2)}
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

          <div>
            <h3 className="font-semibold text-lg">What You'll Get</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">Event Access</Badge>
              <Badge variant="secondary">Networking</Badge>
              <Badge variant="secondary">Certificate</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
