
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmergingTalent {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  age: number | null;
  category: string;
  gender: string;
  instagram: string | null;
  telegram: string | null;
  talent_description: string | null;
  measurements: Record<string, string> | null;
  portfolio_url: string | null;
  created_at: string;
}

export const useEmergingTalents = (startDate?: Date, endDate?: Date, sortDirection: 'asc' | 'desc' = 'desc') => {
  return useQuery({
    queryKey: ['emerge-submissions', startDate, endDate, sortDirection],
    queryFn: async () => {
      let query = supabase
        .from('emerge_submissions')
        .select('*')
        .order('created_at', { ascending: sortDirection === 'asc' });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('created_at', nextDay.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching submissions:", error);
        throw error;
      }

      // Ensure measurements are properly typed as Record<string, string> | null
      return data.map(item => ({
        ...item,
        measurements: item.measurements ? item.measurements as Record<string, string> : null
      })) as EmergingTalent[];
    }
  });
};
