
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchange_rate: number;
}

export const useCurrency = () => {
  const { toast } = useToast();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('currencies')
          .select('*')
          .eq('is_active', true);

        if (error) {
          throw error;
        }

        if (data) {
          setCurrencies(data);
          // Try to get previously selected currency from localStorage
          const savedCurrencyCode = localStorage.getItem('selectedCurrency');
          const defaultCurrency = savedCurrencyCode 
            ? data.find(c => c.code === savedCurrencyCode)
            : data.find(c => c.code === 'ETB') || data[0];
          
          setSelectedCurrency(defaultCurrency);
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
        toast({
          title: "Error loading currencies",
          description: "Using default currency (ETB) for now. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, [toast]);

  const updateSelectedCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem('selectedCurrency', currency.code);
  };

  const convertPrice = (basePrice: number, fromCurrency: string = 'ETB'): number => {
    try {
      if (!selectedCurrency || !currencies.length) return basePrice;

      const fromRate = currencies.find(c => c.code === fromCurrency)?.exchange_rate || 1;
      const toRate = selectedCurrency.exchange_rate;

      if (!fromRate || !toRate) {
        console.error('Invalid exchange rates:', { fromRate, toRate });
        return basePrice;
      }

      return (basePrice / fromRate) * toRate;
    } catch (error) {
      console.error('Error converting price:', error);
      return basePrice;
    }
  };

  return {
    currencies,
    selectedCurrency,
    setSelectedCurrency: updateSelectedCurrency,
    convertPrice,
    isLoading
  };
};
