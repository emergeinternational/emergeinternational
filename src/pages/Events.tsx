
import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { EventWithTickets, fetchEvents } from "@/services/eventService";
import { Currency, fetchCurrencies } from "@/services/currencyService";
import { CurrencySelector } from "@/components/events/CurrencySelector";
import { EventCard } from "@/components/events/EventCard";

const Events = () => {
  const [events, setEvents] = useState<EventWithTickets[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const { toast } = useToast();

  // Fetch events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await fetchEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error loading events",
          description: "Could not load events. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [toast]);

  // Fetch currencies
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencyData = await fetchCurrencies();
        setCurrencies(currencyData);
        
        // Set default currency to ETB
        const defaultCurrency = currencyData.find(c => c.code === "ETB") || currencyData[0];
        setSelectedCurrency(defaultCurrency);
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    };
    
    loadCurrencies();
  }, []);

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  if (loading || !selectedCurrency) {
    return (
      <MainLayout>
        <div className="emerge-container py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-emerge-darkBg">Upcoming Events</h1>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-t-lg"></div>
                <div className="p-4 border border-t-0 rounded-b-lg space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-semibold text-emerge-darkBg">Upcoming Events</h1>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Display prices in:</span>
            <CurrencySelector
              currencies={currencies}
              selectedCurrency={selectedCurrency}
              onCurrencyChange={handleCurrencyChange}
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                selectedCurrency={selectedCurrency}
                currencies={currencies}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium mb-2">No events currently scheduled</h3>
              <p className="text-gray-500">Check back soon for new events</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Events;
