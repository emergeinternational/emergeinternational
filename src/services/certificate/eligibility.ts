
import { supabase } from "@/integrations/supabase/client";
import { getCertificateSettings } from "./settings";
import { CertificateEligibility } from "./types";

/**
 * Fetches users who are eligible for certificates
 * @returns Array of users with their certificate eligibility status
 */
export const getEligibleUsers = async (): Promise<CertificateEligibility[]> => {
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
 * Checks if a user meets the certificate requirements
 * @param user User object with course and workshop counts
 * @returns Boolean indicating if user meets requirements
 */
export const userMeetsRequirements = async (user: any): Promise<boolean> => {
  try {
    const settings = await getCertificateSettings();
    
    const onlineCoursesCompleted = user.online_courses_completed || 0;
    const workshopsCompleted = user.workshops_completed || 0;
    
    return onlineCoursesCompleted >= settings.min_courses_required 
      && workshopsCompleted >= settings.min_workshops_required;
  } catch (error) {
    console.error("Error checking if user meets requirements:", error);
    return false;
  }
};
