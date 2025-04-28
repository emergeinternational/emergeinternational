
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { ProductTabProps } from '../types/product-form';
import { ProductVariation } from '@/services/productTypes';

export const VariationsTab: React.FC<ProductTabProps> = ({
  onChange,
  formValues,
}) => {
  const handleAddVariation = () => {
    const newVariation: ProductVariation = {
      name: "",
      options: [""],
      price_adjustments: [0],
    };
    onChange('variations', [...(formValues.variations || []), newVariation]);
  };

  const handleRemoveVariation = (index: number) => {
    const newVariations = [...(formValues.variations || [])];
    newVariations.splice(index, 1);
    onChange('variations', newVariations);
  };

  const handleVariationNameChange = (index: number, name: string) => {
    const newVariations = [...(formValues.variations || [])];
    newVariations[index].name = name;
    onChange('variations', newVariations);
  };

  const handleAddVariationOption = (variationIndex: number) => {
    const newVariations = [...(formValues.variations || [])];
    newVariations[variationIndex].options.push("");
    newVariations[variationIndex].price_adjustments.push(0);
    onChange('variations', newVariations);
  };

  const handleRemoveVariationOption = (variationIndex: number, optionIndex: number) => {
    const newVariations = [...(formValues.variations || [])];
    newVariations[variationIndex].options.splice(optionIndex, 1);
    newVariations[variationIndex].price_adjustments.splice(optionIndex, 1);
    onChange('variations', newVariations);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Product Variations</Label>
        <Button 
          type="button" 
          onClick={handleAddVariation}
          size="sm" 
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Variation
        </Button>
      </div>
      
      {formValues.variations?.length > 0 ? (
        <div className="space-y-6">
          {formValues.variations.map((variation: ProductVariation, vIndex: number) => (
            <div key={vIndex} className="border rounded-md p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <Label htmlFor={`variation-name-${vIndex}`}>Variation Name</Label>
                  <Input
                    id={`variation-name-${vIndex}`}
                    value={variation.name}
                    onChange={(e) => handleVariationNameChange(vIndex, e.target.value)}
                    placeholder="e.g. Size, Color, etc."
                  />
                </div>
                <Button 
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2 mt-6"
                  onClick={() => handleRemoveVariation(vIndex)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Options</Label>
                {variation.options.map((option: string, oIndex: number) => (
                  <div key={oIndex} className="grid grid-cols-3 gap-2 items-center">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newVariations = [...(formValues.variations || [])];
                        newVariations[vIndex].options[oIndex] = e.target.value;
                        onChange('variations', newVariations);
                      }}
                      placeholder="Option name"
                      className="col-span-2"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Price adjustment"
                        value={variation.price_adjustments[oIndex]}
                        onChange={(e) => {
                          const newVariations = [...(formValues.variations || [])];
                          newVariations[vIndex].price_adjustments[oIndex] = parseFloat(e.target.value);
                          onChange('variations', newVariations);
                        }}
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveVariationOption(vIndex, oIndex)}
                        disabled={variation.options.length <= 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  type="button" 
                  onClick={() => handleAddVariationOption(vIndex)}
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Option
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 border rounded-md text-gray-500">
          No variations added yet
        </div>
      )}
    </div>
  );
};
