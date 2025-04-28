
import { supabase } from "@/integrations/supabase/client";
import { Talent, TalentCategory, TalentLevel, TalentApplication } from "@/types/talentTypes";

/**
 * Fetch all talents from the new talent table
 */
export async function fetchTalents(): Promise<Talent[]> {
  console.log("Fetching talents from new talent table...");
  
  const { data, error } = await supabase
    .from('talent')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching talents:", error);
    throw error;
  }
  
  return data as Talent[];
}

/**
 * Get a single talent by ID
 */
export async function getTalent(id: string): Promise<Talent | null> {
  const { data, error } = await supabase
    .from('talent')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Record not found
    }
    console.error("Error fetching talent:", error);
    throw error;
  }

  return data as Talent;
}

/**
 * Create a new talent record
 */
export async function createTalent(data: Omit<Talent, 'id' | 'created_at' | 'updated_at'>): Promise<Talent> {
  const { data: insertedData, error } = await supabase
    .from('talent')
    .insert(data)
    .select();

  if (error) {
    console.error("Error creating talent:", error);
    throw error;
  }

  return insertedData[0] as Talent;
}

/**
 * Update an existing talent
 */
export async function updateTalent(id: string, data: Partial<Talent>): Promise<void> {
  const { error } = await supabase
    .from('talent')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error("Error updating talent:", error);
    throw error;
  }
}

/**
 * Delete a talent record
 */
export async function deleteTalent(id: string): Promise<void> {
  const { error } = await supabase
    .from('talent')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting talent:", error);
    throw error;
  }
}

/**
 * Migrate a talent application to the new talent table
 */
export async function migrateApplicationToTalent(application: TalentApplication): Promise<Talent | null> {
  try {
    // Map category_type to TalentCategory enum
    const category = mapCategoryTypeToEnum(application.category_type || 'other');
    
    // Default to beginner level when migrating
    const level: TalentLevel = 'beginner';
    
    // Map social media data to the new format
    const socialMediaLinks = application.social_media ? {
      instagram: application.social_media.instagram,
      telegram: application.social_media.telegram,
      tiktok: application.social_media.tiktok,
      portfolio: application.portfolio_url
    } : null;

    const talentData = {
      full_name: application.full_name,
      email: application.email,
      category,
      level,
      portfolio_url: application.portfolio_url,
      social_media_links: socialMediaLinks,
      profile_image_url: application.photo_url
    };

    const { data, error } = await supabase
      .from('talent')
      .insert(talentData)
      .select();

    if (error) {
      console.error("Error migrating talent application:", error);
      return null;
    }

    // Log successful migration
    await supabase.rpc('logSyncActivity', {
      function_name: 'migrate_application_to_talent',
      results: {
        success: true,
        application_id: application.id,
        talent_id: data[0].id,
        email: application.email
      }
    });

    return data[0] as Talent;
  } catch (error) {
    console.error("Migration error:", error);
    
    // Log failed migration
    await supabase.rpc('logSyncActivity', {
      function_name: 'migrate_application_to_talent',
      results: {
        success: false,
        application_id: application.id,
        email: application.email,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    });
    
    return null;
  }
}

/**
 * Map legacy category_type strings to the new TalentCategory enum values
 */
function mapCategoryTypeToEnum(categoryType: string): TalentCategory {
  const lowerCategory = categoryType.toLowerCase();
  
  if (lowerCategory.includes('model')) return 'model';
  if (lowerCategory.includes('design')) return 'designer';
  if (lowerCategory.includes('photo')) return 'photographer';
  if (lowerCategory.includes('act')) return 'actor';
  if (lowerCategory.includes('music') || lowerCategory.includes('sing') || lowerCategory.includes('band')) return 'musical_artist';
  if (lowerCategory.includes('art') || lowerCategory.includes('paint')) return 'fine_artist';
  if (lowerCategory.includes('event') || lowerCategory.includes('plan')) return 'event_planner';
  
  // Default to the most common category if we can't determine
  return 'model';
}

/**
 * Check if a talent email already exists in the talent table
 */
export async function checkTalentExists(email: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('talent')
    .select('*', { count: 'exact', head: true })
    .eq('email', email.toLowerCase());
  
  if (error) {
    console.error("Error checking talent existence:", error);
    throw error;
  }
  
  return count !== null && count > 0;
}

/**
 * Get migration statistics
 */
export async function getMigrationStats(): Promise<{
  totalApplications: number;
  migratedCount: number;
  pendingCount: number;
  migrationPercentage: number;
}> {
  try {
    // Get total applications
    const { count: totalApps, error: appsError } = await supabase
      .from('talent_applications')
      .select('*', { count: 'exact', head: true });

    if (appsError) throw appsError;

    // Get total talents
    const { count: totalTalents, error: talentsError } = await supabase
      .from('talent')
      .select('*', { count: 'exact', head: true });

    if (talentsError) throw talentsError;

    const total = totalApps || 0;
    const migrated = totalTalents || 0;
    const pending = Math.max(0, total - migrated); // Ensure non-negative
    const percentage = total > 0 ? (migrated / total) * 100 : 0;

    return {
      totalApplications: total,
      migratedCount: migrated,
      pendingCount: pending,
      migrationPercentage: Math.round(percentage * 10) / 10 // Round to 1 decimal
    };
  } catch (error) {
    console.error("Error getting migration stats:", error);
    return {
      totalApplications: 0,
      migratedCount: 0,
      pendingCount: 0,
      migrationPercentage: 0
    };
  }
}
