
import React from 'react';
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface MockupGeneratorProps {
  isLocked?: boolean;
  onProductsGenerated?: () => void;
}

/**
 * Simplified mockup generator with minimal functionality
 */
const MockupGenerator: React.FC<MockupGeneratorProps> = () => {
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-slate-50">
        <h3 className="font-medium mb-2">Generate Mock Products</h3>
        <p className="text-sm text-gray-500 mb-4">
          Mock product generation temporarily disabled. This feature will return in the next update.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={true}
            className="flex items-center"
          >
            <Package className="h-4 w-4 mr-2" />
            Generate Products
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MockupGenerator;
