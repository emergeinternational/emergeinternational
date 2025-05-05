
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Settings, 
  Grid2X2, 
  LayoutList 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ShopProduct } from "@/types/shop";

interface AdminFloatingPanelProps {
  productCount: number;
  isGridView: boolean;
  toggleViewMode: () => void;
  onAddProduct: () => void;
  onManageCollections: () => void;
  className?: string;
}

const AdminFloatingPanel: React.FC<AdminFloatingPanelProps> = ({
  productCount,
  isGridView,
  toggleViewMode,
  onAddProduct,
  onManageCollections,
  className
}) => {
  return (
    <TooltipProvider>
      <div className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-background/90 p-2 shadow-lg backdrop-blur border",
        className
      )}>
        <Badge variant="outline" className="bg-background">
          {productCount} Products
        </Badge>
        
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleViewMode}
                className="h-9 w-9"
              >
                {isGridView ? <LayoutList size={18} /> : <Grid2X2 size={18} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isGridView ? "Switch to List View" : "Switch to Grid View"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onManageCollections}
                className="h-9 w-9"
              >
                <Settings size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Manage Collections
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={onAddProduct}
                className="bg-emerge-gold text-black hover:bg-emerge-gold/80 gap-1"
              >
                <PlusCircle size={16} />
                Add Product
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Create a new product
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminFloatingPanel;
