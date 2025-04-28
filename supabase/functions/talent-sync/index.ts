
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
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: emergeTalent } = await supabaseClient
      .from('emerge_submissions')
      .select('*')
      .eq('sync_status', 'pending');
    
    const results = [];

    if (emergeTalent && emergeTalent.length > 0) {
      for (const talent of emergeTalent) {
        // Check if this talent already exists in talent_applications
        const { data: existingTalent } = await supabaseClient
          .from('talent_applications')
          .select('id')
          .eq('email', talent.email)
          .maybeSingle();

        if (existingTalent) {
          // Update sync status only
          const { error: updateError } = await supabaseClient
            .from('emerge_submissions')
            .update({ sync_status: 'already_exists' })
            .eq('id', talent.id);
          
          if (updateError) throw updateError;
          
          results.push({
            id: talent.id,
            email: talent.email,
            status: 'already_exists'
          });
          
          continue;
        }

        // Insert new talent application
        const { data: newTalent, error: insertError } = await supabaseClient
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

        if (insertError) throw insertError;

        // Update sync status
        const { error: updateError } = await supabaseClient
          .from('emerge_submissions')
          .update({ sync_status: 'synced' })
          .eq('id', talent.id);
        
        if (updateError) throw updateError;

        // Record sync in talent_sync_status table for audit
        await supabaseClient.from('talent_sync_status').insert({
          emerge_submission_id: talent.id,
          talent_application_id: newTalent.id,
          email: talent.email,
          submission_date: talent.created_at,
          talent_sync_date: new Date().toISOString(),
          exists_in_talent_applications: true
        });
        
        results.push({
          id: talent.id,
          email: talent.email,
          status: 'synced',
          talent_application_id: newTalent.id
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error syncing talents:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
