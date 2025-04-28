
import { supabase } from "@/integrations/supabase/client";
import { TalentApplication, TalentCategory, TalentLevel } from "@/types/talentTypes";
import { migrateApplicationToTalent, checkTalentExists } from "./talentCoreService";

/**
 * Migrates approved talent applications to the new talent table
 */
export async function migrateApprovedApplications(): Promise<{
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
}> {
  console.log("Starting migration of approved talent applications");
  
  const errors: string[] = [];
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  try {
    // Fetch approved talent applications
    const { data: approvedApplications, error: fetchError } = await supabase
      .from('talent_applications')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      console.error("Error fetching approved applications:", fetchError);
      return {
        success: false,
        migratedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [fetchError.message]
      };
    }
    
    if (!approvedApplications || approvedApplications.length === 0) {
      console.log("No approved applications to migrate");
      return {
        success: true,
        migratedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        errors: []
      };
    }
    
    // Process each approved application
    for (const application of approvedApplications) {
      // Skip if talent already exists with this email
      const existsInTalent = await checkTalentExists(application.email);
      if (existsInTalent) {
        console.log(`Skipping migration for ${application.email} - already exists in talent table`);
        skippedCount++;
        continue;
      }
      
      // Migrate to new talent table
      try {
        const migrated = await migrateApplicationToTalent(application);
        if (migrated) {
          console.log(`Successfully migrated talent: ${application.email}`);
          migratedCount++;
        } else {
          console.error(`Failed to migrate talent: ${application.email}`);
          errors.push(`Failed to migrate talent: ${application.email}`);
          errorCount++;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error during migration');
        console.error(`Error migrating talent ${application.id}:`, error);
        errors.push(`Error migrating talent ${application.id}: ${error.message}`);
        errorCount++;
      }
      
      // Add a small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Return comprehensive report
    const success = errorCount === 0;
    console.log(`Migration completed with: ${migratedCount} migrated, ${skippedCount} skipped, ${errorCount} errors`);
    
    return {
      success,
      migratedCount,
      skippedCount,
      errorCount,
      errors
    };
  } catch (error) {
    console.error("Critical error during talent migration:", error);
    return {
      success: false,
      migratedCount,
      skippedCount,
      errorCount: errorCount + 1,
      errors: [...errors, error instanceof Error ? error.message : "Unknown critical error during migration"]
    };
  }
}

/**
 * Run a batch migration of talent applications
 */
export async function runBatchMigration(batchSize: number = 50): Promise<{
  success: boolean;
  message: string;
  migratedCount: number;
}> {
  try {
    // Get applications that haven't been migrated yet
    const { data: pendingApps, error } = await supabase
      .from('talent_applications')
      .select('*')
      .eq('status', 'approved')
      .limit(batchSize);
    
    if (error) throw error;
    
    if (!pendingApps || pendingApps.length === 0) {
      return {
        success: true,
        message: "No pending applications to migrate",
        migratedCount: 0
      };
    }
    
    let migratedCount = 0;
    
    for (const app of pendingApps) {
      // Skip if already exists
      const exists = await checkTalentExists(app.email);
      if (exists) continue;
      
      const migrated = await migrateApplicationToTalent(app);
      if (migrated) migratedCount++;
    }
    
    return {
      success: true,
      message: `Successfully migrated ${migratedCount} applications`,
      migratedCount
    };
  } catch (error) {
    console.error("Error in batch migration:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error during batch migration",
      migratedCount: 0
    };
  }
}

/**
 * Initiates a forced migration via the Edge Function
 */
export async function forceMigrateTalentData(): Promise<{
  success: boolean;
  migratedCount?: number;
  message?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('talent-migration', {
      body: { 
        operation: 'migrate-approved',
        forceSync: true 
      }
    });

    if (error) {
      console.error("Error in force migration:", error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: data.success,
      migratedCount: data.migratedCount || 0,
      message: data.message || `Successfully migrated ${data.migratedCount || 0} records`
    };
  } catch (error) {
    console.error("Error in forceMigrateTalentData:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred during force migration" 
    };
  }
}
