
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Currency, fetchCurrencies } from "@/services/currencyService";

export const useCurrencies = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  
  const { data: currencies = [] } = useQuery<Currency[]>({
    queryKey: ['currencies'],
    queryFn: fetchCurrencies,
    staleTime: 300000, // Cache for 5 minutes
  });

  useEffect(() => {
    // Set default currency to ETB or first available
    if (currencies.length > 0 && !selectedCurrency) {
      const defaultCurrency = currencies.find(c => c.code === "ETB") || currencies[0];
      setSelectedCurrency(defaultCurrency);
    }
  }, [currencies, selectedCurrency]);

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  return {
    data: currencies,
    selectedCurrency,
    handleCurrencyChange
  };
};
