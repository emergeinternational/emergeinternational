
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Package } from "lucide-react";
import { toast } from "sonner";
import { useMockProducts } from "@/hooks/shop/useMockProducts";

interface MockupGeneratorProps {
  isLocked?: boolean;
}

/**
 * Component for generating mock products for testing
 */
const MockupGenerator: React.FC<MockupGeneratorProps> = ({ isLocked = false }) => {
  const { handleGenerateMockProducts, isMockGenerating } = useMockProducts(isLocked);

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
            onClick={() => handleGenerateMockProducts(5)}
            disabled={isMockGenerating || isLocked}
            className="flex items-center"
          >
            {isMockGenerating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Package className="h-4 w-4 mr-2" />}
            Generate 5 Products
          </Button>
          <Button
            variant="outline"
            onClick={() => handleGenerateMockProducts(10)}
            disabled={isMockGenerating || isLocked}
          >
            Generate 10 Products
          </Button>
          <Button
            variant="outline"
            onClick={() => handleGenerateMockProducts(20)}
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
