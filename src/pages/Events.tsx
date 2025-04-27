
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useCurrency } from '@/hooks/useCurrency';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Loader } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/events/EventCard';
import { Event as ServiceEvent } from '@/services/events/types';

const Events = () => {
  const { selectedCurrency } = useCurrency();
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
            <EventCard key={event.id} event={event as unknown as ServiceEvent} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Events;
