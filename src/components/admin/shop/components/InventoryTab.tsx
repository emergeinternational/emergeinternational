
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductTabProps } from '../types/product-form';

export const InventoryTab: React.FC<ProductTabProps> = ({
  onChange,
  formValues,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formValues.sku}
            onChange={(e) => onChange('sku', e.target.value)}
            placeholder="Stock Keeping Unit"
          />
        </div>
        
        <div>
          <Label htmlFor="stock-qty">Stock Quantity</Label>
          <Input
            id="stock-qty"
            type="number"
            min={0}
            value={formValues.stockQuantity}
            onChange={(e) => onChange('stockQuantity', parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="weight">Weight (kg)</Label>
        <Input
          id="weight"
          type="number"
          min={0}
          step={0.01}
          value={formValues.weight || ""}
          onChange={(e) => onChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="Product weight"
        />
      </div>
      
      <div>
        <Label>Dimensions (cm)</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {['length', 'width', 'height'].map((dim) => (
            <div key={dim}>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={formValues.dimensions?.[dim] || ""}
                onChange={(e) => onChange('dimensions', {
                  ...formValues.dimensions,
                  [dim]: parseFloat(e.target.value)
                })}
                placeholder={dim.charAt(0).toUpperCase() + dim.slice(1)}
              />
              <span className="text-xs text-gray-500 mt-1 block capitalize">{dim}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Shipping Information</Label>
        <div className="flex items-center space-x-2 mb-3">
          <Checkbox 
            id="free-shipping" 
            checked={formValues.shippingInfo?.freeShipping}
            onCheckedChange={(checked) => onChange('shippingInfo', {
              ...formValues.shippingInfo,
              freeShipping: !!checked
            })}
          />
          <Label htmlFor="free-shipping">Free Shipping</Label>
        </div>
        
        {!formValues.shippingInfo?.freeShipping && (
          <div>
            <Label htmlFor="shipping-cost">Shipping Cost ($)</Label>
            <Input
              id="shipping-cost"
              type="number"
              min={0}
              step={0.01}
              value={formValues.shippingInfo?.shippingCost || 0}
              onChange={(e) => onChange('shippingInfo', {
                ...formValues.shippingInfo,
                shippingCost: parseFloat(e.target.value)
              })}
            />
          </div>
        )}
        
        <div>
          <Label htmlFor="delivery-days">Estimated Delivery Days</Label>
          <Input
            id="delivery-days"
            type="number"
            min={1}
            value={formValues.shippingInfo?.estimatedDeliveryDays || 3}
            onChange={(e) => onChange('shippingInfo', {
              ...formValues.shippingInfo,
              estimatedDeliveryDays: parseInt(e.target.value)
            })}
          />
        </div>
      </div>
    </div>
  );
};
