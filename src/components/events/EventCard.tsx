
import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '@/hooks/useEvents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/hooks/useCurrency';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { selectedCurrency, convertPrice } = useCurrency();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-xl font-medium mb-2">{event.name}</h3>
        <p className="text-gray-600 mb-4">{event.description}</p>
        <div className="space-y-2 mb-4">
          <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
          {event.location && (
            <p><strong>Location:</strong> {event.location}</p>
          )}
          {event.price !== undefined && (
            <p className="text-lg font-semibold">
              <strong>Price:</strong> {selectedCurrency?.symbol} 
              {convertPrice(event.price).toFixed(2)}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Link to={`/event-payment/${event.id}`}>
            <Button>Buy Tickets</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
