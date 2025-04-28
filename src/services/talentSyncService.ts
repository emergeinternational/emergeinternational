
import { supabase } from "@/integrations/supabase/client";
import { TalentApplication } from "@/types/talentTypes";

/**
 * Syncs data from emerge_submissions to talent_applications
 * This function moves records that exist in emerge_submissions but not in talent_applications
 */
export async function syncEmergeSubmissions(): Promise<{ 
  success: boolean;
  transferredCount: number;
  errorMessage?: string 
}> {
  try {
    console.log("Starting sync from emerge_submissions to talent_applications");
    
    // Get all records from emerge_submissions
    const { data: emergeSubmissions, error: fetchError } = await supabase
      .from('emerge_submissions')
      .select('*');
    
    if (fetchError) {
      console.error("Error fetching emerge submissions:", fetchError);
      return { success: false, transferredCount: 0, errorMessage: fetchError.message };
    }
    
    // Get existing emails in talent_applications to avoid duplicates
    const { data: existingApplications, error: existingError } = await supabase
      .from('talent_applications')
      .select('email');
    
    if (existingError) {
      console.error("Error fetching existing applications:", existingError);
      return { success: false, transferredCount: 0, errorMessage: existingError.message };
    }
    
    const existingEmails = new Set(existingApplications?.map(app => app.email) || []);
    
    // Filter out submissions that already exist in applications
    const newSubmissions = emergeSubmissions?.filter(
      submission => !existingEmails.has(submission.email)
    ) || [];
    
    if (newSubmissions.length === 0) {
      console.log("No new submissions to sync");
      return { success: true, transferredCount: 0 };
    }
    
    // Format data for talent_applications table
    const applicationData = newSubmissions.map(submission => ({
      full_name: submission.full_name,
      email: submission.email,
      phone: submission.phone_number,
      age: submission.age,
      status: 'pending',
      social_media: {
        instagram: submission.instagram,
        telegram: submission.telegram,
        tiktok: submission.tiktok
      },
      notes: submission.talent_description,
      category_type: submission.category,
      gender: submission.gender,
      portfolio_url: submission.portfolio_url,
      measurements: submission.measurements,
      created_at: submission.created_at
    }));
    
    // Insert into talent_applications
    const { error: insertError } = await supabase
      .from('talent_applications')
      .insert(applicationData);
    
    if (insertError) {
      console.error("Error inserting synced applications:", insertError);
      return { success: false, transferredCount: 0, errorMessage: insertError.message };
    }
    
    console.log(`Successfully synced ${applicationData.length} records`);
    return { success: true, transferredCount: applicationData.length };
  } catch (error) {
    console.error("Error in syncEmergeSubmissions:", error);
    return { 
      success: false, 
      transferredCount: 0, 
      errorMessage: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Gets summary counts of registrations in both tables
 */
export async function getTalentRegistrationCounts(): Promise<{
  talentApplications: number;
  emergeSubmissions: number;
  error?: string;
}> {
  try {
    const { count: talentCount, error: talentError } = await supabase
      .from('talent_applications')
      .select('*', { count: 'exact', head: true });
      
    const { count: emergeCount, error: emergeError } = await supabase
      .from('emerge_submissions')
      .select('*', { count: 'exact', head: true });
      
    if (talentError || emergeError) {
      throw new Error(talentError?.message || emergeError?.message);
    }
    
    return {
      talentApplications: talentCount || 0,
      emergeSubmissions: emergeCount || 0
    };
  } catch (error) {
    console.error("Error getting registration counts:", error);
    return {
      talentApplications: 0,
      emergeSubmissions: 0,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
