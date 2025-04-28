
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
    
    // Create minimal profile
    const { error } = await supabase
      .from('profiles')
      .insert({ 
        id: userId,
        email: email,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error creating user profile:", error);
      
      if (error.message.includes('foreign key constraint')) {
        // Wait briefly and retry once in case of race condition with auth.users creation
        console.log("Foreign key constraint violation, retrying after delay...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { error: retryError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId,
            email: email,
            updated_at: new Date().toISOString()
          });
          
        if (retryError) {
          console.error("Retry failed:", retryError);
          return false;
        }
      } else if (error.message.includes('duplicate key')) {
        console.log("Profile already exists (race condition)");
        return true;
      } else {
        return false;
      }
    }
    
    console.log("Profile created successfully for user:", userId);
    
    // Try to set the user role in user_roles table first
    try {
      // Check if a role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (!existingRole) {
        // Insert with text role to avoid app_role type issues
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'user'  // Use string instead of enum to avoid type issues
          });
          
        if (roleError) {
          console.error("Could not set user role in user_roles table:", roleError);
          // Fall back to setting role in the profile
          await setRoleInProfile(userId);
        } else {
          console.log("User role set successfully in user_roles table");
        }
      } else {
        console.log("User role already exists");
      }
    } catch (roleError) {
      console.error("Error setting user role in user_roles table:", roleError);
      // Fall back to setting role in the profile
      await setRoleInProfile(userId);
    }
    
    return true;
  } catch (error) {
    console.error("Exception in ensureUserProfile:", error);
    return false;
  }
};

// Helper function to set role in profile as fallback
async function setRoleInProfile(userId: string) {
  try {
    const { error: profileRoleError } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', userId);
      
    if (profileRoleError) {
      console.error("Could not set role in profile either:", profileRoleError);
    } else {
      console.log("Set role in profile table as backup");
    }
  } catch (err) {
    console.error("Error setting role in profile:", err);
  }
}
