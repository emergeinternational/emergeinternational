
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useCurrency } from '@/hooks/useCurrency';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/hooks/useEvents';
import { Loader } from 'lucide-react';

const Events = () => {
  const { selectedCurrency, convertPrice } = useCurrency();
  const { data: events, isLoading, error } = useEvents();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-12 flex justify-center items-center min-h-[60vh]">
          <Loader className="h-8 w-8 animate-spin text-emerge-gold" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Error loading events</h2>
            <p className="mt-2 text-gray-600">Please try again later.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!events || events.length === 0) {
    return (
      <MainLayout>
        <div className="container py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold">Upcoming Events</h1>
            <CurrencySelector />
          </div>
          
          <div className="text-center py-12">
            <h2 className="text-xl font-medium">No events scheduled at this time</h2>
            <p className="mt-2 text-gray-600">Please check back later for upcoming events.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Upcoming Events</h1>
          <CurrencySelector />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
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
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Events;
