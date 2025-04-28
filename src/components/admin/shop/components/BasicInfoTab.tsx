
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductTabProps } from '../types/product-form';
import { ProductCategory } from '@/services/productTypes';

export const BasicInfoTab: React.FC<ProductTabProps> = ({
  onChange,
  formValues,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Product Title</Label>
        <Input
          id="title"
          value={formValues.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Enter product title"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formValues.description || ""}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Enter product description"
          className="min-h-[100px]"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={0.01}
            value={formValues.price}
            onChange={(e) => onChange('price', parseFloat(e.target.value))}
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formValues.category}
            onValueChange={(value) => onChange('category', value as ProductCategory)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="accessories">Accessories</SelectItem>
              <SelectItem value="footwear">Footwear</SelectItem>
              <SelectItem value="new_arrivals">New Arrivals</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="is-published" 
            checked={formValues.isPublished}
            onCheckedChange={(checked) => onChange('isPublished', !!checked)}
          />
          <Label htmlFor="is-published">Published</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="in-stock" 
            checked={formValues.inStock}
            onCheckedChange={(checked) => onChange('inStock', !!checked)}
          />
          <Label htmlFor="in-stock">In Stock</Label>
        </div>
      </div>
    </div>
  );
};
