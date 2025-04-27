
import { supabase } from "@/integrations/supabase/client";
import { UserCertificate } from "./types";

/**
 * Generate a certificate for a user
 */
export const generateCertificate = async (
  userId: string,
  courseTitle: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user is approved for certificate
    const { data: eligibilityData, error: eligibilityError } = await supabase
      .from('certificate_eligibility')
      .select('admin_approved')
      .eq('user_id', userId)
      .single();
    
    if (eligibilityError) throw eligibilityError;
    if (!eligibilityData?.admin_approved) {
      return { 
        success: false,
        error: "User is not approved for certificate generation"
      };
    }
    
    // Create certificate record
    const { error: insertError } = await supabase
      .from('user_certificates')
      .insert({
        user_id: userId,
        course_title: courseTitle,
        issue_date: new Date().toISOString(),
        expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
        certificate_file: `certificate_${userId}_${new Date().getTime()}.pdf`
      });
    
    if (insertError) throw insertError;
    
    return { success: true };
  } catch (error) {
    console.error("Error generating certificate:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

/**
 * Fetch all certificates for a user
 */
export const getUserCertificates = async (userId: string): Promise<UserCertificate[]> => {
  try {
    const { data, error } = await supabase
      .from('user_certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user certificates:", error);
    throw error;
  }
};

/**
 * Download a certificate by ID
 */
export const downloadCertificate = async (certificateId: string): Promise<{ 
  success: boolean; 
  error?: string;
  data?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('user_certificates')
      .select('certificate_file')
      .eq('id', certificateId)
      .single();

    if (error) throw error;
    
    if (!data || !data.certificate_file) {
      return {
        success: false,
        error: "Certificate file not found"
      };
    }

    // In a real implementation, this would fetch the actual file
    // For now, return a simulated base64 PDF
    const simulatedBase64 = "JVBERi0xLjcKJeLjz9MKNSAwIG9iago8..."; // Truncated for brevity
    
    return {
      success: true,
      data: simulatedBase64
    };
  } catch (error) {
    console.error("Error downloading certificate:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};
