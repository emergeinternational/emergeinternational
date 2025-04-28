
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
    let forceSync = false;
    try {
      const body = await req.json();
      operation = body.operation || 'all';
      forceSync = !!body.forceSync;
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
    
    // 2. Sync talent submissions if operation is talent-sync
    if (operation === 'all' || operation === 'talent-sync') {
      try {
        // Query definition changes based on force sync flag
        let queryBuilder = supabaseAdmin
          .from('emerge_submissions')
          .select('*');

        // Apply filter only if not force syncing
        if (!forceSync) {
          queryBuilder = queryBuilder.eq('sync_status', 'pending');
        }
        
        const { data: emergeSubmissions, error: fetchError } = await queryBuilder;

        if (fetchError) throw fetchError;

        if (emergeSubmissions && emergeSubmissions.length > 0) {
          // Get existing emails in talent_applications
          const { data: existingApplications, error: existingError } = await supabaseAdmin
            .from('talent_applications')
            .select('email');

          if (existingError) throw existingError;

          // Create map of existing emails for O(1) lookup
          const existingEmailsMap = new Map();
          existingApplications?.forEach(app => {
            if (app.email) existingEmailsMap.set(app.email.toLowerCase(), true);
          });

          // Filter out submissions that already exist in talent_applications
          const newSubmissions = emergeSubmissions.filter(submission => 
            !existingEmailsMap.has(submission.email?.toLowerCase())
          );

          console.log(`Found ${emergeSubmissions.length} ${forceSync ? 'total' : 'pending'} submissions, ${newSubmissions.length} are new`);

          if (newSubmissions.length > 0) {
            // Map category values to valid talent_applications values
            function mapCategoryToValidType(category) {
              if (!category) return 'other';
              
              // Map to lowercase for consistency
              const lowerCategory = category.toLowerCase();
              
              // Basic mapping to ensure compatibility with constraints
              if (lowerCategory.includes('model')) return 'model';
              if (lowerCategory.includes('performer') || 
                  lowerCategory.includes('singer') || 
                  lowerCategory.includes('dancer') || 
                  lowerCategory.includes('actor')) return 'performer';
              if (lowerCategory.includes('design')) return 'designer';
              
              // Default fallback - ensure this value is allowed by constraints
              return 'other';
            }
            
            // Format for talent_applications table
            const applicationData = newSubmissions.map(submission => ({
              full_name: submission.full_name,
              email: submission.email,
              phone: submission.phone_number,
              age: submission.age,
              status: 'pending',
              social_media: {
                instagram: submission.instagram || null,
                telegram: submission.telegram || null,
                tiktok: submission.tiktok || null
              },
              notes: submission.talent_description,
              category_type: mapCategoryToValidType(submission.category),
              gender: submission.gender,
              portfolio_url: submission.portfolio_url,
              measurements: submission.measurements,
              created_at: submission.created_at,
              sync_status: 'synced'
            }));

            // Insert into talent_applications
            const { data, error: insertError } = await supabaseAdmin
              .from('talent_applications')
              .insert(applicationData)
              .select();

            if (insertError) throw insertError;

            // Update sync status
            const submissionIds = newSubmissions.map(s => s.id);
            await supabaseAdmin
              .from('emerge_submissions')
              .update({ sync_status: 'synced' })
              .in('id', submissionIds);

            results.operations.talentSync = {
              success: true,
              syncedCount: newSubmissions.length,
              forceSync: forceSync
            };

            console.log(`Successfully synced ${newSubmissions.length} talent submissions`);
          } else {
            results.operations.talentSync = {
              success: true,
              syncedCount: 0,
              message: "No new records to sync",
              forceSync: forceSync
            };
          }
        } else {
          results.operations.talentSync = {
            success: true,
            syncedCount: 0,
            message: "No pending submissions found",
            forceSync: forceSync
          };
        }
      } catch (error) {
        console.error("Error syncing talent submissions:", error);
        results.operations.talentSync = {
          success: false,
          error: error.message,
          forceSync: forceSync
        };
      }
    }
    
    // 3. Log function execution for monitoring
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
