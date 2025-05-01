import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { safeJsonStringify } from "@/utils/jsonUtils";
import { ProductVariation } from "./ProductFormDialog.d";

const productFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.string().refine((value) => {
    try {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    } catch (error) {
      return false;
    }
  }, {
    message: "Price must be a valid number greater than zero.",
  }),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  imageUrl: z.string().url({
    message: "Image URL must be a valid URL.",
  }),
  isPublished: z.boolean().default(false),
  inStock: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  product?: any;
  onSuccess?: () => void;
  onProductChange?: (product: any) => void;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSuccess,
  onProductChange,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [variations, setVariations] = useState<ProductVariation[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      price: product?.price?.toString() || "",
      category: product?.category || "",
      imageUrl: product?.image_url || "",
      isPublished: product?.is_published || false,
      inStock: product?.in_stock || true,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        title: product.title || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        category: product.category || "",
        imageUrl: product.image_url || "",
        isPublished: product.is_published || false,
        inStock: product.in_stock || true,
      });

      // Parse variations from JSON string
      try {
        const parsedVariations = product.variations ? JSON.parse(product.variations) : [];
        setVariations(parsedVariations);
      } catch (error) {
        console.error("Error parsing variations:", error);
        toast({
          title: "Error",
          description: "Failed to parse product variations",
          variant: "destructive",
        });
        setVariations([]);
      }
    } else {
      form.reset({
        title: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
        isPublished: false,
        inStock: true,
      });
      setVariations([]);
    }
  }, [product, form, toast]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleVariationChange = (index: number, field: string, value: any) => {
    const updatedVariations = [...variations];
    if (field === 'options' || field === 'price_adjustments') {
      updatedVariations[index][field] = value;
    } else {
      updatedVariations[index][field] = value;
    }
    setVariations(updatedVariations);
  };

  const handleAddVariation = () => {
    setVariations([
      ...variations,
      {
        name: "",
        options: [],
        price_adjustments: [],
      },
    ]);
  };

  const handleRemoveVariation = (index: number) => {
    const updatedVariations = [...variations];
    updatedVariations.splice(index, 1);
    setVariations(updatedVariations);
  };

  const onSubmit = async (data: ProductFormData) => {
    if (product) {
      handleSaveChanges();
    } else {
      handleCreateProduct();
    }
  };

  // Handle save changes, update instead of create
  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);

      const formValues = form.getValues();
      const productData = {
        title: formValues.title,
        description: formValues.description,
        price: parseFloat(formValues.price),
        category: formValues.category,
        image_url: formValues.imageUrl,
        is_published: formValues.isPublished,
        in_stock: formValues.inStock,
        variations: safeJsonStringify(variations), // Stringify the variations
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", product.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle create new product
  const handleCreateProduct = async () => {
    try {
      setIsSubmitting(true);

      const formValues = form.getValues();
      const productData = {
        title: formValues.title,
        description: formValues.description,
        price: parseFloat(formValues.price),
        category: formValues.category,
        image_url: formValues.imageUrl,
        is_published: formValues.isPublished,
        in_stock: formValues.inStock,
        variations: safeJsonStringify(variations), // Stringify the variations
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Failed to create product:", error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Create New Product"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Edit the details of the selected product."
              : "Create a new product by entering the details below."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Product Title" {...field} />
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
                      placeholder="Product Description"
                      className="resize-none"
                      {...field}
                    />
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
                    <Input placeholder="Product Price" {...field} />
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
                  <FormControl>
                    <Input placeholder="Product Category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Product Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Publish</p>
                <p className="text-sm text-muted-foreground">
                  Set product to published.
                </p>
              </div>
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem>
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
            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">In Stock</p>
                <p className="text-sm text-muted-foreground">
                  Set product to in stock.
                </p>
              </div>
              <FormField
                control={form.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem>
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

            <div>
              <FormLabel>Variations</FormLabel>
              {variations.map((variation, index) => (
                <div key={index} className="border p-4 rounded-md mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormLabel>Variation Name</FormLabel>
                      <Input
                        type="text"
                        placeholder="Variation Name"
                        value={variation.name}
                        onChange={(e) => handleVariationChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div>
                      <FormLabel>Options (comma-separated)</FormLabel>
                      <Input
                        type="text"
                        placeholder="Option 1, Option 2"
                        value={variation.options.join(",")}
                        onChange={(e) =>
                          handleVariationChange(
                            index,
                            "options",
                            e.target.value.split(",")
                          )
                        }
                      />
                    </div>
                    <div>
                      <FormLabel>Price Adjustments (comma-separated)</FormLabel>
                      <Input
                        type="text"
                        placeholder="0, 5, -3"
                        value={variation.price_adjustments.join(",")}
                        onChange={(e) =>
                          handleVariationChange(
                            index,
                            "price_adjustments",
                            e.target.value.split(",").map(Number)
                          )
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleRemoveVariation(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Variation
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddVariation}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Variation
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
