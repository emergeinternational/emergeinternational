import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Product, ProductCategory, ProductVariation } from "@/services/productTypes";
import { Trash, Plus, Upload, Loader2 } from "lucide-react";
import { ProductFormDialogProps } from "./ProductFormDialog.d";

const ProductFormDialog = ({ open, onOpenChange, product, onSuccess, onProductChange }: ProductFormDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState<ProductCategory>("clothing");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [inStock, setInStock] = useState(true);
  
  // Variations state
  const [variations, setVariations] = useState<ProductVariation[]>([]);

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setDescription(product.description || "");
      setPrice(product.price || 0);
      setCategory(product.category || "clothing");
      setImageUrl(product.image_url || "");
      setIsPublished(product.is_published || false);
      setInStock(product.in_stock || true);
      setVariations(product.variations || []);
    } else {
      resetForm();
    }
  }, [product]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice(0);
    setCategory("clothing");
    setImageUrl("");
    setIsPublished(false);
    setInStock(true);
    setVariations([]);
  };

  const handleAddVariation = () => {
    const newVariation: ProductVariation = {
      name: "",
      options: [""],
      price_adjustments: [0],
    };
    setVariations([...variations, newVariation]);
  };

  const handleRemoveVariation = (index: number) => {
    const newVariations = [...variations];
    newVariations.splice(index, 1);
    setVariations(newVariations);
  };

  const handleVariationNameChange = (index: number, name: string) => {
    const newVariations = [...variations];
    newVariations[index].name = name;
    setVariations(newVariations);
  };

  const handleAddVariationOption = (variationIndex: number) => {
    const newVariations = [...variations];
    newVariations[variationIndex].options.push("");
    newVariations[variationIndex].price_adjustments.push(0);
    setVariations(newVariations);
  };

  const handleRemoveVariationOption = (variationIndex: number, optionIndex: number) => {
    const newVariations = [...variations];
    newVariations[variationIndex].options.splice(optionIndex, 1);
    newVariations[variationIndex].price_adjustments.splice(optionIndex, 1);
    setVariations(newVariations);
  };

  const handleVariationOptionChange = (variationIndex: number, optionIndex: number, option: string) => {
    const newVariations = [...variations];
    newVariations[variationIndex].options[optionIndex] = option;
    setVariations(newVariations);
  };

  const handleVariationPriceChange = (variationIndex: number, optionIndex: number, price: number) => {
    const newVariations = [...variations];
    newVariations[variationIndex].price_adjustments[optionIndex] = price;
    setVariations(newVariations);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast({
        title: "Image uploaded successfully",
        description: "The product image has been uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !category || !price) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare the product data - ensure variations is handled properly
      const productData = {
        title,
        description,
        price: parseFloat(price.toString()),
        category,
        image_url: imageUrl,
        is_published: isPublished,
        in_stock: inStock,
        variations, // Store as JSON array
        updated_at: new Date().toISOString(),
      };

      let result;

      if (product?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        
        toast({
          title: "Product updated",
          description: "Product has been updated successfully",
        });
      } else {
        // Add created_at for new products
        const newProductData = {
          ...productData,
          created_at: new Date().toISOString(),
        };
        
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert(newProductData)
          .select()
          .single();

        if (error) throw error;
        result = data;
        
        toast({
          title: "Product created",
          description: "New product has been created successfully",
        });
      }

      // Reset form
      onOpenChange(false);
      if (onProductChange) {
        onProductChange(result || { ...productData, id: product?.id });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error saving product",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? `Edit Product: ${product.title}` : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter product title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description || ""}
                  onChange={(e) => setDescription(e.target.value)}
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
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value as ProductCategory)}
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
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label>Product Image</Label>
            <div className="flex items-center gap-4">
              {imageUrl && (
                <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                  <img
                    src={imageUrl}
                    alt="Product"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer flex items-center gap-2 border rounded-md px-3 py-2 hover:bg-gray-100"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{imageUrl ? "Change Image" : "Upload Image"}</span>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </div>
            </div>
          </div>

          {/* Product Status */}
          <div className="space-y-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is-published" 
                  checked={isPublished}
                  onCheckedChange={(checked) => setIsPublished(!!checked)}
                />
                <Label htmlFor="is-published">Published</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="in-stock" 
                  checked={inStock}
                  onCheckedChange={(checked) => setInStock(!!checked)}
                />
                <Label htmlFor="in-stock">In Stock</Label>
              </div>
            </div>
          </div>

          {/* Variations */}
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
            
            {variations.length > 0 ? (
              <div className="space-y-6">
                {variations.map((variation, vIndex) => (
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
                    
                    {/* Variation Options */}
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {variation.options.map((option, oIndex) => (
                        <div key={oIndex} className="grid grid-cols-3 gap-2 items-center">
                          <Input
                            value={option}
                            onChange={(e) => handleVariationOptionChange(vIndex, oIndex, e.target.value)}
                            placeholder="Option name"
                            className="col-span-2"
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Price adjustment"
                              value={variation.price_adjustments[oIndex]}
                              onChange={(e) => handleVariationPriceChange(vIndex, oIndex, parseFloat(e.target.value))}
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
          
          {/* Form Buttons */}
          <div className="flex justify-end gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !title.trim() || !category || !price}
              className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{product ? "Update Product" : "Create Product"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
