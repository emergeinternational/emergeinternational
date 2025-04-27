import { supabase } from "@/integrations/supabase/client";

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_active: boolean;
}

export const fetchCurrencies = async (): Promise<Currency[]> => {
  try {
    const { data, error } = await supabase
      .from("currencies")
      .select()
      .eq('is_active', true)
      .order('code');

    if (error) {
      console.error("Error fetching currencies:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in fetchCurrencies:", error);
    return [];
  }
};

export const convertCurrency = (amount: number, fromRate: number, toRate: number): number => {
  if (!fromRate || !toRate) return amount;
  return (amount / fromRate) * toRate;
};

export const formatCurrency = (amount: number, currencyCode: string, currencies: Currency[]): string => {
  const currency = currencies.find(c => c.code === currencyCode);
  
  if (!currency) {
    return `${amount.toFixed(2)}`;
  }

  return `${currency.symbol} ${amount.toFixed(2)}`;
};
