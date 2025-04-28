
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
