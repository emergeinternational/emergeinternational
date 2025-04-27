
import MainLayout from "@/layouts/MainLayout";
import { EventCard } from "@/components/events/EventCard";
import { EventsLoading } from "@/components/events/EventsLoading";
import { EventsError } from "@/components/events/EventsError";
import { useEvents } from "@/hooks/useEvents";
import { CurrencySelector } from "@/components/events/CurrencySelector";
import { useCurrencies } from "@/hooks/useCurrencies";

const Events = () => {
  const { data: events, isLoading, error } = useEvents();
  const { data: currencies, selectedCurrency, handleCurrencyChange } = useCurrencies();

  if (isLoading || !selectedCurrency) {
    return (
      <MainLayout>
        <div className="emerge-container py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-emerge-darkBg">Upcoming Events</h1>
          </div>
          <EventsLoading />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="emerge-container py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-emerge-darkBg">Upcoming Events</h1>
          </div>
          <EventsError error={error} />
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
          {events && events.length > 0 ? (
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
