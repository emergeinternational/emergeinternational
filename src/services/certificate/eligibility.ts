
import { supabase } from "@/integrations/supabase/client";
import { CertificateEligibility, EligibleUser, CertificateStatus } from "./types";
import { getCertificateSettings } from "./settings";

export const checkUserEligibility = async (
  userId: string
): Promise<CertificateEligibility> => {
  try {
    const settings = await getCertificateSettings();
    
    // Get user course progress
    const { data: courseData, error: courseError } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed");
    
    if (courseError) throw courseError;
    
    // Calculate completed courses and check completion status
    const onlineCoursesCompleted = courseData?.length || 0;
    const workshopsCompleted = 0; // Placeholder - implement workshop completion logic
    
    const isEligible = onlineCoursesCompleted >= settings.min_courses_required && 
                       workshopsCompleted >= settings.min_workshops_required;
    
    // Define the status based on eligibility
    const initialStatus: CertificateStatus = isEligible ? 'pending' : 'ineligible';
    
    // Check or create eligibility record
    const { data: eligibilityData, error: eligibilityError } = await supabase
      .from("certificate_eligibility")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (eligibilityError) throw eligibilityError;
    
    let certificateEligibility: CertificateEligibility;
    
    if (!eligibilityData) {
      // Create new eligibility record
      const { data: newEligibilityData, error: insertError } = await supabase
        .from("certificate_eligibility")
        .insert({
          user_id: userId,
          online_courses_completed: onlineCoursesCompleted,
          workshops_completed: workshopsCompleted,
          is_eligible: isEligible,
          admin_approved: false,
          status: initialStatus
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      certificateEligibility = newEligibilityData as CertificateEligibility;
    } else {
      // Determine the new status based on eligibility and approval
      let newStatus: CertificateStatus = initialStatus;
      if (isEligible && eligibilityData.admin_approved) {
        newStatus = 'approved';
      } else if (!isEligible) {
        newStatus = 'ineligible';
      }
      
      // Update existing eligibility record
      const { data: updatedEligibility, error: updateError } = await supabase
        .from("certificate_eligibility")
        .update({
          online_courses_completed: onlineCoursesCompleted,
          workshops_completed: workshopsCompleted,
          is_eligible: isEligible,
          status: newStatus
        })
        .eq("user_id", userId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      certificateEligibility = updatedEligibility as CertificateEligibility;
    }
    
    return {
      ...certificateEligibility,
      min_courses_required: settings.min_courses_required,
      min_workshops_required: settings.min_workshops_required
    };
  } catch (error) {
    console.error("Error checking certificate eligibility:", error);
    throw error;
  }
};

export const getUsersEligibleForCertificates = async (): Promise<EligibleUser[]> => {
  try {
    const { data, error } = await supabase
      .from("certificate_eligibility")
      .select(`
        *,
        profiles:user_id(email, full_name)
      `)
      .eq("is_eligible", true)
      .eq("admin_approved", false)
      .eq("status", 'pending')
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      email: item.profiles?.email,
      full_name: item.profiles?.full_name,
      online_courses_completed: item.online_courses_completed,
      workshops_completed: item.workshops_completed,
      is_eligible: item.is_eligible,
      admin_approved: item.admin_approved,
      status: item.status
    }));
  } catch (error) {
    console.error("Error fetching eligible users:", error);
    return [];
  }
};

// Alias for backward compatibility
export const getEligibleUsers = getUsersEligibleForCertificates;

export const getUsersByStatus = async (status: CertificateStatus): Promise<EligibleUser[]> => {
  try {
    const { data, error } = await supabase
      .from("certificate_eligibility")
      .select(`
        *,
        profiles:user_id(email, full_name)
      `)
      .eq("status", status)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      email: item.profiles?.email,
      full_name: item.profiles?.full_name,
      online_courses_completed: item.online_courses_completed,
      workshops_completed: item.workshops_completed,
      is_eligible: item.is_eligible,
      admin_approved: item.admin_approved,
      status: item.status
    }));
  } catch (error) {
    console.error(`Error fetching users with status ${status}:`, error);
    return [];
  }
};

export const updateCertificateApproval = async (
  userId: string,
  approved: boolean
): Promise<boolean> => {
  try {
    const newStatus: CertificateStatus = approved ? 'approved' : 'rejected';
    
    const { error } = await supabase
      .from("certificate_eligibility")
      .update({
        admin_approved: approved,
        status: newStatus
      })
      .eq("user_id", userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating certificate approval:", error);
    return false;
  }
};

export const userMeetsRequirements = async (userId: string): Promise<boolean> => {
  try {
    const eligibility = await checkUserEligibility(userId);
    return eligibility.is_eligible && eligibility.admin_approved;
  } catch (error) {
    console.error("Error checking if user meets requirements:", error);
    return false;
  }
};
