
import { serve } from "https://deno.land/std@0.198.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const EXCHANGE_RATE_API_KEY = Deno.env.get("EXCHANGE_RATE_API_KEY");

interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      }
    });

    // Fetch the currencies from the database
    const { data: currencies, error } = await supabase
      .from("currencies")
      .select("code");

    if (error) {
      console.error("Error fetching currencies:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch currencies" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!currencies || currencies.length === 0) {
      return new Response(JSON.stringify({ error: "No currencies found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract the currency codes
    const currencyCodes = currencies.map((c) => c.code);

    // Fetch exchange rates from an external API 
    // (placeholder for real exchange rate API)
    let exchangeRates: Record<string, number> = {};
    
    if (EXCHANGE_RATE_API_KEY) {
      try {
        // If you have an API key, use it to fetch real exchange rates
        // This is an example using a popular exchange rate API
        const response = await fetch(
          `https://api.exchangeratesapi.io/latest?base=ETB&symbols=${currencyCodes.join(",")}&access_key=${EXCHANGE_RATE_API_KEY}`
        );
        const data = await response.json() as ExchangeRateResponse;
        
        if (data.success) {
          exchangeRates = data.rates;
        } else {
          console.error("API returned an error:", data);
          // Use fallback rates
          exchangeRates = getFallbackRates();
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        // Use fallback rates
        exchangeRates = getFallbackRates();
      }
    } else {
      // If no API key is provided, use fallback rates
      console.warn("No EXCHANGE_RATE_API_KEY provided, using fallback rates");
      exchangeRates = getFallbackRates();
    }

    // Update each currency's exchange rate in the database
    const updates = [];
    for (const code of currencyCodes) {
      if (code === "ETB") {
        // ETB is our base currency, so rate is 1
        updates.push(supabase
          .from("currencies")
          .update({ exchange_rate: 1, updated_at: new Date().toISOString() })
          .eq("code", code));
      } else if (exchangeRates[code]) {
        updates.push(supabase
          .from("currencies")
          .update({ exchange_rate: exchangeRates[code], updated_at: new Date().toISOString() })
          .eq("code", code));
      }
    }

    // Wait for all updates to complete
    await Promise.all(updates);

    // Log the update
    await supabase
      .from("automation_logs")
      .insert({
        function_name: "update-exchange-rates",
        results: { updated_currencies: currencyCodes }
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Exchange rates updated successfully" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error updating exchange rates:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// Fallback rates to use if the API call fails
function getFallbackRates(): Record<string, number> {
  return {
    ETB: 1,
    USD: 0.018,
    EUR: 0.016,
    GBP: 0.014
  };
}
