
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
    console.log("Running talent-migration function");
    
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );
    
    // Parse request to determine operation
    let operation = 'migrate-approved';
    let forceSync = false;
    try {
      const body = await req.json();
      operation = body.operation || 'migrate-approved';
      forceSync = !!body.forceSync;
    } catch (e) {
      console.log("Error parsing request body, defaulting to 'migrate-approved' operation");
    }

    // Map legacy category type to new enum
    function mapCategoryToEnum(categoryType: string): string {
      if (!categoryType) return 'model';
      
      const lowerCategory = categoryType.toLowerCase();
      
      if (lowerCategory.includes('model')) return 'model';
      if (lowerCategory.includes('design')) return 'designer';
      if (lowerCategory.includes('photo')) return 'photographer';
      if (lowerCategory.includes('act')) return 'actor';
      if (lowerCategory.includes('music') || lowerCategory.includes('sing') || lowerCategory.includes('band')) return 'musical_artist';
      if (lowerCategory.includes('art') || lowerCategory.includes('paint')) return 'fine_artist';
      if (lowerCategory.includes('event') || lowerCategory.includes('plan')) return 'event_planner';
      
      return 'model';
    }

    // Migration function
    async function migrateApprovedApplications() {
      // Get already migrated talents to avoid duplicates
      const { data: existingTalents, error: existingError } = await supabaseAdmin
        .from('talent')
        .select('email');
      
      if (existingError) throw existingError;
      
      // Create a set of existing emails for fast lookup
      const existingEmails = new Set((existingTalents || []).map(t => t.email.toLowerCase()));
      
      // Get approved applications
      const { data: approvedApplications, error: appError } = await supabaseAdmin
        .from('talent_applications')
        .select('*')
        .eq('status', 'approved');
      
      if (appError) throw appError;
      
      if (!approvedApplications || approvedApplications.length === 0) {
        return {
          success: true,
          migratedCount: 0,
          message: "No approved applications found to migrate"
        };
      }
      
      // Filter out already migrated applications
      const newApplications = approvedApplications.filter(app => 
        !existingEmails.has(app.email.toLowerCase())
      );
      
      console.log(`Found ${approvedApplications.length} approved applications, ${newApplications.length} are new`);
      
      if (newApplications.length === 0) {
        return {
          success: true,
          migratedCount: 0,
          message: "All approved applications already migrated"
        };
      }
      
      // Prepare data for migration
      const talentsToInsert = newApplications.map(app => ({
        full_name: app.full_name,
        email: app.email,
        category: mapCategoryToEnum(app.category_type || ''),
        level: 'beginner', // Default level for migrations
        portfolio_url: app.portfolio_url,
        social_media_links: app.social_media,
        profile_image_url: app.photo_url
      }));
      
      // Insert into talent table
      const { data: insertedTalents, error: insertError } = await supabaseAdmin
        .from('talent')
        .insert(talentsToInsert)
        .select();
      
      if (insertError) {
        throw insertError;
      }
      
      // Log the migration activity
      await supabaseAdmin
        .from('automation_logs')
        .insert([
          { 
            function_name: 'talent-migration',
            executed_at: new Date().toISOString(),
            results: {
              operation: 'migrate-approved',
              migrated_count: insertedTalents?.length || 0,
              total_approved: approvedApplications.length,
              force_sync: forceSync
            }
          }
        ]);
      
      return {
        success: true,
        migratedCount: insertedTalents?.length || 0,
        message: `Successfully migrated ${insertedTalents?.length || 0} approved applications`
      };
    }
    
    // Execute requested operation
    let result;
    
    if (operation === 'migrate-approved') {
      result = await migrateApprovedApplications();
    } else {
      result = {
        success: false,
        error: `Unknown operation: ${operation}`
      };
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error in talent-migration function:", error);
    
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
