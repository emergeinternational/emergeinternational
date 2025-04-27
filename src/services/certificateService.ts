
import { supabase } from "@/integrations/supabase/client";

interface CertificateSettings {
  id: string;
  min_courses_required: number;
  min_workshops_required: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

interface UserCertificate {
  id: string;
  user_id: string;
  course_title: string;
  issue_date: string;
  expiry_date?: string;
  certificate_file?: string;
  created_at: string;
  updated_at: string;
}

interface CertificateEligibility {
  id: string;
  user_id: string;
  online_courses_completed: number;
  workshops_completed: number;
  is_eligible: boolean;
  admin_approved: boolean;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  updated_at: string;
}

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

export const generateCertificate = async (
  userId: string,
  courseTitle: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user is approved for certificate
    const { data: eligibilityData, error: eligibilityError } = await supabase
      .from('certificate_eligibility')
      .select('admin_approved')
      .eq('user_id', userId)
      .single();
    
    if (eligibilityError) throw eligibilityError;
    if (!eligibilityData?.admin_approved) {
      return { 
        success: false,
        error: "User is not approved for certificate generation"
      };
    }
    
    // Create certificate record
    const { error: insertError } = await supabase
      .from('user_certificates')
      .insert({
        user_id: userId,
        course_title: courseTitle,
        issue_date: new Date().toISOString(),
        expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
        certificate_file: `certificate_${userId}_${new Date().getTime()}.pdf`
      });
    
    if (insertError) throw insertError;
    
    return { success: true };
  } catch (error) {
    console.error("Error generating certificate:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

export const getUserCertificates = async (userId: string): Promise<UserCertificate[]> => {
  try {
    const { data, error } = await supabase
      .from('user_certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user certificates:", error);
    throw error;
  }
};

export const downloadCertificate = async (certificateId: string): Promise<{ 
  success: boolean; 
  error?: string;
  data?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('user_certificates')
      .select('certificate_file')
      .eq('id', certificateId)
      .single();

    if (error) throw error;
    
    if (!data || !data.certificate_file) {
      return {
        success: false,
        error: "Certificate file not found"
      };
    }

    // In a real implementation, this would fetch the actual file
    // For now, return a simulated base64 PDF
    const simulatedBase64 = "JVBERi0xLjcKJeLjz9MKNSAwIG9iago8..."; // Truncated for brevity
    
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

export const getCertificateSettings = async (): Promise<CertificateSettings> => {
  try {
    const { data, error } = await supabase
      .from('certificate_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    
    return data || { 
      id: '',
      min_courses_required: 5, 
      min_workshops_required: 3 
    };
  } catch (error) {
    console.error("Error fetching certificate settings:", error);
    return { 
      id: '',
      min_courses_required: 5, 
      min_workshops_required: 3 
    };
  }
};

export const updateCertificateSettings = async (
  settings: Pick<CertificateSettings, 'min_courses_required' | 'min_workshops_required'>
): Promise<boolean> => {
  try {
    const { data: existingSettings, error: fetchError } = await supabase
      .from('certificate_settings')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    if (!existingSettings) {
      const { error: insertError } = await supabase
        .from('certificate_settings')
        .insert({
          min_courses_required: settings.min_courses_required,
          min_workshops_required: settings.min_workshops_required,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });
        
      if (insertError) throw insertError;
    } else {
      const { error: updateError } = await supabase
        .from('certificate_settings')
        .update({
          min_courses_required: settings.min_courses_required,
          min_workshops_required: settings.min_workshops_required,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', existingSettings.id);
        
      if (updateError) throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating certificate settings:", error);
    return false;
  }
};

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
