
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Extract parameters
    const { table_name } = await req.json();
    
    if (!table_name) {
      return new Response(
        JSON.stringify({ error: 'Missing table_name parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Query information_schema
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', table_name)
      .eq('table_schema', 'public');
    
    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
      return new Response(
        JSON.stringify({ error: columnsError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Check if table exists by getting record count
    let recordCount = 0;
    try {
      const { count, error: countError } = await supabase
        .from(table_name)
        .select('*', { count: 'exact', head: true });
        
      if (!countError) {
        recordCount = count || 0;
      }
    } catch (err) {
      console.log('Error getting record count:', err);
      // Continue despite error - table might not exist
    }
    
    // Return results
    return new Response(
      JSON.stringify({
        table: table_name,
        columns,
        exists: columns.length > 0,
        record_count: recordCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
