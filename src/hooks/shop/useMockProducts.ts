
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ShopProduct } from "@/types/shop";

/**
 * Hook for generating mock products for testing
 */
export const useMockProducts = (isLocked: boolean = false) => {
  const [isMockGenerating, setIsMockGenerating] = useState<boolean>(false);
  
  /**
   * Generate mock products using the Supabase RPC function
   */
  const handleGenerateMockProducts = async (count: number = 5) => {
    if (isLocked) {
      toast.error("System is locked. Unlock it to generate mock products.");
      return;
    }
    
    try {
      setIsMockGenerating(true);
      
      // Call the RPC function to generate mock products
      const { data, error } = await supabase.rpc('generate_mock_products', { count });
      
      if (error) {
        console.error("Error generating mock products:", error);
        toast.error("Failed to generate mock products");
        return;
      }
      
      // Show success message with count of products created
      toast.success(`Successfully generated ${count} mock products`);
      
      return data as ShopProduct[];
    } catch (error) {
      console.error("Error in handleGenerateMockProducts:", error);
      toast.error("Failed to generate mock products");
      return null;
    } finally {
      setIsMockGenerating(false);
    }
  };
  
  return {
    handleGenerateMockProducts,
    isMockGenerating
  };
};
