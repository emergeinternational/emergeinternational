
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we should run the refresh
    // Only run if no enrollments in the last two weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const { data: recentEnrollments, error: enrollmentError } = await supabase
      .from('user_course_progress')
      .select('id')
      .gt('created_at', twoWeeksAgo.toISOString())
      .limit(1);
    
    if (enrollmentError) {
      throw new Error(`Error checking enrollments: ${enrollmentError.message}`);
    }
    
    // If there are recent enrollments, don't refresh courses
    if (recentEnrollments && recentEnrollments.length > 0) {
      return new Response(
        JSON.stringify({ message: "Recent enrollments found. Skipping course refresh." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get all courses to validate
    const { data: courses, error: coursesError } = await supabase
      .from('education_content')
      .select('*');
    
    if (coursesError) {
      throw new Error(`Error fetching courses: ${coursesError.message}`);
    }

    // Log the start of the process
    console.log(`Starting course link validation for ${courses?.length ?? 0} courses`);

    // Track results
    const results = {
      checked: 0,
      valid: 0,
      invalid: 0,
      updated: 0,
      preserved: 0
    };

    // Validate each course URL
    if (courses) {
      for (const course of courses) {
        results.checked++;
        
        // Skip courses without URLs
        if (!course.source_url) continue;
        
        let isValid = false;
        
        try {
          // Perform a basic URL check
          const url = new URL(course.source_url.startsWith('http') ? 
            course.source_url : `https://${course.source_url}`);
            
          // Check for obviously invalid URLs
          if (course.source_url.includes('example.com') || 
              course.source_url.includes('placeholder') ||
              course.source_url.includes('undefined') ||
              course.source_url.includes('null')) {
            isValid = false;
          } else {
            // In a full implementation, we'd do an actual HTTP request to verify
            // the URL is accessible, but for now we'll just do a basic check
            // This would require more complex fetch operations with proper error handling
            isValid = true;
          }
        } catch (e) {
          console.error(`Invalid URL format for course ${course.id}: ${course.source_url}`);
          isValid = false;
        }

        // Update validation status
        if (isValid) {
          results.valid++;
          
          // Mark as valid in database if needed
          if (course.validation_status !== 'valid') {
            const { error: updateValidError } = await supabase
              .from('education_content')
              .update({ 
                validation_status: 'valid',
                updated_at: new Date().toISOString()
              })
              .eq('id', course.id);
              
            if (updateValidError) {
              console.error(`Error updating course ${course.id} validation: ${updateValidError.message}`);
            } else {
              results.updated++;
            }
          }
        } else {
          results.invalid++;
          
          // Instead of removing, mark as placeholder and preserve
          const { error: updateError } = await supabase
            .from('education_content')
            .update({ 
              validation_status: 'invalid',
              is_placeholder: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', course.id);
          
          if (updateError) {
            console.error(`Error updating course ${course.id}: ${updateError.message}`);
          } else {
            results.updated++;
            results.preserved++;
          }
        }
      }
    }

    // Log the completion of the process
    console.log(`Course validation complete:`, results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Course refresh complete",
        results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in course-refresh:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
