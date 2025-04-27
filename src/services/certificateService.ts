
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

interface Certificate {
  id: string;
  user_id: string;
  course_title: string;
  issue_date: string;
  certificate_data: string;
  status: string;
  last_downloaded_at?: string;
  created_at: string;
  updated_at: string;
}

interface CertificateData {
  certificate_data: string;
  course_title: string;
}

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

export const getUserCertificates = async (userId: string): Promise<Certificate[]> => {
  try {
    type GetUserCertificatesResponse = {
      id: string;
      user_id: string;
      course_title: string;
      issue_date: string;
      certificate_data: string;
      status: string;
      last_downloaded_at: string | null;
      created_at: string;
      updated_at: string;
    }[];

    const { data, error } = await supabase
      .rpc<GetUserCertificatesResponse>('get_user_certificates', { p_user_id: userId });

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
      .rpc<CertificateData>('get_certificate_data', { p_certificate_id: certificateId });

    if (error || !data) {
      console.error("Error fetching certificate:", error);
      return { success: false, error: error?.message || "Certificate not found" };
    }

    // Update the downloaded timestamp using RPC to maintain security
    await supabase.rpc('update_certificate_download_timestamp', {
      p_certificate_id: certificateId
    });

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
