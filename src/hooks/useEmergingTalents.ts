
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

      return data;
    }
  });
};
