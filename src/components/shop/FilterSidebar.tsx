
import React, { useState } from "react";
import { Collection, ShopProduct } from "@/types/shop";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  collections: Collection[];
  products: ShopProduct[];
  selectedCollection: string | null;
  selectedCategory: string | null;
  selectedSizes: string[];
  selectedColors: string[];
  priceRange: [number, number];
  maxPrice: number;
  onCollectionChange: (collectionId: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  className?: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  collections,
  products,
  selectedCollection,
  selectedCategory,
  selectedSizes,
  selectedColors,
  priceRange,
  maxPrice,
  onCollectionChange,
  onCategoryChange,
  onSizeChange,
  onColorChange,
  onPriceRangeChange,
  onClearFilters,
  className
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Extract unique categories, sizes, and colors
  const categories = Array.from(
    new Set(products.filter(p => p?.category).map(p => p.category))
  ).filter(Boolean) as string[];
  
  const sizes = Array.from(
    new Set(
      products
        .flatMap(p => p.variations || [])
        .filter(v => v?.size)
        .map(v => v.size)
    )
  ).filter(Boolean) as string[];
  
  const colors = Array.from(
    new Set(
      products
        .flatMap(p => p.variations || [])
        .filter(v => v?.color)
        .map(v => v.color)
    )
  ).filter(Boolean) as string[];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  // Count active filters
  const activeFilterCount = 
    (selectedCollection ? 1 : 0) + 
    (selectedCategory ? 1 : 0) + 
    selectedSizes.length + 
    selectedColors.length + 
    ((priceRange[0] > 0 || priceRange[1] < maxPrice) ? 1 : 0);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden w-full flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Sidebar for Desktop */}
      <div className={cn(
        "hidden md:block h-full border-r pr-4 space-y-6",
        className
      )}>
        {renderFilterContent()}
      </div>

      {/* Mobile Slide-over */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-background p-6 shadow-lg animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                <X size={18} />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="pr-4 space-y-6">
                {renderFilterContent()}
              </div>
            </ScrollArea>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={onClearFilters}
                >
                  Clear All
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => setIsMobileOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  function renderFilterContent() {
    return (
      <>
        {/* Collections Filter */}
        <div>
          <h3 className="font-semibold mb-2">Collections</h3>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="all-collections" 
                checked={selectedCollection === null}
                onCheckedChange={() => onCollectionChange(null)}
              />
              <Label htmlFor="all-collections">All Collections</Label>
            </div>
            
            {collections.map(collection => (
              <div key={collection.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`collection-${collection.id}`}
                  checked={selectedCollection === collection.id}
                  onCheckedChange={() => onCollectionChange(collection.id)}
                />
                <Label htmlFor={`collection-${collection.id}`} className="text-sm">
                  {collection.title} ({collection.designer_name})
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />

        {/* Categories Filter */}
        {categories.length > 0 && (
          <>
            <div>
              <h3 className="font-semibold mb-2">Categories</h3>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="all-categories" 
                    checked={selectedCategory === null}
                    onCheckedChange={() => onCategoryChange(null)}
                  />
                  <Label htmlFor="all-categories">All Categories</Label>
                </div>
                
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category}`}
                      checked={selectedCategory === category}
                      onCheckedChange={() => onCategoryChange(category)}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
          </>
        )}

        {/* Price Range */}
        <div>
          <h3 className="font-semibold mb-3">Price Range</h3>
          <div className="px-2">
            <Slider
              defaultValue={[priceRange[0], priceRange[1]]}
              max={maxPrice}
              step={100}
              onValueChange={(value) => onPriceRangeChange(value as [number, number])}
              className="mb-6"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm">{formatPrice(priceRange[0])}</span>
              <span className="text-sm">{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sizes Filter */}
        {sizes.length > 0 && (
          <>
            <Collapsible defaultOpen>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Sizes</h3>
                <CollapsibleTrigger className="p-1">
                  {open => open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <Badge 
                      key={size}
                      variant={selectedSizes.includes(size) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => onSizeChange(size)}
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Separator />
          </>
        )}

        {/* Colors Filter */}
        {colors.length > 0 && (
          <>
            <Collapsible defaultOpen>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Colors</h3>
                <CollapsibleTrigger className="p-1">
                  {open => open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <Badge 
                      key={color}
                      variant={selectedColors.includes(color) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => onColorChange(color)}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {/* Clear Filters Button (Desktop only) */}
        {activeFilterCount > 0 && (
          <Button 
            variant="outline"
            className="w-full text-sm"
            onClick={onClearFilters}
          >
            Clear All Filters
          </Button>
        )}
      </>
    );
  }
};

export default FilterSidebar;
