
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
import { Loader2, ImagePlus, AlertCircle, Plus, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCategory, ProductVariation } from "@/services/productTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editProduct?: any;
  product?: any;
  isLocked?: boolean;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  editProduct,
  product,
  isLocked
}) => {
  const { toast } = useToast();
  const [activeProduct, setActiveProduct] = useState<any>(editProduct || product || {});
  const [title, setTitle] = useState(activeProduct?.title || "");
  const [description, setDescription] = useState(activeProduct?.description || "");
  const [price, setPrice] = useState(activeProduct?.price?.toString() || "");
  const [category, setCategory] = useState<ProductCategory>(activeProduct?.category || "clothing");
  const [imageUrl, setImageUrl] = useState(activeProduct?.image_url || "");
  const [isPublished, setIsPublished] = useState(activeProduct?.is_published || false);
  const [inStock, setInStock] = useState(activeProduct?.in_stock || false);
  const [sku, setSku] = useState(activeProduct?.sku || "");
  const [weight, setWeight] = useState(activeProduct?.weight?.toString() || "");
  const [stockQuantity, setStockQuantity] = useState(activeProduct?.stock_quantity?.toString() || "0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [variations, setVariations] = useState<ProductVariation[]>(activeProduct?.variations || []);
  
  useEffect(() => {
    const productToUse = editProduct || product;
    if (productToUse) {
      setActiveProduct(productToUse);
      setTitle(productToUse.title || "");
      setDescription(productToUse.description || "");
      setPrice(productToUse.price?.toString() || "");
      setCategory(productToUse.category || "clothing");
      setImageUrl(productToUse.image_url || "");
      setIsPublished(productToUse.is_published || false);
      setInStock(productToUse.in_stock || false);
      setSku(productToUse.sku || "");
      setWeight(productToUse.weight?.toString() || "");
      setStockQuantity(productToUse.stock_quantity?.toString() || "0");
      
      // Parse variations if they're stored as a string array
      if (Array.isArray(productToUse.variations)) {
        if (typeof productToUse.variations[0] === 'string') {
          // Convert legacy string array to variation objects
          const legacyVariations = productToUse.variations.map((v: string, idx: number) => ({
            id: `temp-${idx}`,
            product_id: productToUse.id || 'new',
            sku: `${productToUse.sku || 'SKU'}-${idx}`,
            size: v,
            stock_quantity: 0
          }));
          setVariations(legacyVariations);
        } else {
          // Already in the correct format
          setVariations(productToUse.variations);
        }
      } else {
        setVariations([]);
      }
    }
  }, [editProduct, product]);

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

      // Use the URLs with .from() to correctly form the URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      setImageUrl(publicUrl);
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

  const addVariation = () => {
    const newVariation: ProductVariation = {
      id: `temp-${Date.now()}`,
      product_id: activeProduct.id || 'new',
      size: '',
      color: '',
      stock_quantity: 0,
      sku: `${sku || 'SKU'}-${variations.length + 1}`
    };
    setVariations([...variations, newVariation]);
  };

  const removeVariation = (index: number) => {
    const updatedVariations = [...variations];
    updatedVariations.splice(index, 1);
    setVariations(updatedVariations);
  };

  const handleVariationChange = (index: number, field: keyof ProductVariation, value: any) => {
    const updatedVariations = [...variations];
    updatedVariations[index] = {
      ...updatedVariations[index],
      [field]: field === 'stock_quantity' ? parseInt(value) : value
    };
    setVariations(updatedVariations);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("clothing");
    setImageUrl("");
    setIsPublished(false);
    setInStock(false);
    setSku("");
    setWeight("");
    setStockQuantity("0");
    setVariations([]);
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
        category: category as ProductCategory,
        image_url: imageUrl,
        is_published: isPublished,
        in_stock: inStock,
        sku,
        weight: weight ? parseFloat(weight) : null,
        stock_quantity: stockQuantity ? parseInt(stockQuantity) : 0,
        variations: variations,
        updated_at: new Date().toISOString()
      };
      
      let productId = activeProduct?.id;
      
      if (productId) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);
          
        if (error) throw error;
        
        // Handle variations
        for (const variation of variations) {
          if (variation.id.startsWith('temp-')) {
            // Create new variation
            const { error: varError } = await supabase
              .from('product_variations')
              .insert({
                product_id: productId,
                size: variation.size,
                color: variation.color,
                stock_quantity: variation.stock_quantity,
                sku: variation.sku,
                price: variation.price || null
              });
            if (varError) throw varError;
          } else {
            // Update existing variation
            const { error: varError } = await supabase
              .from('product_variations')
              .update({
                size: variation.size,
                color: variation.color,
                stock_quantity: variation.stock_quantity,
                sku: variation.sku,
                price: variation.price || null
              })
              .eq('id', variation.id);
            if (varError) throw varError;
          }
        }
        
        toast({
          title: "Product updated",
          description: "The product has been successfully updated"
        });
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            ...productData,
            created_at: new Date().toISOString()
          })
          .select();
          
        if (error) throw error;
        
        productId = data[0].id;
        
        // Create variations
        for (const variation of variations) {
          const { error: varError } = await supabase
            .from('product_variations')
            .insert({
              product_id: productId,
              size: variation.size,
              color: variation.color,
              stock_quantity: variation.stock_quantity,
              sku: variation.sku,
              price: variation.price || null
            });
          if (varError) throw varError;
        }
        
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{activeProduct?.id ? "Edit Product" : "Create New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="variations">Variations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
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
              <div className="flex items-center space-x-2">
                <Label htmlFor="isPublished">Published</Label>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="inventory" className="space-y-4">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU code"
                />
              </div>
              <div>
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Product weight in kg"
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
            </TabsContent>
            
            <TabsContent value="variations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Product Variations</h4>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={addVariation}
                  disabled={isLocked}
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
                    <Card key={variation.id || index} className="relative">
                      <CardContent className="p-4">
                        <div className="absolute top-2 right-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeVariation(index)}
                            disabled={isLocked}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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
                            />
                          </div>
                          <div>
                            <Label htmlFor={`variation-stock-${index}`}>Stock</Label>
                            <Input
                              id={`variation-stock-${index}`}
                              type="number"
                              value={variation.stock_quantity || 0}
                              onChange={(e) => handleVariationChange(index, 'stock_quantity', e.target.value)}
                              placeholder="Available stock"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`variation-price-${index}`}>Price Override (Optional)</Label>
                            <Input
                              id={`variation-price-${index}`}
                              type="number"
                              value={variation.price || ''}
                              onChange={(e) => handleVariationChange(index, 'price', e.target.value ? parseFloat(e.target.value) : null)}
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
                          <Badge variant="secondary">Stock: {variation.stock_quantity}</Badge>
                          {variation.price && (
                            <Badge variant="secondary">Price: ${variation.price}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
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
