
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches users who are eligible for certificates
 * @returns Array of users with their certificate eligibility status
 */
export const getEligibleUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("certificate_eligibility")
      .select(`
        *,
        profiles:profiles(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching eligible users:", error);
    return [];
  }
};

/**
 * Updates the certificate approval status for a user
 * @param userId User ID
 * @param isApproved Whether to approve or revoke the certificate
 * @returns Boolean indicating success
 */
export const updateCertificateApproval = async (
  userId: string,
  isApproved: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("certificate_eligibility")
      .update({ admin_approved: isApproved })
      .eq("user_id", userId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating certificate approval:", error);
    return false;
  }
};

/**
 * Generates a certificate for a user
 * @param userId User ID
 * @param courseTitle Title of the course
 * @returns Object with success status and potentially error message
 */
export const generateCertificate = async (
  userId: string,
  courseTitle: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // In a real application, this would connect to a certificate generation service
    // For now, we'll simulate success
    console.log(`Generating certificate for user ${userId} for course "${courseTitle}"`);
    
    // Simulate an async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success
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
 * Fetches certificates for a specific user
 * @param userId User ID
 * @returns Array of user certificates
 */
export const getUserCertificates = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_certificates")
      .select("*")
      .eq("user_id", userId)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching user certificates:", error);
    throw error;
  }
};

/**
 * Downloads a certificate by its ID
 * @param certificateId Certificate ID
 * @returns Object with success status, potentially error message, and base64 data
 */
export const downloadCertificate = async (certificateId: string): Promise<{ 
  success: boolean; 
  error?: string;
  data?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("certificates")
      .select("certificate_file")
      .eq("id", certificateId)
      .single();

    if (error) throw error;
    
    if (!data || !data.certificate_file) {
      return {
        success: false,
        error: "Certificate file not found"
      };
    }

    // In a real implementation, this would either return a URL or the actual file content
    // For now, we'll simulate returning base64 PDF data
    // Simulated base64 data for an empty PDF
    const simulatedBase64 = "JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDEgMCBSIC9MYXN0TW9kaWZpZWQgKEQpIC9SZXNvdXJjZXMgMiAwIFIgL01lZGlhQm94IFswIDAgNjEyLjAwMDAwMCA3OTIuMDAwMDAwXSAvQ29udGVudHMgNiAwIFIgL0Nyb3BCb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDYxMi4wMDAwMDAgNzkyLjAwMDAwMF0gL0JsZWVkQm94IFswLjAwMDAwMCAwLjAwMDAwMCA2MTIuMDAwMDAwIDc5Mi4wMDAwMDBdIC9UcmltQm94IFswLjAwMDAwMCAwLjAwMDAwMCA2MTIuMDAwMDAwIDc5Mi4wMDAwMDBdIC9BcnRCb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDYxMi4wMDAwMDAgNzkyLjAwMDAwMF0gL1JvdGF0ZSAwPj4KZW5kb2JqCjYgMCBvYmoKPDwgL0xlbmd0aCA2NTQ0ID4+CnN0cmVhbQogICAgCmVuZHN0cmVhbQplbmRvYmoKMSAwIG9iago8PCAvVHlwZSAvUGFnZXMgL0tpZHMgWyA1IDAgUiBdIC9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMSAwIFIgL01ldGFkYXRhIDQgMCBSID4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA2NTE1Pj4Kc3RyZWFtCiAgICAKZW5kc3RyZWFtCmVuZG9iagoyIDAgb2JqCjw8IC9Qcm9jU2V0IFsvUERGIC9UZXh0IC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJXSAvRm9udCA8PCAvRTFNSkdGIDE1IDAgUiA+PiAvWE9iamVjdCA8PD4+IC9FeHRHU3RhdGUgPDw+PiAvQ29sb3JTcGFjZSA8PCAvRGVmYXVsdFJHQiA5IDAgUiA+Pj4+CmVuZG9iagowIDAgb2JqCjw8L1R5cGUgL0ZEUiAvRmlsdGVyIC9GbGF0ZURlY29kZSAvTGVuZ3RoIDI2OT4+CnN0cmVhbQp4ADIwMkkyMDIyIOWkh+Wkh+WkhzIyMjIyMjAyMjA2MjIyMjIyMjIyMg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KZW5kc3RyZWFtCnN0YXJ0eHJlZiA4MTQwIiUlRU9GCg==";
    
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
