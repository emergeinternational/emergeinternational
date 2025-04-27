
import { supabase } from "@/integrations/supabase/client";
import { CertificateEligibility } from "./types";
import { getCertificateSettings } from "./settingsService";

/**
 * Fetch all users who are eligible for certificates
 */
export const getEligibleUsers = async (): Promise<CertificateEligibility[]> => {
  try {
    const { data, error } = await supabase
      .from('certificate_eligibility')
      .select(`
        *,
        profiles:profiles(full_name, email)
      `);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching eligible users:", error);
    throw error;
  }
};

/**
 * Update a user's certificate approval status
 */
export const updateCertificateApproval = async (
  userId: string,
  isApproved: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('certificate_eligibility')
      .update({ 
        admin_approved: isApproved,
        status: isApproved ? 'approved' : 'denied'
      })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating certificate approval:", error);
    return false;
  }
};

/**
 * Check if a user meets the requirements for certificate eligibility
 */
export const userMeetsRequirements = async (user: any): Promise<boolean> => {
  try {
    const settings = await getCertificateSettings();
    
    const onlineCoursesCompleted = user.online_courses_completed || 0;
    const workshopsCompleted = user.workshops_completed || 0;
    
    return onlineCoursesCompleted >= settings.min_courses_required && 
           workshopsCompleted >= settings.min_workshops_required;
  } catch (error) {
    console.error("Error checking if user meets requirements:", error);
    return false;
  }
};
