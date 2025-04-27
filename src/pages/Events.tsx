
import { useCurrency } from '@/hooks/useCurrency';
import { CurrencySelector } from '@/components/CurrencySelector';

const Events = () => {
  const { selectedCurrency, convertPrice } = useCurrency();

  // Modify event rendering to use convertPrice
  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-emerge-darkBg">Upcoming Events</h1>
          <CurrencySelector />
        </div>
        
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent>
              <p>
                <strong>Price:</strong> 
                {selectedCurrency?.symbol} 
                {convertPrice(event.price).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};
