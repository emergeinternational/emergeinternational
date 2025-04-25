
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client using environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Archive past workshops
    console.log("Starting to archive past workshops...");
    const { data: archivedWorkshops, error: archiveError } = await supabase.rpc('archive_past_workshops');
    
    if (archiveError) {
      console.error("Error archiving workshops:", archiveError);
      return new Response(
        JSON.stringify({ error: "Failed to archive past workshops", details: archiveError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Log execution to automation_logs table
    const { error: logError } = await supabase
      .from('automation_logs')
      .insert({
        function_name: 'education-automation',
        executed_at: new Date().toISOString(),
        results: { message: "Past workshops archived successfully" }
      });

    if (logError) {
      console.error("Error logging automation execution:", logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Education automation tasks completed successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
