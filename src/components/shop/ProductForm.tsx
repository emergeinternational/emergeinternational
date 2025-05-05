
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, ImagePlus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getCollections } from "@/services/collectionService";
import { ShopProduct, ProductFormValues, Collection, ProductVariation } from "@/types/shop";
import { createProductSubmission, updateProductSubmission, saveProductDraft } from "@/services/designerProductService";
import { supabase } from "@/integrations/supabase/client";

interface ProductFormProps {
  product: ShopProduct | null;
  onSuccess: (product: ShopProduct | null) => void;
  submitType: 'draft' | 'pending';
}

const productFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  image_url: z.string().optional(),
  in_stock: z.boolean().default(true),
  category: z.string().optional(),
  collection_id: z.string().optional(),
  variations: z.array(
    z.object({
      id: z.string().optional(),
      size: z.string().optional(),
      color: z.string().optional(),
      stock_quantity: z.coerce.number().min(0),
      sku: z.string().min(1, "SKU is required"),
      price: z.coerce.number().optional(),
    })
  ).optional(),
});

type ProductFormType = z.infer<typeof productFormSchema>;

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, submitType }) => {
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<ProductFormType>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      price: product?.price || 0,
      image_url: product?.image_url || "",
      in_stock: product?.in_stock !== false,
      category: product?.category || "",
      collection_id: product?.collection_id || undefined,
      variations: product?.variations || [],
    },
  });

  // Fetch collections on component mount
  React.useEffect(() => {
    const fetchCollections = async () => {
      const collectionsData = await getCollections();
      setCollections(collectionsData);
    };
    fetchCollections();
  }, []);

  const handleSubmit = async (data: ProductFormType) => {
    setIsSubmitting(true);
    try {
      if (submitType === 'draft') {
        // Save as draft
        const result = await saveProductDraft(data as ProductFormValues, product?.id);
        if (result) {
          onSuccess(result);
          toast({
            title: "Draft saved",
            description: "Your product has been saved as a draft"
          });
        }
      } else if (product) {
        // Update existing product
        const result = await updateProductSubmission(product.id, data as ProductFormValues);
        if (result) {
          onSuccess(result);
          toast({
            title: "Product updated",
            description: "Your product has been updated and resubmitted for approval"
          });
        }
      } else {
        // Create new product
        const result = await createProductSubmission(data as ProductFormValues);
        if (result) {
          onSuccess(result);
          toast({
            title: "Product submitted",
            description: "Your product has been submitted for approval"
          });
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      form.setValue("image_url", publicUrl);
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully"
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const addVariation = () => {
    const variations = form.getValues("variations") || [];
    const newVariation: ProductVariation = {
      id: `temp-${Date.now()}`,
      size: "",
      color: "",
      stock_quantity: 1,
      sku: `${form.getValues("title").substring(0, 3).toUpperCase() || "SKU"}-${variations.length + 1}`,
    };
    form.setValue("variations", [...variations, newVariation]);
  };

  const removeVariation = (index: number) => {
    const variations = form.getValues("variations") || [];
    const updatedVariations = [...variations];
    updatedVariations.splice(index, 1);
    form.setValue("variations", updatedVariations);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="variations">Variations</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value && (
                          <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={field.value}
                              alt="Product preview"
                              className="w-full h-full object-contain"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full"
                              onClick={() => form.setValue("image_url", "")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Input
                            type="url"
                            placeholder="Enter image URL or upload"
                            {...field}
                            className="flex-1"
                          />
                          <div className="relative">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={uploading}
                              className="w-[120px]"
                            >
                              {uploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading
                                </>
                              ) : (
                                <>
                                  <ImagePlus className="mr-2 h-4 w-4" />
                                  Upload
                                </>
                              )}
                            </Button>
                            <Input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload or paste a URL to your product image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product description"
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                          <SelectItem value="footwear">Footwear</SelectItem>
                          <SelectItem value="jewelry">Jewelry</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collection_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select collection" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {collections.map(collection => (
                            <SelectItem key={collection.id} value={collection.id}>
                              {collection.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="in_stock"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>In Stock</FormLabel>
                      <FormDescription>
                        Mark this product as available for purchase
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="variations" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Product Variations</h4>
                  <p className="text-sm text-gray-500">Add size, color and other variations</p>
                </div>
                <Button type="button" onClick={addVariation} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variation
                </Button>
              </div>

              {form.watch("variations")?.length === 0 ? (
                <Card>
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-gray-100 p-3 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium">No variations added</h4>
                    <p className="text-sm text-gray-500 max-w-md mt-1">
                      Add variations like sizes and colors to give customers more options
                    </p>
                    <Button
                      type="button"
                      onClick={addVariation}
                      className="mt-4"
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Variation
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {form.watch("variations")?.map((variation, index) => (
                    <Card key={variation.id || index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="font-medium">Variation {index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariation(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <FormLabel>Size</FormLabel>
                            <Input
                              value={(form.watch("variations") || [])[index]?.size || ""}
                              onChange={(e) => {
                                const updatedVariations = [...(form.getValues("variations") || [])];
                                updatedVariations[index] = {
                                  ...updatedVariations[index],
                                  size: e.target.value,
                                };
                                form.setValue("variations", updatedVariations);
                              }}
                              placeholder="e.g. S, M, L, XL"
                            />
                          </div>

                          <div className="space-y-2">
                            <FormLabel>Color</FormLabel>
                            <Input
                              value={(form.watch("variations") || [])[index]?.color || ""}
                              onChange={(e) => {
                                const updatedVariations = [...(form.getValues("variations") || [])];
                                updatedVariations[index] = {
                                  ...updatedVariations[index],
                                  color: e.target.value,
                                };
                                form.setValue("variations", updatedVariations);
                              }}
                              placeholder="e.g. Red, Blue, Green"
                            />
                          </div>

                          <div className="space-y-2">
                            <FormLabel>SKU</FormLabel>
                            <Input
                              value={(form.watch("variations") || [])[index]?.sku || ""}
                              onChange={(e) => {
                                const updatedVariations = [...(form.getValues("variations") || [])];
                                updatedVariations[index] = {
                                  ...updatedVariations[index],
                                  sku: e.target.value,
                                };
                                form.setValue("variations", updatedVariations);
                              }}
                              placeholder="Stock Keeping Unit"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <FormLabel>Stock Quantity</FormLabel>
                            <Input
                              type="number"
                              min="0"
                              value={(form.watch("variations") || [])[index]?.stock_quantity || 0}
                              onChange={(e) => {
                                const updatedVariations = [...(form.getValues("variations") || [])];
                                updatedVariations[index] = {
                                  ...updatedVariations[index],
                                  stock_quantity: parseInt(e.target.value) || 0,
                                };
                                form.setValue("variations", updatedVariations);
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <FormLabel>Price Override (Optional)</FormLabel>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Leave empty to use main price"
                              value={(form.watch("variations") || [])[index]?.price || ""}
                              onChange={(e) => {
                                const updatedVariations = [...(form.getValues("variations") || [])];
                                updatedVariations[index] = {
                                  ...updatedVariations[index],
                                  price: e.target.value ? parseFloat(e.target.value) : undefined,
                                };
                                form.setValue("variations", updatedVariations);
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {(form.watch("variations") || [])[index]?.size && (
                            <Badge variant="outline">
                              Size: {(form.watch("variations") || [])[index]?.size}
                            </Badge>
                          )}
                          {(form.watch("variations") || [])[index]?.color && (
                            <Badge variant="outline">
                              Color: {(form.watch("variations") || [])[index]?.color}
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            Stock: {(form.watch("variations") || [])[index]?.stock_quantity}
                          </Badge>
                          {(form.watch("variations") || [])[index]?.price && (
                            <Badge variant="secondary">
                              Price: ${(form.watch("variations") || [])[index]?.price}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : product ? (
                submitType === 'draft' ? "Save Draft" : "Update Product"
              ) : (
                submitType === 'draft' ? "Save as Draft" : "Submit for Approval"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;
