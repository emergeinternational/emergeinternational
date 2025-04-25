
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
    
    let results = {
      archived_workshops: 0,
      has_errors: false,
      errors: [] as string[],
    };

    // Try to archive past workshops if the table exists
    try {
      console.log("Starting to archive past workshops...");
      
      // First check if the workshops table exists
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'workshops')
        .eq('table_schema', 'public')
        .single();
      
      if (tableCheckError || !tableExists) {
        console.log("Workshops table does not exist yet, skipping archiving");
        results.errors.push("Workshops table does not exist yet");
      } else {
        // If table exists, archive past workshops directly
        const today = new Date().toISOString().split('T')[0];
        
        const { data: archivedWorkshops, error: archiveError } = await supabase
          .from('workshops')
          .update({ is_archived: true })
          .lt('date', today)
          .eq('is_archived', false)
          .select();
        
        if (archiveError) {
          console.error("Error archiving workshops:", archiveError);
          results.errors.push(`Error archiving workshops: ${archiveError.message}`);
          results.has_errors = true;
        } else {
          results.archived_workshops = archivedWorkshops ? archivedWorkshops.length : 0;
          console.log(`Successfully archived ${results.archived_workshops} past workshops`);
        }
      }
    } catch (error) {
      console.error("Error in archive operation:", error);
      results.errors.push(`Error in archive operation: ${error.message}`);
      results.has_errors = true;
    }

    // Try to log execution if the table exists
    try {
      // Check if automation_logs table exists
      const { data: logsTableExists, error: logsTableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'automation_logs')
        .eq('table_schema', 'public')
        .single();
      
      if (!logsTableCheckError && logsTableExists) {
        // Log execution only if the table exists
        await supabase
          .from('automation_logs')
          .insert({
            function_name: 'education-automation',
            executed_at: new Date().toISOString(),
            results: results
          });
      } else {
        console.log("Automation logs table does not exist yet, skipping logging");
      }
    } catch (error) {
      console.error("Error logging automation execution:", error);
    }

    return new Response(
      JSON.stringify({ 
        success: !results.has_errors, 
        message: results.has_errors 
          ? "Education automation completed with errors" 
          : "Education automation tasks completed successfully",
        results: results
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
