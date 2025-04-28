
import { supabase } from "@/integrations/supabase/client";
import { TalentApplication, TalentStatus } from "@/types/talentTypes";

export async function fetchTalentApplications(): Promise<TalentApplication[]> {
  console.log("Fetching talent applications...");
  
  const { data, error } = await supabase
    .from('talent_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
  
  return data as TalentApplication[];
}

export async function updateApplicationStatus(id: string, status: TalentStatus): Promise<void> {
  const { error } = await supabase
    .from('talent_applications')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error("Error updating status:", error);
    throw error;
  }
}

export async function createTalentApplication(data: Partial<TalentApplication>): Promise<TalentApplication> {
  const { data: insertedData, error } = await supabase
    .from('talent_applications')
    .insert(data)
    .select();

  if (error) {
    console.error("Error creating application:", error);
    throw error;
  }

  return insertedData[0] as TalentApplication;
}

export async function getTalentApplication(id: string): Promise<TalentApplication | null> {
  const { data, error } = await supabase
    .from('talent_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Record not found
    }
    console.error("Error fetching application:", error);
    throw error;
  }

  return data as TalentApplication;
}

export async function checkTalentApplicationsTable(): Promise<{exists: boolean, columnCount?: number}> {
  try {
    const { count, error } = await supabase
      .from('talent_applications')
      .select('*', { count: 'exact', head: true });
    
    return { exists: !error, columnCount: count };
  } catch (err) {
    console.error("Error checking talent_applications table:", err);
    return { exists: false };
  }
}
