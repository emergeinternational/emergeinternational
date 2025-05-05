
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductVariation } from "@/types/shop";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package } from "lucide-react";

interface ProductVariationFormProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
}

const ProductVariationForm: React.FC<ProductVariationFormProps> = ({
  variations,
  onVariationsChange
}) => {
  const addVariation = () => {
    const newVariation: ProductVariation = {
      stock_quantity: 0,
      sku: `VAR-${variations.length + 1}`,
    };
    
    onVariationsChange([...variations, newVariation]);
  };

  const removeVariation = (index: number) => {
    const updatedVariations = [...variations];
    updatedVariations.splice(index, 1);
    onVariationsChange(updatedVariations);
  };

  const handleVariationChange = (index: number, field: keyof ProductVariation, value: any) => {
    const updatedVariations = [...variations];
    updatedVariations[index] = {
      ...updatedVariations[index],
      [field]: field === 'stock_quantity' || field === 'price' 
        ? (value === '' || isNaN(Number(value)) ? 0 : Number(value)) 
        : value
    };
    onVariationsChange(updatedVariations);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Product Variations</Label>
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          onClick={addVariation}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Variation
        </Button>
      </div>
      
      {variations.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Package className="h-8 w-8 mb-2 text-muted-foreground" />
            <p>No variations added yet</p>
            <p className="text-sm">Add size, color or other variations for this product</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {variations.map((variation, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-4">
                <div className="absolute top-2 right-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeVariation(index)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`variation-size-${index}`}>Size</Label>
                    <Input
                      id={`variation-size-${index}`}
                      value={variation.size || ''}
                      onChange={(e) => handleVariationChange(index, 'size', e.target.value)}
                      placeholder="Size (e.g. S, M, L)"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variation-color-${index}`}>Color</Label>
                    <Input
                      id={`variation-color-${index}`}
                      value={variation.color || ''}
                      onChange={(e) => handleVariationChange(index, 'color', e.target.value)}
                      placeholder="Color (e.g. Red, Blue)"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variation-sku-${index}`}>SKU</Label>
                    <Input
                      id={`variation-sku-${index}`}
                      value={variation.sku || ''}
                      onChange={(e) => handleVariationChange(index, 'sku', e.target.value)}
                      placeholder="Variation SKU"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variation-stock-${index}`}>Stock</Label>
                    <Input
                      id={`variation-stock-${index}`}
                      type="number"
                      value={variation.stock_quantity === undefined ? 0 : variation.stock_quantity}
                      onChange={(e) => handleVariationChange(index, 'stock_quantity', e.target.value)}
                      placeholder="Available stock"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variation-price-${index}`}>Price Override (Optional)</Label>
                    <Input
                      id={`variation-price-${index}`}
                      type="number"
                      step="0.01"
                      value={variation.price || ''}
                      onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                      placeholder="Leave empty to use product price"
                    />
                  </div>
                </div>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {variation.size && (
                    <Badge variant="outline">{variation.size}</Badge>
                  )}
                  {variation.color && (
                    <Badge variant="outline" className="bg-gray-100">{variation.color}</Badge>
                  )}
                  <Badge variant="secondary">Stock: {variation.stock_quantity || 0}</Badge>
                  {variation.price && (
                    <Badge variant="secondary">Price: ${variation.price}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductVariationForm;
