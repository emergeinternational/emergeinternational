
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
  const { currencies, selectedCurrency, setSelectedCurrency } = useCurrency();

  return (
    <Select 
      value={selectedCurrency?.code} 
      onValueChange={(currencyCode) => {
        const currency = currencies.find(c => c.code === currencyCode);
        if (currency) setSelectedCurrency(currency);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map(currency => (
          <SelectItem key={currency.id} value={currency.code}>
            {currency.code} - {currency.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
