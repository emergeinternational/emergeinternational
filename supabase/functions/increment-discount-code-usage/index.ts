
import { serve } from "https://deno.land/std@0.198.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

serve(async (req) => {
  try {
    const { code_id } = await req.json();
    
    if (!code_id) {
      return new Response(JSON.stringify({ 
        error: "code_id is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      }
    });

    // Get the current uses count
    const { data: code, error: getError } = await supabase
      .from("discount_codes")
      .select("current_uses, max_uses")
      .eq("id", code_id)
      .single();
      
    if (getError) {
      console.error("Error fetching discount code:", getError);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch discount code" 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (!code) {
      return new Response(JSON.stringify({ 
        error: "Discount code not found" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Check if max uses is reached
    if (code.max_uses && code.current_uses >= code.max_uses) {
      return new Response(JSON.stringify({ 
        error: "Discount code has reached maximum usage" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Increment the current_uses count
    const { error: updateError } = await supabase
      .from("discount_codes")
      .update({ 
        current_uses: (code.current_uses || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", code_id);
      
    if (updateError) {
      console.error("Error updating discount code usage:", updateError);
      return new Response(JSON.stringify({ 
        error: "Failed to update discount code usage" 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Discount code usage incremented successfully" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in increment-discount-code-usage:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
