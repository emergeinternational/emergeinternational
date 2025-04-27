
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

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
  certificate_data: string;
  issue_date: string;
  status: string;
  last_downloaded_at?: string;
  created_at: string;
  updated_at: string;
}

interface GenerateCertificateResponse {
  certificateId: string;
}

export const generateCertificate = async (
  userId: string,
  courseTitle: string,
  completionDate?: string
): Promise<{ success: boolean; certificateId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke<GenerateCertificateResponse>('generate-certificate', {
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
    // Using any type to bypass TypeScript's strict checking since our table is not in the generated types
    const { data: certificates, error } = await supabase
      .from('certificates' as any)
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    if (error) {
      console.error("Error fetching user certificates:", error);
      return [];
    }

    return (certificates as unknown as Certificate[]) || [];
  } catch (error) {
    console.error("Unexpected error in getUserCertificates:", error);
    return [];
  }
};

export const downloadCertificate = async (certificateId: string): Promise<{ success: boolean; data?: string; error?: string }> => {
  try {
    // Using any type to bypass TypeScript's strict checking
    const { data, error } = await supabase
      .from('certificates' as any)
      .select('certificate_data, course_title')
      .eq('id', certificateId)
      .single();

    if (error || !data) {
      console.error("Error fetching certificate:", error);
      return { success: false, error: error?.message || "Certificate not found" };
    }

    // Safely access certificate_data only if data exists
    const certificateData = data?.certificate_data;
    
    if (!certificateData) {
      return { success: false, error: "Certificate data not found" };
    }

    // Using any type to bypass TypeScript's strict checking
    const { error: updateError } = await supabase
      .from('certificates' as any)
      .update({ last_downloaded_at: new Date().toISOString() })
      .eq('id', certificateId);
    
    if (updateError) {
      console.warn("Failed to update download timestamp:", updateError);
    }

    return { 
      success: true, 
      data: certificateData,
    };
  } catch (error) {
    console.error("Unexpected error in downloadCertificate:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};
