
import { supabase } from "@/integrations/supabase/client";

export const getEligibleUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("certificate_eligibility")
      .select("*, profiles(*)");

    if (error) {
      console.error("Error fetching eligible users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getEligibleUsers:", error);
    return [];
  }
};

export const updateCertificateApproval = async (
  userId: string,
  approved: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("certificate_eligibility")
      .update({ admin_approved: approved })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating certificate approval:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in updateCertificateApproval:", error);
    return false;
  }
};

export const generateCertificate = async (
  userId: string,
  courseTitle: string,
  completionDate?: string
): Promise<{ success: boolean; certificateId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-certificate', {
      body: { userId, courseTitle, completionDate }
    });

    if (error) {
      console.error("Error generating certificate:", error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      certificateId: data.certificateId,
    };
  } catch (error) {
    console.error("Unexpected error in generateCertificate:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};

export const getUserCertificates = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .order("issue_date", { ascending: false });

    if (error) {
      console.error("Error fetching user certificates:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getUserCertificates:", error);
    return [];
  }
};

export const downloadCertificate = async (certificateId: string): Promise<{ success: boolean; data?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("certificates")
      .select("certificate_data, course_title")
      .eq("id", certificateId)
      .single();

    if (error || !data) {
      console.error("Error fetching certificate:", error);
      return { success: false, error: error?.message || "Certificate not found" };
    }

    // Update the downloaded timestamp
    await supabase
      .from("certificates")
      .update({ last_downloaded_at: new Date().toISOString() })
      .eq("id", certificateId);

    return { 
      success: true, 
      data: data.certificate_data,
    };
  } catch (error) {
    console.error("Unexpected error in downloadCertificate:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};
