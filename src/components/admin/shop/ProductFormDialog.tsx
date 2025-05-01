import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, ImagePlus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCategory } from "@/services/productTypes";

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editProduct?: any;
  isLocked?: boolean;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  editProduct,
  isLocked
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(editProduct?.title || "");
  const [description, setDescription] = useState(editProduct?.description || "");
  const [price, setPrice] = useState(editProduct?.price?.toString() || "");
  const [category, setCategory] = useState<ProductCategory>(editProduct?.category || "clothing");
  const [imageUrl, setImageUrl] = useState(editProduct?.image_url || "");
  const [isPublished, setIsPublished] = useState(editProduct?.is_published || false);
  const [inStock, setInStock] = useState(editProduct?.in_stock || false);
  const [variations, setVariations] = useState(editProduct?.variations?.join(',') || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [variationsArray, setVariationsArray] = useState<string[]>(editProduct?.variations || []);

  useEffect(() => {
    if (editProduct) {
      setTitle(editProduct.title || "");
      setDescription(editProduct.description || "");
      setPrice(editProduct.price?.toString() || "");
      setCategory(editProduct.category || "clothing");
      setImageUrl(editProduct.image_url || "");
      setIsPublished(editProduct.is_published || false);
      setInStock(editProduct.in_stock || false);
      setVariations(editProduct.variations?.join(',') || "");
      setVariationsArray(editProduct.variations || []);
    }
  }, [editProduct]);

  const handleVariationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVariations(e.target.value);
    const newVariations = e.target.value.split(',').map(v => v.trim()).filter(v => v !== "");
    setVariationsArray(newVariations);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const imageUrl = `${supabase.storageUrl}/product-images/${data.path}`;
      setImageUrl(imageUrl);
      toast({
        title: "Image uploaded",
        description: "The product image has been successfully uploaded"
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "There was a problem uploading the image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("clothing");
    setImageUrl("");
    setIsPublished(false);
    setInStock(false);
    setVariations("");
    setVariationsArray([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast({
        title: "Page is locked",
        description: "Unable to save product while the page is locked",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const productData = {
        title,
        description,
        price: parseFloat(price),
        category: category as ProductCategory, // Cast as ProductCategory
        image_url: imageUrl,
        is_published: isPublished,
        in_stock: inStock,
        variations: variationsArray,
        updated_at: new Date().toISOString()
      };
      
      if (editProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editProduct.id);
          
        if (error) throw error;
        
        toast({
          title: "Product updated",
          description: "The product has been successfully updated"
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            ...productData,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        toast({
          title: "Product created",
          description: "The product has been successfully created"
        });
      }
      
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the product",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ProductCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="footwear">Footwear</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="new_arrivals">New Arrivals</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="image">Image URL</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="image"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or upload a new image"
              />
              <Label htmlFor="upload-image" className="cursor-pointer">
                <div className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md px-3 py-2 text-sm font-medium">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4" />
                      <span>Upload</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  id="upload-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </Label>
            </div>
          </div>
          <div>
            <Label htmlFor="variations">Variations (comma separated)</Label>
            <Input
              id="variations"
              type="text"
              value={variations}
              onChange={handleVariationsChange}
              placeholder="e.g., S, M, L, XL"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="isPublished">Published</Label>
            <Switch
              id="isPublished"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="inStock">In Stock</Label>
            <Switch
              id="inStock"
              checked={inStock}
              onCheckedChange={setInStock}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
