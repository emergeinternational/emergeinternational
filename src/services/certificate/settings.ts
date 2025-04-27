import { supabase } from "@/integrations/supabase/client";
import { CertificateSettings } from "./types";

/**
 * Gets certificate settings from the database
 * @returns Object containing certificate settings
 */
export const getCertificateSettings = async (): Promise<CertificateSettings> => {
  try {
    const { data, error } = await supabase
      .from("certificate_settings")
      .select("*")
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    
    return data || { min_courses_required: 5, min_workshops_required: 3 };
  } catch (error) {
    console.error("Error fetching certificate settings:", error);
    return { min_courses_required: 5, min_workshops_required: 3 };
  }
};

/**
 * Updates certificate settings
 * @param settings Settings object with min courses and workshops required
 * @returns Boolean indicating success
 */
export const updateCertificateSettings = async (
  settings: CertificateSettings
): Promise<boolean> => {
  try {
    // First, get the settings record ID
    const { data, error: fetchError } = await supabase
      .from("certificate_settings")
      .select("id")
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) throw fetchError;
    
    if (!data) {
      // If no settings record exists yet, create one
      const { error: insertError } = await supabase
        .from("certificate_settings")
        .insert({
          min_courses_required: settings.min_courses_required,
          min_workshops_required: settings.min_workshops_required,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });
        
      if (insertError) throw insertError;
    } else {
      // Otherwise update the existing record
      const { error: updateError } = await supabase
        .from("certificate_settings")
        .update({
          min_courses_required: settings.min_courses_required,
          min_workshops_required: settings.min_workshops_required,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", data.id);
        
      if (updateError) throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating certificate settings:", error);
    return false;
  }
};
