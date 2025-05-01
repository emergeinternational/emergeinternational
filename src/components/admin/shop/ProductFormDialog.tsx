import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@radix-ui/react-select";
import {
  Dispatch,
  SetStateAction,
  useState
} from 'react';
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ProductFormDialogProps, ProductVariation } from "./ProductFormDialog.d";

const formSchema = z.object({
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
    } catch (e) {
      return false;
    }
  }, {
    message: "Price must be a valid number greater than zero.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }),
  isPublished: z.boolean().default(false),
  inStock: z.boolean().default(true),
  variations: z.array(
    z.object({
      name: z.string(),
      options: z.array(z.string()),
      price_adjustments: z.array(z.number())
    })
  ).optional(),
});

const ProductFormDialog = ({ open, onOpenChange, product, onSuccess, onProductChange }: ProductFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      price: product?.price?.toString() || "",
      category: product?.category || "",
      imageUrl: product?.image_url || "",
      isPublished: product?.is_published || false,
      inStock: product?.in_stock || true,
      variations: product?.variations ? JSON.parse(product.variations) : []
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Convert variations to JSON-compatible format
      const variationsJson = data.variations ? JSON.stringify(data.variations) : null;
      
      const productData = {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        image_url: data.imageUrl,
        is_published: data.isPublished,
        in_stock: data.inStock,
        variations: variationsJson, // Use JSON string instead of array of objects
        updated_at: new Date().toISOString()
      };

      let result;
      
      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        
        if (error) throw error;
        result = { ...product, ...productData };
        
        toast({
          title: "Product updated",
          description: "The product has been successfully updated.",
        });
      } else {
        // Create new product
        productData.created_at = new Date().toISOString();
        
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();
        
        if (error) throw error;
        result = newProduct;
        
        toast({
          title: "Product created",
          description: "The new product has been successfully created.",
        });
      }
      
      if (onProductChange) {
        onProductChange(result);
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving the product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{product ? "Edit Product" : "Create New Product"}</AlertDialogTitle>
          <AlertDialogDescription>
            {product ? "Update product details." : "Enter details for the new product."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Textarea placeholder="Product description" {...field} />
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
                    <Input placeholder="Product price" type="number" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="home_decor">Home Decor</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input placeholder="Product image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <FormLabel>Publish</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <FormLabel>In Stock</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ProductFormDialog;
