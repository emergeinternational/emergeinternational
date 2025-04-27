import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://cdn.skypack.dev/pdf-lib@1.17.1";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface CertificateGenerationParams {
  userId: string;
  courseTitle: string;
  completionDate?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, courseTitle, completionDate }: CertificateGenerationParams = await req.json();
    
    if (!userId || !courseTitle) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase clients
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .rpc('get_profile_for_certificate', { p_user_id: userId });
    
    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create a PDF certificate
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();
    
    // Load fonts
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    
    // Draw certificate border
    page.drawRectangle({
      x: 40,
      y: 40,
      width: width - 80,
      height: height - 80,
      borderColor: rgb(0.8, 0.66, 0.2), // Gold color
      borderWidth: 3,
      color: rgb(1, 1, 1), // White background
    });
    
    // Draw certificate content
    const currentDate = completionDate ? new Date(completionDate) : new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Title
    page.drawText('CERTIFICATE OF COMPLETION', {
      x: width / 2 - 200,
      y: height - 120,
      size: 28,
      font: timesRomanBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    
    // Subtitle
    page.drawText('This certifies that', {
      x: width / 2 - 70,
      y: height - 180,
      size: 16,
      font: timesItalic,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Student name
    page.drawText(profile.full_name || "Student", {
      x: width / 2 - 150,
      y: height - 220,
      size: 24,
      font: timesRomanBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    
    // Course info
    page.drawText('has successfully completed the course', {
      x: width / 2 - 145,
      y: height - 260,
      size: 16,
      font: timesItalic,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Course title
    page.drawText(courseTitle, {
      x: width / 2 - (courseTitle.length * 7),
      y: height - 300,
      size: 20,
      font: timesRomanBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    
    // Date
    page.drawText(`Awarded on ${formattedDate}`, {
      x: width / 2 - 90,
      y: height - 340,
      size: 16,
      font: timesRomanFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Signature
    page.drawText('Emerge International', {
      x: 570,
      y: 120,
      size: 14,
      font: timesRomanBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    
    page.drawText('____________________', {
      x: 550,
      y: 140,
      size: 14,
      font: timesRomanFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    
    page.drawText('International Director', {
      x: 560,
      y: 100,
      size: 12,
      font: timesRomanFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Convert PDF to bytes and then base64
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = base64Encode(pdfBytes);
    
    // Store certificate in database using secure RPC call
    const { data: certificate, error: certificateError } = await supabase
      .rpc('create_certificate', {
        p_user_id: userId,
        p_course_title: courseTitle,
        p_certificate_data: pdfBase64,
        p_completion_date: completionDate || new Date().toISOString()
      });
    
    if (certificateError) {
      console.error("Error storing certificate:", certificateError);
      return new Response(
        JSON.stringify({ error: "Failed to store certificate" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        certificateId: certificate.id,
        message: "Certificate generated successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error generating certificate:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
