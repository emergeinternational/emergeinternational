
import { supabase } from "@/integrations/supabase/client";
import { getCertificateSettings } from "./settings";
import { CertificateEligibility } from "./types";

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
    
    return data as CertificateEligibility[];
  } catch (error) {
    console.error("Error fetching eligible users:", error);
    return [];
  }
};

export const updateCertificateApproval = async (
  userId: string,
  isApproved: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("certificate_eligibility")
      .update({ 
        admin_approved: isApproved,
        status: isApproved ? 'approved' : 'rejected' // This is now consistent with the type definition
      })
      .eq("user_id", userId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating certificate approval:", error);
    return false;
  }
};

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
