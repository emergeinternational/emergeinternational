
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// Configure CORS headers for browser requests
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
    console.log("Running education-automation function");
    
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );
    
    // Parse request to determine operation
    let operation = 'all';
    try {
      const body = await req.json();
      operation = body.operation || 'all';
    } catch (e) {
      // If body parsing fails, default to 'all'
      console.log("Error parsing request body, defaulting to 'all' operation");
    }

    // Execute requested operation(s)
    const results = {
      success: true,
      operations: {},
      message: "Automation tasks completed",
    };
    
    // 1. Archive past workshops
    if (operation === 'all' || operation === 'archive-workshops') {
      try {
        const { data, error } = await supabaseAdmin.rpc('archive_past_workshops');
        
        if (error) throw error;
        
        const { count: archivedCount } = await supabaseAdmin
          .from('workshops')
          .select('*', { count: 'exact', head: true })
          .eq('is_archived', true);
          
        results.operations.archivedWorkshops = {
          success: true,
          count: archivedCount || 0,
        };
        
        console.log(`Successfully archived past workshops. Total archived: ${archivedCount || 0}`);
      } catch (error) {
        console.error("Error archiving past workshops:", error);
        results.operations.archivedWorkshops = {
          success: false,
          error: error.message,
        };
      }
    }
    
    // 2. Log function execution for monitoring
    try {
      const { data, error } = await supabaseAdmin
        .from('automation_logs')
        .insert([
          { 
            function_name: 'education-automation',
            executed_at: new Date().toISOString(),
            results: results
          }
        ])
        .select();
        
      if (error) {
        console.warn("Error logging automation execution:", error);
      }
    } catch (e) {
      console.warn("Error inserting log record:", e);
      // Create the logs table if it doesn't exist
      try {
        await supabaseAdmin.rpc('create_automation_logs_table');
      } catch (tableError) {
        console.error("Failed to create logs table:", tableError);
      }
    }
    
    return new Response(
      JSON.stringify(results),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error in education-automation function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
