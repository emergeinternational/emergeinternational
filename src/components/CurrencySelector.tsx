
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useCurrency } from '@/hooks/useCurrency';

export const CurrencySelector = () => {
  const { currencies, selectedCurrency, setSelectedCurrency, isLoading } = useCurrency();

  if (isLoading) {
    return <div className="w-[180px] h-10 bg-gray-100 animate-pulse rounded-md" />;
  }

  return (
    <Select 
      value={selectedCurrency?.code || "default"} 
      onValueChange={(currencyCode) => {
        const currency = currencies.find(c => c.code === currencyCode);
        if (currency) setSelectedCurrency(currency);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Currency">
          {selectedCurrency ? `${selectedCurrency.code} (${selectedCurrency.symbol})` : 'Select Currency'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {currencies.map(currency => (
          <SelectItem key={currency.id} value={currency.code || "default"}>
            {currency.code} - {currency.symbol} {currency.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
