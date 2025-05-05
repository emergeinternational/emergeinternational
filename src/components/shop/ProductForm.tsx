
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ShopProduct, ProductFormValues } from "@/types/shop";
import { createProduct, updateProduct } from "@/services/shopService";
import { DialogClose } from "@/components/ui/dialog";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  description: z.string().optional(),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  in_stock: z.boolean().default(true),
  category: z.string().min(1, "Category is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: ShopProduct;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!product;

  const defaultValues: Partial<FormValues> = {
    title: product?.title || "",
    price: product ? product.price / 100 : undefined,
    description: product?.description || "",
    image_url: product?.image_url || "",
    in_stock: product?.in_stock ?? true,
    category: product?.category || "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Convert price to cents for storage
      const productData = {
        ...data,
        price: Math.round(data.price * 100),
      };

      if (isEditing && product) {
        await updateProduct(product.id, productData);
        toast.success("Product updated successfully");
      } else {
        await createProduct(productData);
        toast.success("Product created successfully");
      }
      
      onSuccess();
      form.reset(defaultValues);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} />
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
              <FormLabel>Price (USD)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  step="0.01" 
                  {...field} 
                />
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
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
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
                <Input placeholder="E.g. clothing, accessories" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="in_stock"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">In Stock</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
