
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

const handler = async (req: Request): Promise<Response> => {
  try {
    console.log("Starting generate-course-expiration-notifications function");
    
    // Support for manual testing with specific course ID
    let courseId: string | undefined;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        courseId = body.course_id;
      } catch (e) {
        // If parsing fails, continue without courseId
        console.log("No course ID provided or invalid JSON body");
      }
    }

    // Generate notifications by calling the database function
    const { data, error } = await supabase.rpc(
      'check_course_expiration_notifications',
      courseId ? { course_id: courseId } : {}
    );

    if (error) {
      throw new Error(`Error generating notifications: ${error.message}`);
    }

    console.log("Notifications generated successfully:", data);

    // After generating notifications, trigger the send-course-expiration-emails function
    const sendEmailsEndpoint = `${supabaseUrl}/functions/v1/send-course-expiration-emails`;
    console.log(`Triggering email sending at: ${sendEmailsEndpoint}`);
    
    const response = await fetch(sendEmailsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify(courseId ? { course_id: courseId } : {})
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to trigger email sending: ${errorText}`);
    }

    const emailResult = await response.json();
    console.log("Email sending completed with result:", emailResult);

    return new Response(
      JSON.stringify({ 
        message: "Notification generation and email sending complete",
        notifications_generated: data,
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
