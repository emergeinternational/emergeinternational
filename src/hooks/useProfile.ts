
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = async (userId: string, profileData: {
    full_name?: string,
    country?: string,
    city?: string,
    language?: string
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createProfile, isLoading, error };
};
