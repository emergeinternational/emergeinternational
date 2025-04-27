
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
