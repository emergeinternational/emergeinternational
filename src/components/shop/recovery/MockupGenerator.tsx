
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MockupGeneratorProps {
  isLocked?: boolean;
  onProductsGenerated?: () => void; // Callback to refresh products after generation
}

/**
 * Component for generating mock products for testing
 */
const MockupGenerator: React.FC<MockupGeneratorProps> = ({ 
  isLocked = false, 
  onProductsGenerated 
}) => {
  const [isMockGenerating, setIsMockGenerating] = useState<boolean>(false);

  // Generate mock products function that doesn't depend on external hooks
  const handleGenerateMockProducts = async (count: number) => {
    if (isLocked) {
      toast.error("System is locked. Unlock it to generate mock products.");
      return null;
    }
    
    try {
      setIsMockGenerating(true);
      
      // Call the RPC function directly to generate mock products
      const { data, error } = await supabase.rpc('generate_mock_products', { count });
      
      if (error) {
        console.error("Error generating mock products:", error);
        toast.error("Failed to generate mock products");
        return null;
      }
      
      // Show success message with count of products created
      toast.success(`Successfully generated ${count} mock products`);
      
      // Call the callback if provided
      if (onProductsGenerated) {
        onProductsGenerated();
      }
      
      return data;
    } catch (error) {
      console.error("Error in handleGenerateMockProducts:", error);
      toast.error("Failed to generate mock products");
      return null;
    } finally {
      setIsMockGenerating(false);
    }
  };
  
  // Handle generation with callback for refresh
  const generateProducts = async (count: number) => {
    await handleGenerateMockProducts(count);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-slate-50">
        <h3 className="font-medium mb-2">Generate Mock Products</h3>
        <p className="text-sm text-gray-500 mb-4">
          Add sample products for testing. These will be marked as published and visible to all users.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => generateProducts(5)}
            disabled={isMockGenerating || isLocked}
            className="flex items-center"
          >
            {isMockGenerating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Package className="h-4 w-4 mr-2" />}
            Generate 5 Products
          </Button>
          <Button
            variant="outline"
            onClick={() => generateProducts(10)}
            disabled={isMockGenerating || isLocked}
          >
            Generate 10 Products
          </Button>
          <Button
            variant="outline"
            onClick={() => generateProducts(20)}
            disabled={isMockGenerating || isLocked}
          >
            Generate 20 Products
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MockupGenerator;
