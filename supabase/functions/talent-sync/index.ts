
// Follow Supabase Edge Function format
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log('Starting talent sync process...');
    
    // Create a Supabase client with service role
    // This is required to bypass RLS policies
    const supabaseAdmin = createClient(
      // Supabase API URL - env var exported by default
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase SERVICE_ROLE KEY - needed to bypass RLS
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        }
      }
    );
    
    // Create a client with auth context to check permissions
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } }
      }
    );

    // Verify user is authorized (admin or editor)
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Check if user has admin or editor role
    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
      
    if (roleError) {
      console.error('Role check error:', roleError);
      return new Response(
        JSON.stringify({ success: false, error: 'Error checking permissions' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    const isAuthorized = Array.isArray(roles) && 
      roles.some(r => ['admin', 'editor'].includes(r.role));
      
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Permission denied' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Fetch pending sync submissions
    const { data: emergeTalent, error: fetchError } = await supabaseAdmin
      .from('emerge_submissions')
      .select('*')
      .eq('sync_status', 'pending');
    
    if (fetchError) {
      console.error('Error fetching emerge submissions:', fetchError);
      throw fetchError;
    }
    
    console.log(`Found ${emergeTalent?.length || 0} pending submissions to sync`);
    
    const results = [];

    if (emergeTalent && emergeTalent.length > 0) {
      for (const talent of emergeTalent) {
        console.log(`Processing talent: ${talent.email}`);
        
        // Check if this talent already exists in talent_applications
        const { data: existingTalent, error: checkError } = await supabaseAdmin
          .from('talent_applications')
          .select('id')
          .eq('email', talent.email)
          .maybeSingle();
        
        if (checkError) {
          console.error(`Error checking existing talent for ${talent.email}:`, checkError);
          results.push({
            id: talent.id,
            email: talent.email,
            status: 'error',
            error: checkError.message
          });
          continue;
        }

        if (existingTalent) {
          console.log(`Talent ${talent.email} already exists, marking as already_exists`);
          // Update sync status only
          const { error: updateError } = await supabaseAdmin
            .from('emerge_submissions')
            .update({ sync_status: 'already_exists' })
            .eq('id', talent.id);
          
          if (updateError) {
            console.error(`Error updating sync status for ${talent.email}:`, updateError);
            results.push({
              id: talent.id,
              email: talent.email,
              status: 'error',
              error: updateError.message
            });
            continue;
          }
          
          results.push({
            id: talent.id,
            email: talent.email,
            status: 'already_exists',
            talent_application_id: existingTalent.id
          });
          
          continue;
        }

        // Using service role client to bypass RLS policies
        console.log(`Inserting new talent application for ${talent.email}`);
        
        // Insert new talent application
        const { data: newTalent, error: insertError } = await supabaseAdmin
          .from('talent_applications')
          .insert({
            full_name: talent.full_name,
            email: talent.email,
            phone: talent.phone_number,
            age: talent.age,
            status: 'pending',
            social_media: {
              instagram: talent.instagram,
              telegram: talent.telegram,
              tiktok: talent.tiktok
            },
            notes: talent.talent_description,
            category_type: talent.category,
            gender: talent.gender,
            portfolio_url: talent.portfolio_url,
            measurements: talent.measurements
          })
          .select('id')
          .single();

        if (insertError) {
          console.error(`Error inserting talent application for ${talent.email}:`, insertError);
          results.push({
            id: talent.id,
            email: talent.email,
            status: 'error',
            error: insertError.message
          });
          continue;
        }

        console.log(`Successfully inserted talent application for ${talent.email}`);
        
        // Update sync status
        const { error: updateError } = await supabaseAdmin
          .from('emerge_submissions')
          .update({ sync_status: 'synced' })
          .eq('id', talent.id);
        
        if (updateError) {
          console.error(`Error updating sync status for ${talent.email}:`, updateError);
          results.push({
            id: talent.id,
            email: talent.email,
            status: 'partial_success',
            error: updateError.message,
            talent_application_id: newTalent.id
          });
          continue;
        }

        // Record sync in talent_sync_status table for audit
        const { error: syncLogError } = await supabaseAdmin
          .from('talent_sync_status')
          .insert({
            emerge_submission_id: talent.id,
            talent_application_id: newTalent.id,
            email: talent.email,
            submission_date: talent.created_at,
            talent_sync_date: new Date().toISOString(),
            exists_in_talent_applications: true
          });
          
        if (syncLogError) {
          console.warn(`Warning: Could not log sync status for ${talent.email}:`, syncLogError);
        }
        
        results.push({
          id: talent.id,
          email: talent.email,
          status: 'synced',
          talent_application_id: newTalent.id
        });
        
        console.log(`Completed processing for talent: ${talent.email}`);
      }
    }

    console.log(`Talent sync process completed. Processed ${results.length} submissions`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length, 
        results,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in talent sync function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
