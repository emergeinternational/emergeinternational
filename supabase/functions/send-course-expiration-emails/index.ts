
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailNotification {
  notification_id: string;
  user_id: string;
  course_id: string;
  notification_type: string;
  user_email: string;
  user_full_name: string;
  course_title: string;
  end_date: string;
}

const handler = async (req: Request): Promise<Response> => {
  try {
    console.log("Starting send-course-expiration-emails function");
    
    // Check if a specific course ID was provided for testing
    let courseId: string | undefined;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        courseId = body.course_id;
        if (courseId) {
          console.log(`Processing notifications for specific course ID: ${courseId}`);
        }
      } catch (e) {
        // If parsing fails, continue without courseId
        console.log("No course ID provided or invalid JSON body");
      }
    }

    // Build the query for unsent notifications
    let query = supabase
      .from('premium_course_notifications')
      .select(`
        id as notification_id,
        user_id,
        course_id,
        notification_type,
        profiles:profiles(email:email, full_name:full_name),
        courses:premium_courses(title:title, end_date:end_date)
      `)
      .is('sent_at', null);

    // If a specific course ID was provided, filter by it
    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: notifications, error: queryError } = await query;

    if (queryError) {
      throw new Error(`Error querying notifications: ${queryError.message}`);
    }

    console.log(`Found ${notifications?.length || 0} unsent notifications`);

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending notifications" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const processedNotifications = [];
    const failedNotifications = [];

    for (const notification of notifications) {
      const emailData: EmailNotification = {
        notification_id: notification.notification_id,
        user_id: notification.user_id,
        course_id: notification.course_id,
        notification_type: notification.notification_type,
        user_email: notification.profiles.email,
        user_full_name: notification.profiles.full_name || "Student",
        course_title: notification.courses.title,
        end_date: new Date(notification.courses.end_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      try {
        console.log(`Sending email to ${emailData.user_email} about course ${emailData.course_title}`);
        
        // Send email using Resend
        const emailResult = await resend.emails.send({
          from: "Emerge Course Notifications <notifications@emerge.education>",
          to: [emailData.user_email],
          subject: `Reminder: Your course ${emailData.course_title} is ending soon!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Course Expiration Reminder</h2>
              <p>Hello ${emailData.user_full_name},</p>
              <p>Your premium course "${emailData.course_title}" is ending on ${emailData.end_date}.</p>
              <p>Complete it soon to get the most out of it!</p>
              <p>Best regards,<br>The Emerge Team</p>
            </div>
          `,
        });

        console.log(`Email sent successfully to ${emailData.user_email}, id: ${emailResult.id}`);

        // Mark notification as sent
        const { error: updateError } = await supabase
          .from('premium_course_notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', emailData.notification_id);

        if (updateError) {
          console.error(`Error updating notification ${emailData.notification_id}:`, updateError);
          failedNotifications.push({
            notification_id: emailData.notification_id,
            error: updateError.message
          });
          continue;
        }

        processedNotifications.push({
          notification_id: emailData.notification_id,
          email: emailData.user_email,
          course: emailData.course_title
        });

      } catch (error) {
        console.error(`Error processing notification ${emailData.notification_id}:`, error);
        failedNotifications.push({
          notification_id: emailData.notification_id,
          email: emailData.user_email,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Notification processing complete", 
        processed: processedNotifications,
        failed: failedNotifications,
        total_notifications: notifications.length,
        successful_notifications: processedNotifications.length,
        failed_notifications: failedNotifications.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in send-course-expiration-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

// Handle CORS preflight requests
serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  return handler(req);
});
