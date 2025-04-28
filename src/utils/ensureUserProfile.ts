
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
      return true;
    }

    // If check error is not "no rows" error, something else went wrong
    if (checkError && !checkError.message.includes('no rows')) {
      console.error("Error checking for profile:", checkError);
      return false;
    }

    // No profile found, create one
    const { error } = await supabase
      .from('profiles')
      .insert({ 
        id: userId,
        email: email,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error creating user profile:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in ensureUserProfile:", error);
    return false;
  }
};
