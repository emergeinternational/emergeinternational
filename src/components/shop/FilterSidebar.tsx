
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Collection, ShopProduct } from "@/types/shop";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";

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
  onClearFilters
}) => {
  // Extract unique categories from products
  const categories = Array.from(
    new Set(products.filter(product => product?.category).map(product => product.category))
  ) as string[];

  // Extract unique sizes from product variations
  const allSizes = products
    .flatMap(product => product.variations || [])
    .filter(variation => variation?.size)
    .map(variation => variation.size) as string[];
  
  const uniqueSizes = Array.from(new Set(allSizes)).filter(Boolean) as string[];

  // Extract unique colors from product variations
  const allColors = products
    .flatMap(product => product.variations || [])
    .filter(variation => variation?.color)
    .map(variation => variation.color) as string[];
  
  const uniqueColors = Array.from(new Set(allColors)).filter(Boolean) as string[];
  
  // Count active filters
  const activeFilterCount = 
    (selectedCollection ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  // Format price for display
  const formatPrice = (price: number) => `$${price}`;

  // Handle price change from slider
  const handlePriceChange = (values: number[]) => {
    onPriceRangeChange([values[0], values[1]]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-primary" variant="secondary">
              {activeFilterCount}
            </Badge>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground flex items-center"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <Separator className="my-4" />

      {/* Collections Filter */}
      <CollapsibleSection title="Collection" defaultOpen={true}>
        <Select 
          value={selectedCollection || ""} 
          onValueChange={(value) => onCollectionChange(value || null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Collections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Collections</SelectItem>
            {collections.map((collection) => (
              <SelectItem 
                key={collection.id} 
                value={collection.id}
              >
                {collection.title || "Unnamed Collection"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CollapsibleSection>

      {/* Categories Filter */}
      <CollapsibleSection title="Category" defaultOpen={true}>
        <Select 
          value={selectedCategory || ""} 
          onValueChange={(value) => onCategoryChange(value || null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem 
                key={category} 
                value={category}
              >
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CollapsibleSection>
      
      {/* Price Range Filter */}
      <CollapsibleSection title="Price" defaultOpen={true}>
        <div className="px-2">
          <div className="flex justify-between mb-3 text-sm">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
          
          <Slider
            defaultValue={[0, maxPrice]}
            min={0}
            max={maxPrice}
            step={1}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="my-4"
          />
        </div>
      </CollapsibleSection>
      
      {/* Size Filter */}
      {uniqueSizes.length > 0 && (
        <CollapsibleSection title="Sizes" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {uniqueSizes.map((size) => (
              <Badge
                key={size}
                variant={selectedSizes.includes(size) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onSizeChange(size)}
              >
                {size}
                {selectedSizes.includes(size) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </CollapsibleSection>
      )}
      
      {/* Colors Filter */}
      {uniqueColors.length > 0 && (
        <CollapsibleSection title="Colors" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((color) => (
              <Badge
                key={color}
                variant={selectedColors.includes(color) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onColorChange(color)}
              >
                {color}
                {selectedColors.includes(color) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

// Helper component for collapsible sections
const CollapsibleSection: React.FC<{
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium my-2">{title}</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="pt-2">
        {children}
      </CollapsibleContent>
      
      <Separator className="mt-4" />
    </Collapsible>
  );
};

export default FilterSidebar;
