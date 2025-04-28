
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Upload, Plus, MinusCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const productFormSchema = z.object({
  title: z.string().min(1, "Product title is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  is_published: z.boolean().default(false),
  in_stock: z.boolean().default(true),
  image_url: z.string().optional(),
  variations: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Variation name is required"),
      options: z.array(z.string()).min(1, "At least one option is required"),
      price_adjustments: z.array(z.number()).optional(),
    })
  ).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormDialogProps {
  open: boolean;
  product?: any;
  onClose: (refresh: boolean) => void;
}

const ProductFormDialog = ({ open, product, onClose }: ProductFormDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [variations, setVariations] = useState<any[]>([]);

  // Initialize form with default values or product data
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "clothing",
      is_published: false,
      in_stock: true,
      image_url: "",
      variations: [],
    },
  });

  useEffect(() => {
    // Reset form when the dialog opens with product data
    if (open) {
      if (product) {
        form.reset({
          title: product.title || "",
          description: product.description || "",
          price: product.price || 0,
          category: product.category || "clothing",
          is_published: product.is_published || false,
          in_stock: product.in_stock || true,
          image_url: product.image_url || "",
          variations: product.variations || [],
        });
        setImagePreview(product.image_url || null);
        setVariations(product.variations || []);
      } else {
        form.reset({
          title: "",
          description: "",
          price: 0,
          category: "clothing",
          is_published: false,
          in_stock: true,
          image_url: "",
          variations: [],
        });
        setImagePreview(null);
        setImageFile(null);
        setVariations([]);
      }
    }
  }, [open, product, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Upload image if a new one is selected
      let imageUrl = data.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      const productData = {
        ...data,
        image_url: imageUrl,
        variations: variations,
        updated_at: new Date().toISOString(),
      };

      if (product?.id) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;

        toast({
          title: "Product updated",
          description: "Your product has been successfully updated.",
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from("products")
          .insert([{ ...productData, created_at: new Date().toISOString() }]);

        if (error) throw error;

        toast({
          title: "Product created",
          description: "Your new product has been successfully created.",
        });
      }
      
      onClose(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save product: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new variation
  const addVariation = () => {
    setVariations([
      ...variations,
      {
        name: "",
        options: [""],
        price_adjustments: [0],
      },
    ]);
  };

  // Remove a variation
  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  // Update a variation
  const updateVariation = (index: number, field: string, value: any) => {
    const updatedVariations = [...variations];
    updatedVariations[index][field] = value;
    setVariations(updatedVariations);
  };

  // Add a new option to a variation
  const addOption = (variationIndex: number) => {
    const updatedVariations = [...variations];
    updatedVariations[variationIndex].options.push("");
    updatedVariations[variationIndex].price_adjustments.push(0);
    setVariations(updatedVariations);
  };

  // Remove an option from a variation
  const removeOption = (variationIndex: number, optionIndex: number) => {
    const updatedVariations = [...variations];
    updatedVariations[variationIndex].options.splice(optionIndex, 1);
    updatedVariations[variationIndex].price_adjustments.splice(optionIndex, 1);
    setVariations(updatedVariations);
  };

  // Update an option
  const updateOption = (variationIndex: number, optionIndex: number, value: string) => {
    const updatedVariations = [...variations];
    updatedVariations[variationIndex].options[optionIndex] = value;
    setVariations(updatedVariations);
  };

  // Update a price adjustment
  const updatePriceAdjustment = (variationIndex: number, optionIndex: number, value: string) => {
    const updatedVariations = [...variations];
    updatedVariations[variationIndex].price_adjustments[optionIndex] = parseFloat(value) || 0;
    setVariations(updatedVariations);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="variations">Variations</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="details" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Product title" {...field} />
                      </FormControl>
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
                          placeholder="Product description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-7"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="footwear">Footwear</SelectItem>
                            <SelectItem value="accessories">Accessories</SelectItem>
                            <SelectItem value="new_arrivals">New Arrivals</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="is_published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Published</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Make this product visible on the store
                          </div>
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
                  
                  <FormField
                    control={form.control}
                    name="in_stock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>In Stock</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Set product availability status
                          </div>
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
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Product Image</h3>
                    
                    {imagePreview ? (
                      <div className="relative mb-4">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="max-h-[200px] rounded-md mx-auto"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                            form.setValue("image_url", "");
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ) : (
                      <div className="border border-dashed rounded-md flex items-center justify-center p-8 mb-4">
                        <label className="flex flex-col items-center justify-center cursor-pointer">
                          <Upload className="h-10 w-10 text-gray-300 mb-2" />
                          <span className="text-sm text-gray-500">Click to upload image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Recommended: 1200 x 1200 pixels, max 5MB
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="variations" className="py-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Product Variations</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariation}
                    >
                      <Plus size={16} className="mr-1" /> Add Variation
                    </Button>
                  </div>

                  {variations.length === 0 ? (
                    <div className="text-center p-6 border border-dashed rounded-md text-gray-500">
                      No variations added yet. Add variations like Size, Color, etc.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variations.map((variation, vIndex) => (
                        <Collapsible key={vIndex} className="border rounded-md">
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-2">
                              <CollapsibleTrigger className="flex items-center">
                                <Badge variant={variation.name ? "default" : "outline"} className="mr-2">
                                  {variation.name || "Unnamed"}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {variation.options.filter(Boolean).length} option(s)
                                </span>
                              </CollapsibleTrigger>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariation(vIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                          
                          <CollapsibleContent className="p-4 pt-0 border-t">
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Variation Name</label>
                                <Input
                                  value={variation.name}
                                  onChange={(e) => updateVariation(vIndex, "name", e.target.value)}
                                  placeholder="e.g., Size, Color, Material"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-sm font-medium">Options</label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addOption(vIndex)}
                                  >
                                    <Plus size={14} className="mr-1" /> Add Option
                                  </Button>
                                </div>
                                
                                {variation.options.map((option: string, oIndex: number) => (
                                  <div key={oIndex} className="flex items-center space-x-2 mb-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => updateOption(vIndex, oIndex, e.target.value)}
                                      placeholder="Option value"
                                      className="flex-grow"
                                    />
                                    <div className="w-24">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={variation.price_adjustments[oIndex]}
                                        onChange={(e) => updatePriceAdjustment(vIndex, oIndex, e.target.value)}
                                        placeholder="± $0.00"
                                        className="text-right"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeOption(vIndex, oIndex)}
                                      disabled={variation.options.length === 1}
                                    >
                                      <MinusCircle size={16} />
                                    </Button>
                                  </div>
                                ))}
                                <p className="text-xs text-gray-500 mt-1">
                                  Use the number field to set price adjustments (e.g., +10 for $10 extra)
                                </p>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onClose(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (product ? "Update Product" : "Create Product")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
