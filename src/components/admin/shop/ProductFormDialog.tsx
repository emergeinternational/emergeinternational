
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStorage } from "@/hooks/useStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/services/productTypes";
import { Loader2 } from "lucide-react";
import { BasicInfoTab } from "./components/BasicInfoTab";
import { ImagesTab } from "./components/ImagesTab";
import { InventoryTab } from "./components/InventoryTab";
import { VariationsTab } from "./components/VariationsTab";
import { ProductFormProps } from "./types/product-form";

const ProductFormDialog: React.FC<ProductFormProps> = ({ 
  open, 
  product, 
  onClose, 
  onMockSave 
}) => {
  const { toast } = useToast();
  const { uploadFile, ensureBucket } = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isMockProduct, setIsMockProduct] = useState(false);
  
  // Form state
  const [formValues, setFormValues] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    category: "clothing",
    imageUrl: "",
    isPublished: false,
    inStock: true,
    variations: [],
    stockQuantity: 0,
    sku: "",
    weight: undefined,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    shippingInfo: {
      freeShipping: false,
      shippingCost: 0,
      estimatedDeliveryDays: 3
    }
  });

  useEffect(() => {
    if (product) {
      setIsMockProduct(product.id.startsWith("mock-"));
      setFormValues({
        title: product.title || "",
        description: product.description || "",
        price: product.price || 0,
        category: product.category || "clothing",
        imageUrl: product.image_url || "",
        isPublished: product.is_published || false,
        inStock: product.in_stock || true,
        variations: product.variations || [],
        stockQuantity: product.stock_quantity || 0,
        sku: product.sku || "",
        weight: product.weight,
        dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
        shippingInfo: product.shipping_info || {
          freeShipping: false,
          shippingCost: 0,
          estimatedDeliveryDays: 3
        }
      });
    }
    
    ensureBucket('products', { public: true });
  }, [product]);

  const handleFormChange = (field: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      if (isMockProduct) {
        setFormValues(prev => ({ ...prev, imageUrl: file.name }));
        toast({
          title: "Mock image set",
          description: "For mock products, we're setting the image filename only."
        });
        return;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const publicUrl = await uploadFile('products', file, fileName);
      
      setFormValues(prev => ({ ...prev, imageUrl: publicUrl }));
      toast({
        title: "Image uploaded successfully",
        description: "The product image has been uploaded."
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
    
    if (!formValues.title) {
      toast({
        title: "Missing information",
        description: "Please provide a product title",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const productData = {
        title: formValues.title,
        description: formValues.description,
        price: formValues.price,
        category: formValues.category,
        image_url: formValues.imageUrl,
        is_published: formValues.isPublished,
        in_stock: formValues.inStock,
        variations: formValues.variations,
        stock_quantity: formValues.stockQuantity,
        sku: formValues.sku,
        weight: formValues.weight,
        dimensions: formValues.weight ? formValues.dimensions : null,
        shipping_info: formValues.shippingInfo,
        updated_at: new Date().toISOString(),
      };

      if (isMockProduct) {
        const { data, error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString(),
          }])
          .select();

        if (error) throw error;
        
        if (data && data[0] && onMockSave && product) {
          onMockSave({
            ...product,
            ...data[0]
          });
        }

        toast({
          title: "Mock product converted",
          description: `${formValues.title} has been converted to a real product.`,
        });
      } else if (product?.id && !isMockProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        
        toast({
          title: "Product updated",
          description: `${formValues.title} has been updated successfully.`,
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast({
          title: "Product created",
          description: `${formValues.title} has been added successfully.`,
        });
      }

      onClose(true);
    } catch (err: any) {
      toast({
        title: "Error saving product",
        description: err.message || "Something went wrong",
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
            {isMockProduct 
              ? `Convert Mock Product: ${product?.title}`
              : product 
                ? `Edit Product: ${product.title}` 
                : "Add New Product"
            }
            {isMockProduct && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                Mock Product - Will be converted to real product
              </span>
            )}
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
            <TabsContent value="basic">
              <BasicInfoTab
                product={product}
                onChange={handleFormChange}
                formValues={formValues}
                isMockProduct={isMockProduct}
              />
            </TabsContent>
            
            <TabsContent value="images">
              <ImagesTab
                product={product}
                onChange={handleFormChange}
                formValues={formValues}
                isMockProduct={isMockProduct}
                uploadingImage={uploadingImage}
                handleImageUpload={handleImageUpload}
              />
            </TabsContent>
            
            <TabsContent value="inventory">
              <InventoryTab
                product={product}
                onChange={handleFormChange}
                formValues={formValues}
                isMockProduct={isMockProduct}
              />
            </TabsContent>
            
            <TabsContent value="variations">
              <VariationsTab
                product={product}
                onChange={handleFormChange}
                formValues={formValues}
                isMockProduct={isMockProduct}
              />
            </TabsContent>
            
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
                disabled={isSubmitting || !formValues.title}
                className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{isMockProduct ? "Convert to Real Product" : product ? "Update Product" : "Create Product"}</>
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
