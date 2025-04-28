
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
    
    // Create profile without role field first - safer approach to avoid app_role errors
    const { error } = await supabase
      .from('profiles')
      .insert({ 
        id: userId,
        email: email,
        updated_at: new Date().toISOString(),
        // No role field here to avoid app_role type errors
      });

    if (error) {
      console.error("Error creating user profile:", error);
      
      // Try again with simplified profile if there's any error
      if (error.message.includes('type "app_role"') || 
          error.message.includes('Database error') ||
          error.message.includes('foreign key constraint')) {
        
        console.log("Attempting simplified profile creation without optional fields...");
        
        // Retry with minimal data
        const { error: retryError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId,
            email: email
          });
          
        if (retryError) {
          console.error("Second attempt to create profile failed:", retryError);
          return false;
        } else {
          console.log("Simple profile created successfully");
          
          // Now try to update the user role in the user_roles table if it exists
          try {
            await supabase
              .from('user_roles')
              .insert({
                user_id: userId,
                role: 'user'
              })
              .select();
            console.log("User role set in user_roles table");
          } catch (roleError) {
            // This is not critical - the user can still use the app without a role
            console.log("Could not set user role, but profile was created:", roleError);
          }
          
          return true;
        }
      }
      
      return false;
    }
    
    console.log("Profile created successfully for user:", userId);
    
    // Now try to update the user role in the user_roles table if it exists
    try {
      await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'user'
        })
        .select();
      console.log("User role set in user_roles table");
    } catch (roleError) {
      // This is not critical - the user can still use the app without a role
      console.log("Could not set user role in separate table, but profile was created");
    }
    
    return true;
  } catch (error) {
    console.error("Exception in ensureUserProfile:", error);
    return false;
  }
};
