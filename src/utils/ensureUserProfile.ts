
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures that a user profile exists in the database
 * This can be called when needed to ensure profile data is present
 */
export const ensureUserProfile = async (userId: string, email?: string): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Cannot ensure profile without a user ID");
      return false;
    }

    // Check if profile exists first
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    // If found, no need to create
    if (existingProfile) {
      console.log("Profile already exists for user:", userId);
      return true;
    }

    // If check error is not "no rows" error, something else went wrong
    if (checkError && !checkError.message.includes('no rows')) {
      console.error("Error checking for profile:", checkError);
      return false;
    }

    console.log("Creating new profile for user:", userId);
    
    // No profile found, create one with basic info
    const { error } = await supabase
      .from('profiles')
      .insert({ 
        id: userId,
        email: email,
        updated_at: new Date().toISOString(),
        role: 'user' // Set a default role directly in the profiles table
      });

    if (error) {
      console.error("Error creating user profile:", error);
      
      // Handle specific app_role type error
      if (error.message.includes('type "app_role" does not exist')) {
        console.log("Detected app_role type error. Creating profile without role field...");
        
        // Try again without the role field
        const { error: retryError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId,
            email: email,
            updated_at: new Date().toISOString()
          });
          
        if (retryError) {
          console.error("Second attempt to create profile failed:", retryError);
          return false;
        } else {
          console.log("Profile created successfully without role field");
          return true;
        }
      }
      
      // Check if it's a foreign key constraint issue
      if (error.message.includes('foreign key constraint')) {
        console.log("Foreign key constraint error - this could be a race condition. Retrying...");
        // Wait briefly and try again
        await new Promise(resolve => setTimeout(resolve, 500));
        return await ensureUserProfile(userId, email);
      }
      
      return false;
    }
    
    console.log("Profile created successfully for user:", userId);
    return true;
  } catch (error) {
    console.error("Exception in ensureUserProfile:", error);
    return false;
  }
};
