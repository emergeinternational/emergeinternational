import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductVariation } from '@/types/shopV2';
import { addProductVariation, deleteProductVariation, updateProductVariation } from '@/services/shopV2Service';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface ProductVariationFormV2Props {
  variations: ProductVariation[];
  setVariations: React.Dispatch<React.SetStateAction<ProductVariation[]>>;
  productId?: string;
}

const ProductVariationFormV2: React.FC<ProductVariationFormV2Props> = ({ 
  variations, 
  setVariations,
  productId
}) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newVariation, setNewVariation] = useState<Partial<ProductVariation>>({
    size: '',
    color: '',
    stock_quantity: 0,
    sku: '',
    price: undefined
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'stock_quantity' || name === 'price') {
      setNewVariation(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setNewVariation(prev => ({ ...prev, [name]: value }));
    }
  };

  const addVariation = async () => {
    // Form validation
    if (!newVariation.sku) {
      toast({ title: "Error", description: "SKU is required", variant: "destructive" });
      return;
    }
    
    // Check if product ID exists
    if (!productId) {
      toast({ 
        title: "Cannot add variation", 
        description: "Please save the product first before adding variations", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add the product ID to the variation
      const fullVariation = {
        ...newVariation,
        product_id: productId,
        stock_quantity: newVariation.stock_quantity || 0
      };
      
      const addedVariation = await addProductVariation(fullVariation as Omit<ProductVariation, 'id' | 'created_at' | 'updated_at'>);
      
      if (addedVariation) {
        // Update local state
        setVariations(prev => [...prev, addedVariation]);
        setNewVariation({
          size: '',
          color: '',
          stock_quantity: 0,
          sku: '',
          price: undefined
        });
        setIsAdding(false);
        
        toast({ title: "Success", description: "Variation added successfully" });
      } else {
        toast({ title: "Error", description: "Failed to add variation", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding variation:", error);
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const removeVariation = async (variationId: string) => {
    if (!confirm("Are you sure you want to delete this variation?")) return;
    
    setIsLoading(true);
    
    try {
      const success = await deleteProductVariation(variationId);
      
      if (success) {
        // Update local state
        setVariations(prev => prev.filter(v => v.id !== variationId));
        toast({ title: "Success", description: "Variation removed successfully" });
      } else {
        toast({ title: "Error", description: "Failed to remove variation", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error removing variation:", error);
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Product Variations</h3>
          {!isAdding && productId && (
            <Button 
              type="button" 
              onClick={() => setIsAdding(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Variation
            </Button>
          )}
        </div>
        
        {/* Existing variations */}
        {variations.length > 0 ? (
          <div className="space-y-2">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variations.map(variation => (
                  <tr key={variation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{variation.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{variation.size || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{variation.color || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {variation.price 
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(variation.price) 
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{variation.stock_quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeVariation(variation.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No variations added yet.</p>
        )}
        
        {/* Add new variation form */}
        {isAdding && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-md font-medium">Add New Variation</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="sku">SKU (required)</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={newVariation.sku || ''}
                  onChange={handleInputChange}
                  placeholder="SKU"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  value={newVariation.stock_quantity || 0}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  name="size"
                  value={newVariation.size || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. S, M, L"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  value={newVariation.color || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Red, Blue"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={newVariation.price || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAdding(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={addVariation}
                disabled={isLoading || !newVariation.sku}
              >
                {isLoading ? "Adding..." : "Add Variation"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductVariationFormV2;
