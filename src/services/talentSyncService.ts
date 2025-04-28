
import { supabase } from "@/integrations/supabase/client";
import { TalentApplication } from "@/types/talentTypes";

/**
 * Maps talent category values to valid database values
 */
const mapCategoryToValidType = (category: string | null): string => {
  if (!category) return 'other';
  
  // Map to lowercase for consistency
  const lowerCategory = category.toLowerCase();
  
  // Basic mapping to ensure compatibility with constraints
  if (lowerCategory.includes('model')) return 'model';
  if (lowerCategory.includes('performer') || 
      lowerCategory.includes('singer') || 
      lowerCategory.includes('dancer') || 
      lowerCategory.includes('actor')) return 'performer';
  if (lowerCategory.includes('design')) return 'designer';
  
  // Default fallback - ensure this value is allowed by constraints
  return 'other';
};

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
      category_type: mapCategoryToValidType(submission.category),
      gender: submission.gender,
      portfolio_url: submission.portfolio_url,
      measurements: submission.measurements,
      created_at: submission.created_at,
      sync_status: 'synced'
    }));
    
    // Insert into talent_applications
    const { error: insertError } = await supabase
      .from('talent_applications')
      .insert(applicationData);
    
    if (insertError) {
      console.error("Error inserting synced applications:", insertError);
      return { success: false, transferredCount: 0, errorMessage: insertError.message };
    }
    
    // Update sync status for these records
    const submissionIds = newSubmissions.map(submission => submission.id);
    const { error: updateError } = await supabase
      .from('emerge_submissions')
      .update({ sync_status: 'synced' })
      .in('id', submissionIds);
    
    if (updateError) {
      console.error("Error updating sync status:", updateError);
      // Non-critical error, proceed anyway
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
 * Initiates a forced sync via the Edge Function
 * This is more powerful than the client-side sync as it uses admin privileges
 */
export async function forceSyncTalentData(): Promise<{
  success: boolean;
  syncedCount?: number;
  message?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('education-automation', {
      body: { 
        operation: 'talent-sync',
        forceSync: true 
      }
    });

    if (error) {
      console.error("Error in force sync:", error);
      return {
        success: false,
        error: error.message
      };
    }

    if (data.operations?.talentSync) {
      return {
        success: data.operations.talentSync.success,
        syncedCount: data.operations.talentSync.syncedCount || 0,
        message: data.operations.talentSync.message || `Successfully synced ${data.operations.talentSync.syncedCount || 0} records`
      };
    }

    return {
      success: true,
      syncedCount: 0,
      message: "No sync operation was performed"
    };
  } catch (error) {
    console.error("Error in forceSyncTalentData:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred during force sync" 
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

/**
 * Performs a one-time comprehensive migration of all records from emerge_submissions to talent_applications
 * with careful handling of duplicates and data integrity
 */
export async function performFullTalentDataMigration(): Promise<{
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
}> {
  console.log("Starting full talent data migration process");
  
  try {
    // 1. Fetch all records from emerge_submissions
    const { data: emergeSubmissions, error: fetchError } = await supabase
      .from('emerge_submissions')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      console.error("Error fetching emerge submissions:", fetchError);
      return {
        success: false,
        migratedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [fetchError.message]
      };
    }
    
    if (!emergeSubmissions || emergeSubmissions.length === 0) {
      console.log("No records found in emerge_submissions table");
      return {
        success: true,
        migratedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        errors: []
      };
    }
    
    // 2. Fetch all existing records from talent_applications to check for duplicates
    const { data: existingApplications, error: existingError } = await supabase
      .from('talent_applications')
      .select('email, phone');
    
    if (existingError) {
      console.error("Error fetching existing applications:", existingError);
      return {
        success: false,
        migratedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [existingError.message]
      };
    }
    
    // 3. Create lookup sets for quick duplicate checking
    const existingEmails = new Set(existingApplications?.map(app => app.email?.toLowerCase()) || []);
    const existingPhones = new Set(existingApplications?.map(app => app.phone) || []);
    
    // 4. Filter and prepare records for migration
    const recordsToMigrate = [];
    const skippedRecords = [];
    const errors = [];
    
    for (const submission of emergeSubmissions) {
      // Skip if email already exists in talent_applications
      if (existingEmails.has(submission.email?.toLowerCase())) {
        console.log(`Skipping record with duplicate email: ${submission.email}`);
        skippedRecords.push(submission);
        continue;
      }
      
      // Skip if phone exists and is not null/empty
      if (submission.phone_number && existingPhones.has(submission.phone_number)) {
        console.log(`Skipping record with duplicate phone: ${submission.phone_number}`);
        skippedRecords.push(submission);
        continue;
      }
      
      // Prepare record for migration with proper field mapping
      try {
        recordsToMigrate.push({
          full_name: submission.full_name || 'Unknown',
          email: submission.email,
          phone: submission.phone_number,
          age: typeof submission.age === 'number' ? submission.age : null,
          status: 'pending',
          social_media: {
            instagram: submission.instagram || null,
            telegram: submission.telegram || null,
            tiktok: submission.tiktok || null
          },
          notes: submission.talent_description || null,
          category_type: mapCategoryToValidType(submission.category),
          gender: submission.gender || null,
          portfolio_url: submission.portfolio_url || null,
          measurements: submission.measurements || null,
          created_at: submission.created_at || new Date().toISOString(),
          sync_status: 'synced'
        });
        
        // Add migrated email to existing sets to avoid duplicate migrations in the same batch
        existingEmails.add(submission.email?.toLowerCase());
        if (submission.phone_number) {
          existingPhones.add(submission.phone_number);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error during record preparation');
        console.error(`Error preparing record ${submission.id}:`, error);
        errors.push(`Error preparing record ${submission.id}: ${error.message}`);
      }
    }
    
    // 5. Migrate records in batches to avoid request size limits
    const BATCH_SIZE = 50;
    let migratedCount = 0;
    let errorCount = errors.length;
    
    for (let i = 0; i < recordsToMigrate.length; i += BATCH_SIZE) {
      const batch = recordsToMigrate.slice(i, i + BATCH_SIZE);
      
      if (batch.length === 0) continue;
      
      try {
        console.log(`Migrating batch of ${batch.length} records (${i + 1} to ${i + batch.length})`);
        const { error: insertError } = await supabase
          .from('talent_applications')
          .insert(batch);
        
        if (insertError) {
          console.error(`Error inserting batch (${i + 1} to ${i + batch.length}):`, insertError);
          errors.push(`Batch insertion error (records ${i + 1} to ${i + batch.length}): ${insertError.message}`);
          errorCount++;
        } else {
          migratedCount += batch.length;
          console.log(`Successfully migrated batch of ${batch.length} records`);
          
          // Update sync_status for the successfully migrated records
          const submissionEmails = batch.map(record => record.email);
          await supabase
            .from('emerge_submissions')
            .update({ sync_status: 'synced' })
            .in('email', submissionEmails);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`Error processing batch (${i + 1} to ${i + batch.length}):`, error);
        errors.push(`Batch processing error (records ${i + 1} to ${i + batch.length}): ${error.message}`);
        errorCount++;
      }
      
      // Small delay between batches to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 6. Return comprehensive report
    const success = errorCount === 0;
    console.log(`Migration completed with: ${migratedCount} migrated, ${skippedRecords.length} skipped, ${errorCount} errors`);
    
    return {
      success,
      migratedCount,
      skippedCount: skippedRecords.length,
      errorCount,
      errors
    };
  } catch (error) {
    console.error("Critical error during talent data migration:", error);
    return {
      success: false,
      migratedCount: 0,
      skippedCount: 0,
      errorCount: 1,
      errors: [error instanceof Error ? error.message : "Unknown critical error during migration"]
    };
  }
}

/**
 * Gets the recent synchronization logs
 */
export async function getSyncLogs(limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('function_name', 'sync_emerge_submission_to_talent')
      .order('executed_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching sync logs:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getSyncLogs:", error);
    return [];
  }
}

/**
 * Gets sync status overview using the talent_sync_status view
 */
export async function getSyncStatusSummary(): Promise<{
  totalSubmissions: number;
  syncedCount: number;
  pendingCount: number;
  syncPercentage: number;
  error?: string;
}> {
  try {
    // Use the talent_sync_status view to get sync status
    const { data, error } = await supabase
      .from('talent_sync_status')
      .select('*');
    
    if (error) {
      throw new Error(`Error fetching sync status: ${error.message}`);
    }
    
    const totalSubmissions = data?.length || 0;
    const syncedCount = data?.filter(item => item.exists_in_talent_applications).length || 0;
    const pendingCount = totalSubmissions - syncedCount;
    const syncPercentage = totalSubmissions > 0 ? (syncedCount / totalSubmissions) * 100 : 0;
    
    return {
      totalSubmissions,
      syncedCount,
      pendingCount,
      syncPercentage: Math.round(syncPercentage * 10) / 10 // Round to 1 decimal place
    };
  } catch (error) {
    console.error("Error in getSyncStatusSummary:", error);
    return {
      totalSubmissions: 0,
      syncedCount: 0,
      pendingCount: 0,
      syncPercentage: 0,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
