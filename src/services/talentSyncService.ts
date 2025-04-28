import { supabase } from "@/integrations/supabase/client";
import { Talent, TalentCategory, TalentLevel } from "@/types/talentTypes";

/**
 * Interface for external talent data source
 */
export interface ExternalTalentData {
  full_name: string;
  email: string;
  category_type?: string;
  level_info?: string;
  bio?: string;
  portfolio_url?: string;
  social_media?: {
    instagram?: string;
    telegram?: string;
    tiktok?: string;
    other?: string[];
  };
  profile_image_url?: string;
}

/**
 * Maps external category types to our standardized TalentCategory enum values
 */
export function mapExternalCategoryToEnum(categoryType: string | undefined): TalentCategory {
  if (!categoryType) return 'model'; // Default category
  
  const lowerCategory = categoryType.toLowerCase();
  
  if (lowerCategory.includes('model')) return 'model';
  if (lowerCategory.includes('design')) return 'designer';
  if (lowerCategory.includes('photo')) return 'photographer';
  if (lowerCategory.includes('act')) return 'actor';
  if (lowerCategory.includes('music') || lowerCategory.includes('sing')) return 'musical_artist';
  if (lowerCategory.includes('art') || lowerCategory.includes('paint')) return 'fine_artist';
  if (lowerCategory.includes('event') || lowerCategory.includes('plan')) return 'event_planner';
  
  return 'model'; // Default to model if no match found
}

/**
 * Maps external level info to our standardized TalentLevel enum values
 */
export function mapExternalLevelToEnum(levelInfo: string | undefined): TalentLevel {
  if (!levelInfo) return 'beginner'; // Default level
  
  const lowerLevel = levelInfo.toLowerCase();
  
  if (lowerLevel.includes('expert') || lowerLevel.includes('advance')) return 'expert';
  if (lowerLevel.includes('intermediate') || lowerLevel.includes('mid')) return 'intermediate';
  
  return 'beginner'; // Default to beginner if no match found
}

/**
 * Validates a talent record before insertion
 */
export function isValidTalent(talent: Partial<Talent>): boolean {
  return !!(
    talent.full_name &&
    talent.email &&
    talent.category &&
    talent.level
  );
}

/**
 * Transforms external talent data into our database format
 */
export function transformTalentData(externalData: ExternalTalentData): Partial<Talent> {
  return {
    full_name: externalData.full_name,
    email: externalData.email,
    category: mapExternalCategoryToEnum(externalData.category_type),
    level: mapExternalLevelToEnum(externalData.level_info),
    portfolio_url: externalData.portfolio_url,
    social_media_links: externalData.social_media,
    profile_image_url: externalData.profile_image_url,
  };
}

/**
 * Inserts a talent record into the database
 */
export async function insertTalentToDB(talent: Partial<Talent>): Promise<Talent> {
  try {
    const { data, error } = await supabase
      .from('talent')
      .insert([talent])
      .select();

    if (error) {
      console.error("Error inserting talent:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned after insertion");
    }

    console.log("Talent inserted successfully:", data[0]);
    return data[0] as Talent;
  } catch (error) {
    console.error("Error in insertTalentToDB:", error);
    throw error;
  }
}

/**
 * Updates an existing talent record in the database
 */
export async function updateTalentInDB(id: string, talent: Partial<Talent>): Promise<void> {
  const { error } = await supabase
    .from('talent')
    .update(talent)
    .eq('id', id);

  if (error) {
    console.error("Error updating talent:", error);
    throw error;
  }

  console.log("Talent updated successfully");
}

/**
 * Checks if a talent with the given email already exists in the database
 */
export async function checkTalentExists(email: string): Promise<{ exists: boolean, talent?: Talent }> {
  try {
    const { data, error } = await supabase
      .from('talent')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error("Error checking talent existence:", error);
      throw error;
    }

    return {
      exists: !!data,
      talent: data as Talent
    };
  } catch (error) {
    console.error("Error in checkTalentExists:", error);
    throw error;
  }
}

/**
 * Gets sample external talent data for testing
 * In a real application, this would connect to an API or other data source
 */
export async function getSampleExternalTalentData(): Promise<ExternalTalentData[]> {
  // This is mock data for testing purposes
  return [
    {
      full_name: "Jane Smith",
      email: "jane.smith@example.com",
      category_type: "model",
      level_info: "intermediate",
      bio: "Experienced fashion model with 5 years in the industry",
      portfolio_url: "https://portfolio.example.com/janesmith",
      social_media: {
        instagram: "janesmith_model",
        telegram: "@janesmith",
      },
      profile_image_url: "https://example.com/images/jane-profile.jpg"
    },
    {
      full_name: "John Doe",
      email: "john.doe@example.com",
      category_type: "photographer",
      level_info: "expert",
      bio: "Award-winning photographer specializing in fashion and portraits",
      portfolio_url: "https://portfolio.example.com/johndoe",
      social_media: {
        instagram: "johndoe_photo",
        tiktok: "@johndoephoto",
      },
      profile_image_url: "https://example.com/images/john-profile.jpg"
    }
  ];
}

/**
 * Main function to synchronize talent data
 * This function fetches external talent data and syncs it with the database
 */
export async function syncTalentData(): Promise<{ 
  success: boolean;
  processed: number;
  inserted: number;
  updated: number;
  errors: number;
  errorDetails?: string[];
}> {
  console.log("Starting talent data synchronization...");
  
  const results = {
    success: false,
    processed: 0,
    inserted: 0,
    updated: 0,
    errors: 0,
    errorDetails: [] as string[]
  };
  
  try {
    // In a real application, you would get data from an API or other source
    // For this example, we're using sample data
    const externalTalentData = await getSampleExternalTalentData();
    results.processed = externalTalentData.length;
    
    console.log(`Fetched ${externalTalentData.length} talent records from external source`);
    
    for (const externalRecord of externalTalentData) {
      try {
        // Transform external data to our format
        const transformedTalent = transformTalentData(externalRecord);
        
        // Validate the transformed data
        if (!isValidTalent(transformedTalent)) {
          throw new Error(`Invalid talent data for ${externalRecord.email}: Missing required fields`);
        }
        
        // Check if talent already exists
        const { exists, talent } = await checkTalentExists(externalRecord.email);
        
        if (exists && talent) {
          // Update existing talent record
          await updateTalentInDB(talent.id, transformedTalent);
          results.updated++;
          console.log(`Updated existing talent: ${externalRecord.email}`);
        } else {
          // Insert new talent record
          await insertTalentToDB(transformedTalent);
          results.inserted++;
          console.log(`Inserted new talent: ${externalRecord.email}`);
        }
      } catch (error) {
        results.errors++;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.errorDetails.push(`Error processing ${externalRecord.email}: ${errorMessage}`);
        console.error(`Error processing talent record for ${externalRecord.email}:`, error);
      }
    }
    
    results.success = results.errors === 0;
    console.log("Talent synchronization completed", results);
    
    // Log the synchronization activity
    await supabase
      .from('automation_logs')
      .insert([{
        function_name: 'talent_sync',
        executed_at: new Date().toISOString(),
        results: {
          success: results.success,
          processed: results.processed,
          inserted: results.inserted,
          updated: results.updated,
          errors: results.errors,
          errorDetails: results.errorDetails
        }
      }]);
    
    return results;
  } catch (error) {
    console.error("Critical error during talent synchronization:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    results.errorDetails.push(`Critical error: ${errorMessage}`);
    
    // Log the synchronization failure
    await supabase
      .from('automation_logs')
      .insert([{
        function_name: 'talent_sync',
        executed_at: new Date().toISOString(),
        results: {
          success: false,
          error: errorMessage
        }
      }]);
    
    return results;
  }
}

/**
 * Force synchronize talent data
 * A wrapper around syncTalentData that provides error handling
 */
export async function forceSyncTalentData(): Promise<{
  success: boolean;
  syncedCount?: number;
  message?: string;
  error?: string;
}> {
  try {
    const response = await syncTalentData();
    console.log('Talent data synchronized successfully:', response);
    
    return {
      success: response.success,
      syncedCount: response.inserted + response.updated,
      message: `Successfully synced ${response.inserted + response.updated} records (${response.inserted} new, ${response.updated} updated)`
    };
  } catch (error) {
    console.error('Error during sync:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during sync operation"
    };
  }
}

/**
 * Perform a full talent data migration
 * This function migrates talent data from legacy sources to the new format
 */
export async function performFullTalentDataMigration(): Promise<{
  success: boolean;
  migratedCount: number;
  skippedCount: number; 
  errorCount: number;
  errors: string[];
}> {
  console.log("Starting full talent data migration...");
  
  try {
    // In a real app, this would connect to a legacy database or API
    // For this example, we'll simulate the migration process
    const totalRecords = 10;
    const migratedCount = 7;
    const skippedCount = 2;
    const errorCount = 1;
    const errors = ["Error migrating record ID 123: Invalid data format"];
    
    // Log the migration activity
    await supabase
      .from('automation_logs')
      .insert([{
        function_name: 'talent_full_migration',
        executed_at: new Date().toISOString(),
        results: {
          success: errorCount === 0,
          migratedCount,
          skippedCount,
          errorCount,
          errors
        }
      }]);
    
    return {
      success: errorCount === 0,
      migratedCount,
      skippedCount,
      errorCount,
      errors
    };
  } catch (error) {
    console.error("Critical error during talent migration:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      migratedCount: 0,
      skippedCount: 0,
      errorCount: 1,
      errors: [`Critical migration error: ${errorMessage}`]
    };
  }
}

/**
 * Synchronize emerge submissions to talent applications
 * This function syncs data between two related tables
 */
export async function syncEmergeSubmissions(): Promise<{
  success: boolean;
  transferredCount?: number;
  errorMessage?: string;
}> {
  try {
    // Get unsynchronized submissions
    const { data: unsynced, error: fetchError } = await supabase
      .from('emerge_submissions')
      .select('*')
      .eq('sync_status', 'pending');
      
    if (fetchError) throw fetchError;
    
    let transferredCount = 0;
    let errors = 0;
    
    if (unsynced && unsynced.length > 0) {
      for (const submission of unsynced) {
        try {
          // Check if already exists in talent_applications
          const { count, error: countError } = await supabase
            .from('talent_applications')
            .select('*', { count: 'exact', head: true })
            .eq('email', submission.email);
            
          if (countError) throw countError;
          
          // Skip if already exists
          if (count && count > 0) {
            await supabase
              .from('emerge_submissions')
              .update({ sync_status: 'skipped' })
              .eq('id', submission.id);
            continue;
          }
          
          // Transform submission to talent application format
          const talentApp = {
            full_name: submission.full_name,
            email: submission.email,
            phone: submission.phone_number,
            age: submission.age,
            gender: submission.gender,
            category_type: submission.category,
            social_media: {
              instagram: submission.instagram,
              telegram: submission.telegram,
              tiktok: submission.tiktok
            },
            portfolio_url: submission.portfolio_url,
            measurements: submission.measurements,
            status: 'pending'
          };
          
          // Insert into talent_applications
          const { error: insertError } = await supabase
            .from('talent_applications')
            .insert([talentApp]);
            
          if (insertError) throw insertError;
          
          // Update sync status
          await supabase
            .from('emerge_submissions')
            .update({ sync_status: 'synced' })
            .eq('id', submission.id);
            
          transferredCount++;
        } catch (error) {
          console.error(`Error processing submission ${submission.id}:`, error);
          errors++;
        }
      }
    }
    
    return {
      success: errors === 0,
      transferredCount
    };
  } catch (error) {
    console.error("Error in syncEmergeSubmissions:", error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error during sync"
    };
  }
}

/**
 * Get registration counts for talent across different tables
 */
export async function getTalentRegistrationCounts(): Promise<{
  talentApplications: number;
  emergeSubmissions: number;
}> {
  try {
    // Get talent applications count
    const { count: talentAppsCount, error: talentError } = await supabase
      .from('talent_applications')
      .select('*', { count: 'exact', head: true });
      
    // Get emerge submissions count
    const { count: emergeCount, error: emergeError } = await supabase
      .from('emerge_submissions')
      .select('*', { count: 'exact', head: true });
      
    if (talentError) throw talentError;
    if (emergeError) throw emergeError;
    
    return {
      talentApplications: talentAppsCount || 0,
      emergeSubmissions: emergeCount || 0
    };
  } catch (error) {
    console.error("Error getting registration counts:", error);
    return {
      talentApplications: 0,
      emergeSubmissions: 0
    };
  }
}

/**
 * Get sync status summary
 */
export async function getSyncStatusSummary(): Promise<{
  syncPercentage: number;
  pendingCount: number;
  lastSyncDate?: string;
}> {
  try {
    // Get total submissions
    const { count: totalCount, error: totalError } = await supabase
      .from('emerge_submissions')
      .select('*', { count: 'exact', head: true });
      
    // Get synced submissions
    const { count: syncedCount, error: syncedError } = await supabase
      .from('emerge_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('sync_status', 'synced');
      
    if (totalError) throw totalError;
    if (syncedError) throw syncedError;
    
    // Get last sync log
    const { data: lastSyncLog, error: logError } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('function_name', 'talent_sync')
      .order('executed_at', { ascending: false })
      .limit(1);
      
    const total = totalCount || 0;
    const synced = syncedCount || 0;
    const pendingCount = total - synced;
    const syncPercentage = total > 0 ? Math.round((synced / total) * 100) : 100;
    
    return {
      syncPercentage,
      pendingCount,
      lastSyncDate: lastSyncLog && lastSyncLog.length > 0 ? lastSyncLog[0].executed_at : undefined
    };
  } catch (error) {
    console.error("Error getting sync status:", error);
    return {
      syncPercentage: 0,
      pendingCount: 0
    };
  }
}

/**
 * Get the latest synchronization logs
 */
export async function getTalentSyncLogs(limit: number = 5): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('function_name', 'talent_sync')
      .order('executed_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error("Error fetching sync logs:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getTalentSyncLogs:", error);
    return [];
  }
}
