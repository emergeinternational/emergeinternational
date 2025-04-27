
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchange_rate: number;
}

export const useCurrency = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .eq('is_active', true);

      if (data) {
        setCurrencies(data);
        // Default to ETB if available, otherwise first active currency
        const defaultCurrency = data.find(c => c.code === 'ETB') || data[0];
        setSelectedCurrency(defaultCurrency);
      }

      if (error) {
        console.error('Error fetching currencies:', error);
      }
    };

    fetchCurrency();
  }, []);

  const convertPrice = (basePrice: number, fromCurrency: string = 'ETB') => {
    if (!selectedCurrency) return basePrice;

    const fromRate = currencies.find(c => c.code === fromCurrency)?.exchange_rate || 1;
    const toRate = selectedCurrency.exchange_rate;

    return (basePrice / fromRate) * toRate;
  };

  return {
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    convertPrice
  };
};
