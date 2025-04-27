
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Currency } from "@/services/currencyService";

interface CurrencySelectorProps {
  currencies: Currency[];
  selectedCurrency: Currency | null;
  onCurrencyChange: (currency: Currency) => void;
}

export const CurrencySelector = ({ 
  currencies, 
  selectedCurrency, 
  onCurrencyChange 
}: CurrencySelectorProps) => {
  const [open, setOpen] = useState(false);

  if (!currencies.length || !selectedCurrency) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[120px] justify-between"
        >
          {selectedCurrency.code}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search currencies..." />
          <CommandEmpty>No currency found.</CommandEmpty>
          <CommandGroup>
            {currencies.map((currency) => (
              <CommandItem
                key={currency.code}
                value={currency.code}
                onSelect={() => {
                  onCurrencyChange(currency);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCurrency.code === currency.code ? "opacity-100" : "opacity-0"
                  )}
                />
                {currency.code} - {currency.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
