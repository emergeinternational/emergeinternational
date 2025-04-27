
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (_req: Request): Promise<Response> => {
  try {
    // Generate notifications by calling the database function
    const { data, error } = await supabase.rpc(
      'check_course_expiration_notifications'
    );

    if (error) {
      throw new Error(`Error generating notifications: ${error.message}`);
    }

    // After generating notifications, trigger the send-course-expiration-emails function
    const sendEmailsEndpoint = `${supabaseUrl}/functions/v1/send-course-expiration-emails`;
    const response = await fetch(sendEmailsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to trigger email sending: ${errorText}`);
    }

    const emailResult = await response.json();

    return new Response(
      JSON.stringify({ 
        message: "Notification generation and email sending complete",
        emailsResult: emailResult
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in generate-course-expiration-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Handle CORS preflight requests
serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  return handler(req);
});
