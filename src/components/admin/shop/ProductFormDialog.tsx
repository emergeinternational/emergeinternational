import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStorage } from "@/hooks/useStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Product, ProductCategory, ProductVariation } from "@/services/productTypes";
import { Trash, Plus, Upload, Loader2 } from "lucide-react";

interface ProductFormDialogProps {
  open: boolean;
  product?: Product | null;
  onClose: (refresh: boolean) => void;
}

const ProductFormDialog = ({ open, product, onClose }: ProductFormDialogProps) => {
  const { toast } = useToast();
  const { uploadFile, ensureBucket, isLoading: storageLoading } = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState<ProductCategory>("clothing");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [sku, setSku] = useState("");
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0
  });
  const [shippingInfo, setShippingInfo] = useState({
    freeShipping: false,
    shippingCost: 0,
    estimatedDeliveryDays: 3
  });
  const [designerId, setDesignerId] = useState<string | undefined>(undefined);
  const [designers, setDesigners] = useState<Array<{id: string, full_name: string}>>([]);

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
      setStockQuantity(product.stock_quantity || 0);
      setSku(product.sku || "");
      setWeight(product.weight);
      
      if (product.dimensions) {
        setDimensions(product.dimensions);
      }
      
      if (product.shipping_info) {
        setShippingInfo({
          freeShipping: product.shipping_info.free_shipping,
          shippingCost: product.shipping_info.shipping_cost,
          estimatedDeliveryDays: product.shipping_info.estimated_delivery_days
        });
      }
      
      setDesignerId(product.designer_id);
    } else {
      resetForm();
    }
    
    // Load designers for the dropdown
    fetchDesigners();
    
    // Ensure the products storage bucket exists
    ensureBucket('products', { public: true });
  }, [product]);

  const fetchDesigners = async () => {
    const { data, error } = await supabase
      .from('designers')
      .select('id, full_name')
      .order('full_name', { ascending: true });
      
    if (!error && data) {
      setDesigners(data);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice(0);
    setCategory("clothing");
    setImageUrl("");
    setIsPublished(false);
    setInStock(true);
    setVariations([]);
    setStockQuantity(0);
    setSku("");
    setWeight(undefined);
    setDimensions({ length: 0, width: 0, height: 0 });
    setShippingInfo({
      freeShipping: false,
      shippingCost: 0,
      estimatedDeliveryDays: 3
    });
    setDesignerId(undefined);
    setActiveTab("basic");
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
      
      // Upload to Supabase storage using the utility function
      const publicUrl = await uploadFile('products', file, filePath);
      
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
    
    if (!title) {
      toast({
        title: "Missing information",
        description: "Please provide a product title",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare the product data
      const productData = {
        title,
        description,
        price,
        category,
        image_url: imageUrl,
        is_published: isPublished,
        in_stock: inStock,
        variations,
        stock_quantity: stockQuantity,
        sku,
        weight,
        dimensions: weight ? dimensions : null,
        shipping_info: {
          free_shipping: shippingInfo.freeShipping,
          shipping_cost: shippingInfo.shippingCost,
          estimated_delivery_days: shippingInfo.estimatedDeliveryDays
        },
        designer_id: designerId || null,
        updated_at: new Date().toISOString(),
      };

      if (product?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        
        toast({
          title: "Product updated",
          description: `${title} has been updated successfully.`,
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast({
          title: "Product created",
          description: `${title} has been added successfully.`,
        });
      }

      onClose(true);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error saving product",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? `Edit Product: ${product.title}` : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="variations">Variations</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <TabsContent value="basic" className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-4">
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
                
                <div>
                  <Label htmlFor="designer">Designer</Label>
                  <Select
                    value={designerId}
                    onValueChange={setDesignerId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select designer (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Designer</SelectItem>
                      {designers.map(designer => (
                        <SelectItem key={designer.id} value={designer.id}>
                          {designer.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Status */}
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
            </TabsContent>
            
            <TabsContent value="images">
              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Product Image</Label>
                <div className="flex items-center gap-4">
                  {imageUrl && (
                    <div className="relative h-32 w-32 rounded-md overflow-hidden border">
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
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended size: 800x800px. Max file size: 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory" className="space-y-4">
              {/* Inventory Management */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Stock Keeping Unit"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock-qty">Stock Quantity</Label>
                  <Input
                    id="stock-qty"
                    type="number"
                    min={0}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value))}
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
                  value={weight || ""}
                  onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Product weight"
                />
              </div>
              
              <div>
                <Label>Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={dimensions.length}
                      onChange={(e) => setDimensions({...dimensions, length: parseFloat(e.target.value)})}
                      placeholder="Length"
                    />
                    <span className="text-xs text-gray-500 mt-1 block">Length</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={dimensions.width}
                      onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value)})}
                      placeholder="Width"
                    />
                    <span className="text-xs text-gray-500 mt-1 block">Width</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={dimensions.height}
                      onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value)})}
                      placeholder="Height"
                    />
                    <span className="text-xs text-gray-500 mt-1 block">Height</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Shipping Information</Label>
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox 
                    id="free-shipping" 
                    checked={shippingInfo.freeShipping}
                    onCheckedChange={(checked) => setShippingInfo({
                      ...shippingInfo,
                      freeShipping: !!checked
                    })}
                  />
                  <Label htmlFor="free-shipping">Free Shipping</Label>
                </div>
                
                {!shippingInfo.freeShipping && (
                  <div>
                    <Label htmlFor="shipping-cost">Shipping Cost ($)</Label>
                    <Input
                      id="shipping-cost"
                      type="number"
                      min={0}
                      step={0.01}
                      value={shippingInfo.shippingCost}
                      onChange={(e) => setShippingInfo({
                        ...shippingInfo,
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
                    value={shippingInfo.estimatedDeliveryDays}
                    onChange={(e) => setShippingInfo({
                      ...shippingInfo,
                      estimatedDeliveryDays: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="variations" className="space-y-4">
              {/* Variations Management */}
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
            </TabsContent>
            
            {/* Form Buttons - Always visible */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => onClose(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || !title}
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
