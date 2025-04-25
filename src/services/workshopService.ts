
import { supabase } from "@/integrations/supabase/client";

export interface Workshop {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  spots?: number;
  is_archived: boolean;
  registration_link?: string;
  created_at: string;
  updated_at: string;
}

export const getWorkshops = async (showArchived: boolean = false): Promise<Workshop[]> => {
  try {
    console.log(`Fetching workshops with archived=${showArchived}`);
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('is_archived', showArchived)
      .order('date', { ascending: true });
    
    if (error) {
      console.error("Error fetching workshops:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error in getWorkshops:", error);
    return [];
  }
};

export const getArchivedWorkshops = async (): Promise<Workshop[]> => {
  return getWorkshops(true);
};
