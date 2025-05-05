
import React, { useState } from "react";
import { Product } from "../../services/shopService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Product) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  product, 
  onSubmit, 
  onCancel 
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Product>(
    product || {
      title: "",
      description: "",
      price: 0,
      image_url: "/placeholder.svg",
      category: "clothing",
      in_stock: true
    }
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value)
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      toast({
        title: product ? "Product updated" : "Product created",
        description: `Successfully ${product ? "updated" : "added"} product: ${formData.title}`,
      });
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: `Failed to ${product ? "update" : "create"} product. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: "clothing", name: "Clothing" },
    { id: "footwear", name: "Footwear" },
    { id: "accessories", name: "Accessories" },
    { id: "new", name: "New Arrivals" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Product Name</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="price">Price (ETB)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded"
          ></textarea>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="in_stock"
            name="in_stock"
            checked={formData.in_stock}
            onChange={handleChange}
          />
          <Label htmlFor="in_stock">In Stock</Label>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Button type="submit" disabled={isSubmitting} className="bg-emerge-gold text-black hover:bg-emerge-gold/80">
          {isSubmitting ? "Saving..." : product ? "Update Product" : "Add Product"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
