
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Running education-automation function");
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );
    
    let operation = 'all';
    try {
      const body = await req.json();
      operation = body.operation || 'all';
    } catch (e) {
      console.log("Error parsing request body, defaulting to 'all' operation");
    }

    const results = {
      success: true,
      operations: {},
      message: "Automation tasks completed",
    };
    
    // Archive outdated content
    if (operation === 'all' || operation === 'archive-content') {
      try {
        const monthsAgo = new Date();
        monthsAgo.setMonth(monthsAgo.getMonth() - 6);

        const { data: archivedContent, error: archiveError } = await supabaseAdmin
          .from('education_content')
          .update({ is_archived: true, archive_date: new Date().toISOString() })
          .eq('is_archived', false)
          .lt('created_at', monthsAgo.toISOString())
          .select();

        if (archiveError) throw archiveError;
        
        results.operations.archivedContent = {
          success: true,
          count: archivedContent?.length || 0,
        };
        
        console.log(`Successfully archived ${archivedContent?.length || 0} outdated content items`);
      } catch (error) {
        console.error("Error archiving content:", error);
        results.operations.archivedContent = {
          success: false,
          error: error.message,
        };
      }
    }
    
    // Track course engagement
    if (operation === 'all' || operation === 'track-engagement') {
      try {
        const { data: engagementData, error: engagementError } = await supabaseAdmin
          .from('course_engagement')
          .select('*');

        if (engagementError) throw engagementError;

        const updates = await Promise.all(
          (engagementData || []).map(async (engagement) => {
            const { error: updateError } = await supabaseAdmin
              .from('course_engagement')
              .update({
                total_clicks: (engagement.total_clicks || 0) + 1,
                last_click_date: new Date().toISOString()
              })
              .eq('id', engagement.id);

            if (updateError) throw updateError;
          })
        );

        results.operations.engagement = {
          success: true,
          count: engagementData?.length || 0,
        };

        console.log(`Successfully updated engagement for ${engagementData?.length || 0} courses`);
      } catch (error) {
        console.error("Error updating course engagement:", error);
        results.operations.engagement = {
          success: false,
          error: error.message,
        };
      }
    }
    
    // Log execution
    try {
      const { error: logError } = await supabaseAdmin
        .from('automation_logs')
        .insert([{ 
          function_name: 'education-automation',
          executed_at: new Date().toISOString(),
          results: results
        }]);
        
      if (logError) {
        console.warn("Error logging automation execution:", logError);
      }
    } catch (e) {
      console.warn("Error inserting log record:", e);
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

