
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductVariation } from "@/types/shop";
import { X, Plus } from "lucide-react";

interface ProductVariationFormProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
}

const ProductVariationForm: React.FC<ProductVariationFormProps> = ({ 
  variations, 
  onVariationsChange 
}) => {
  const addVariation = () => {
    onVariationsChange([
      ...variations, 
      { 
        sku: `SKU-${Date.now()}`, 
        stock_quantity: 0,
        size: '',
        color: '',
        price: undefined
      }
    ]);
  };

  const removeVariation = (index: number) => {
    const newVariations = [...variations];
    newVariations.splice(index, 1);
    onVariationsChange(newVariations);
  };

  const updateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    const newVariations = [...variations];
    newVariations[index] = { ...newVariations[index], [field]: value };
    onVariationsChange(newVariations);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Product Variations</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addVariation}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Variation
        </Button>
      </div>

      {variations.length > 0 ? (
        <div className="space-y-4">
          {variations.map((variation, index) => (
            <div 
              key={index} 
              className="grid grid-cols-12 gap-2 items-center border p-3 rounded-md"
            >
              <div className="col-span-2">
                <label className="text-xs">Size</label>
                <Input
                  value={variation.size || ''}
                  onChange={(e) => updateVariation(index, 'size', e.target.value)}
                  placeholder="Size"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs">Color</label>
                <Input
                  value={variation.color || ''}
                  onChange={(e) => updateVariation(index, 'color', e.target.value)}
                  placeholder="Color"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs">Stock</label>
                <Input
                  type="number"
                  value={variation.stock_quantity}
                  onChange={(e) => updateVariation(index, 'stock_quantity', parseInt(e.target.value))}
                  placeholder="Stock"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={variation.price || ''}
                  onChange={(e) => updateVariation(index, 'price', e.target.value ? parseFloat(e.target.value) * 100 : undefined)}
                  placeholder="Optional"
                />
              </div>
              <div className="col-span-3">
                <label className="text-xs">SKU</label>
                <Input
                  value={variation.sku}
                  onChange={(e) => updateVariation(index, 'sku', e.target.value)}
                  placeholder="SKU"
                />
              </div>
              <div className="col-span-1 flex items-end justify-end h-full">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeVariation(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 border rounded-md bg-muted/20">
          <p className="text-sm text-muted-foreground">No variations added yet</p>
        </div>
      )}
    </div>
  );
};

export default ProductVariationForm;
