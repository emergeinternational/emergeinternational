
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiscountCode {
  id: string;
  code: string;
  discount_percent?: number;
  discount_amount?: number;
  valid_until?: string;
  current_uses: number;
  max_uses?: number;
}

export const useDiscountCode = (eventId: string) => {
  const [isValidating, setIsValidating] = useState(false);
  const [discountCode, setDiscountCode] = useState<DiscountCode | null>(null);
  const { toast } = useToast();

  const validateDiscountCode = async (code: string): Promise<number> => {
    setIsValidating(true);
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code)
        .eq('event_id', eventId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid discount code",
          description: "The code you entered is not valid.",
          variant: "destructive",
        });
        return 0;
      }

      const now = new Date();
      const validUntil = data.valid_until ? new Date(data.valid_until) : null;

      if (validUntil && validUntil < now) {
        toast({
          title: "Expired discount code",
          description: "This discount code has expired.",
          variant: "destructive",
        });
        return 0;
      }

      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast({
          title: "Discount code limit reached",
          description: "This discount code has reached its usage limit.",
          variant: "destructive",
        });
        return 0;
      }

      setDiscountCode(data);
      toast({
        title: "Discount code applied!",
        description: `Your discount has been applied successfully.`,
      });

      return data.discount_amount || (data.discount_percent || 0);
    } catch (error) {
      console.error('Error validating discount code:', error);
      toast({
        title: "Error validating code",
        description: "There was an error validating your discount code. Please try again.",
        variant: "destructive",
      });
      return 0;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateDiscountCode,
    isValidating,
    discountCode
  };
};
