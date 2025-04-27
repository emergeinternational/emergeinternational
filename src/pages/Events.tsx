
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useCurrency } from '@/hooks/useCurrency';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/hooks/useEvents';
import { CalendarDays, MapPin } from 'lucide-react';

const Events = () => {
  const { selectedCurrency, convertPrice } = useCurrency();
  const { data: events, isLoading, error } = useEvents();

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Upcoming Events</h1>
          <CurrencySelector />
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-40 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 animate-pulse mb-3 w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse mb-4 w-full"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 animate-pulse w-1/2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse w-2/3"></div>
                    <div className="h-5 bg-gray-200 animate-pulse w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-red-50 rounded-lg">
            <p className="text-red-500">Error loading events. Please try again later.</p>
          </div>
        ) : events?.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No upcoming events at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="h-40 bg-emerge-cream flex items-center justify-center">
                  {event.image_url ? (
                    <img 
                      src={event.image_url} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <h3 className="text-xl font-medium px-4 text-center">{event.name}</h3>
                  )}
                </div>
                <CardContent className="p-6">
                  {event.image_url && <h3 className="text-xl font-medium mb-2">{event.name}</h3>}
                  {event.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  )}
                  <div className="space-y-2 mb-4">
                    <p className="flex items-center text-gray-600">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </p>
                    {event.location && (
                      <p className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.location}</span>
                      </p>
                    )}
                    {event.ticket_types && event.ticket_types.length > 0 && (
                      <p className="text-lg font-semibold mt-2">
                        <span>From {selectedCurrency?.symbol} </span>
                        {convertPrice(Math.min(...event.ticket_types.map(t => t.price))).toFixed(2)}
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
        )}
      </div>
    </MainLayout>
  );
};

export default Events;
