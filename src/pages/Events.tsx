
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useCurrency } from '@/hooks/useCurrency';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Card, CardContent } from '@/components/ui/card';

// Mock events data - this would typically come from an API or prop
const eventsList = [
  {
    id: '1',
    name: 'Emerge Fashion Show',
    date: '2025-05-15',
    location: 'Addis Ababa Exhibition Center',
    description: 'Annual fashion showcase featuring local designers',
    price: 500
  },
  {
    id: '2',
    name: 'Design Workshop',
    date: '2025-06-20',
    location: 'Emerge Headquarters',
    description: 'Workshop for aspiring fashion designers',
    price: 300
  }
];

const Events = () => {
  const { selectedCurrency, convertPrice } = useCurrency();

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Upcoming Events</h1>
          <CurrencySelector />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventsList.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-2">{event.name}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="space-y-2">
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p className="text-lg font-semibold">
                    <strong>Price:</strong> {selectedCurrency?.symbol} 
                    {convertPrice(event.price).toFixed(2)}
                  </p>
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
