
import { supabase } from "@/integrations/supabase/client";
import { CertificateEligibility, CertificateStatus, CertificateSettings, EligibleUser } from "./types";
import { getCertificateSettings } from "./settings";

// Check eligibility for a user
export const checkEligibility = async (userId: string): Promise<CertificateEligibility> => {
  try {
    // First, check if the user already has an eligibility record
    const { data: existingRecord, error: existingError } = await supabase
      .from("certificate_eligibility")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error("Error checking existing eligibility:", existingError);
    }

    if (existingRecord) {
      return existingRecord as CertificateEligibility;
    }

    // Get settings for minimum requirements
    const settings = await getCertificateSettings();

    // Count completed courses and workshops
    const { data: courseProgress, error: courseError } = await supabase
      .from("user_course_progress")
      .select("course_id")
      .eq("user_id", userId)
      .eq("status", "completed");

    if (courseError) {
      console.error("Error fetching course progress:", courseError);
    }

    // In a real system, also check workshop completions
    // This is a placeholder for now
    const workshopsCompleted = 0;

    const coursesCompleted = courseProgress?.length || 0;

    // Determine eligibility
    const isEligible = coursesCompleted >= settings.min_courses_required && 
                      workshopsCompleted >= settings.min_workshops_required;

    // Determine status
    let status: CertificateStatus = 'pending';
    if (!isEligible) {
      status = 'ineligible';
    }

    const eligibilityData = {
      user_id: userId,
      online_courses_completed: coursesCompleted,
      workshops_completed: workshopsCompleted,
      is_eligible: isEligible,
      admin_approved: false,
      status: status,
    };

    // Insert a new record
    const { data: insertedRecord, error: insertError } = await supabase
      .from("certificate_eligibility")
      .insert([eligibilityData])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating eligibility record:", insertError);
      return eligibilityData as CertificateEligibility;
    }

    return insertedRecord as CertificateEligibility;
  } catch (error) {
    console.error("Error in checkEligibility:", error);
    throw error;
  }
};

// Get eligibility status for a user
export const getEligibilityStatus = async (userId: string): Promise<CertificateEligibility | null> => {
  try {
    const { data, error } = await supabase
      .from("certificate_eligibility")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching eligibility status:", error);
      return null;
    }

    if (!data) {
      // If no record exists, check eligibility
      return await checkEligibility(userId);
    }

    return data as CertificateEligibility;
  } catch (error) {
    console.error("Error in getEligibilityStatus:", error);
    return null;
  }
};

// Update eligibility status for a user by admin
export const updateEligibilityStatus = async (
  userId: string, 
  status: CertificateStatus, 
  adminId: string
): Promise<boolean> => {
  try {
    let adminApproved = false;
    
    if (status === 'approved') {
      adminApproved = true;
    }
    
    const { error } = await supabase
      .from("certificate_eligibility")
      .update({ 
        status: status, 
        admin_approved: adminApproved,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating eligibility status:", error);
      return false;
    }

    // Log the action
    await supabase.rpc('log_user_action', {
      action_type: 'update_certificate_eligibility',
      target_user_id: userId,
      action_details: { 
        status, 
        admin_id: adminId,
        timestamp: new Date().toISOString()
      }
    });

    return true;
  } catch (error) {
    console.error("Error in updateEligibilityStatus:", error);
    return false;
  }
};

// Admin: approve or reject certificate eligibility
export const adminUpdateEligibility = async (
  userId: string, 
  action: 'approved' | 'rejected', 
  adminId: string,
  reason?: string
): Promise<boolean> => {
  try {
    const status: CertificateStatus = action;
    const { error } = await supabase
      .from("certificate_eligibility")
      .update({ 
        status, 
        admin_approved: action === 'approved',
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating eligibility as admin:", error);
      return false;
    }

    // Log the action
    await supabase.rpc('log_user_action', {
      action_type: 'admin_certificate_decision',
      target_user_id: userId,
      action_details: { 
        action, 
        reason,
        admin_id: adminId,
        timestamp: new Date().toISOString()
      }
    });

    return true;
  } catch (error) {
    console.error("Error in adminUpdateEligibility:", error);
    return false;
  }
};

// Check if user meets certificate requirements
export const userMeetsRequirements = async (userId: string): Promise<boolean> => {
  try {
    const settings = await getCertificateSettings();
    const eligibility = await getEligibilityStatus(userId);
    
    if (!eligibility) return false;
    
    return (
      eligibility.online_courses_completed >= settings.min_courses_required &&
      eligibility.workshops_completed >= settings.min_workshops_required
    );
  } catch (error) {
    console.error("Error checking if user meets requirements:", error);
    return false;
  }
};

// Get users eligible for certificates
export const getEligibleUsers = async (): Promise<EligibleUser[]> => {
  try {
    const { data, error } = await supabase
      .from("certificate_eligibility")
      .select(`
        *,
        profiles:user_id (
          full_name, 
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching eligible users:", error);
      return [];
    }
    
    return data as EligibleUser[];
  } catch (error) {
    console.error("Error in getEligibleUsers:", error);
    return [];
  }
};

// Update certificate approval status
export const updateCertificateApproval = async (
  userId: string,
  approved: boolean
): Promise<boolean> => {
  try {
    const status: CertificateStatus = approved ? 'approved' : 'rejected';
    
    const { error } = await supabase
      .from("certificate_eligibility")
      .update({
        admin_approved: approved,
        status,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
      
    if (error) {
      console.error("Error updating certificate approval:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateCertificateApproval:", error);
    return false;
  }
};

// Get users by certificate status
export const getUsersByStatus = async (status: CertificateStatus): Promise<EligibleUser[]> => {
  try {
    const { data, error } = await supabase
      .from("certificate_eligibility")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq("status", status)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(`Error fetching users with status ${status}:`, error);
      return [];
    }
    
    return data as EligibleUser[];
  } catch (error) {
    console.error(`Error in getUsersByStatus for status ${status}:`, error);
    return [];
  }
};
