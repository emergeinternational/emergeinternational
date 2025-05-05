
import React, { useState, useRef, useEffect } from "react";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { ShopProduct, ProductFormValues, Collection } from "@/types/shop";
import { createProduct, updateProduct, uploadProductImage } from "@/services/shopService";
import { getCollections } from "@/services/collectionService";
import { DialogClose } from "@/components/ui/dialog";
import ProductVariationForm from "./ProductVariationForm";
import { Upload, ImageIcon, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  description: z.string().optional(),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  in_stock: z.boolean().default(true),
  category: z.string().min(1, "Category is required"),
  collection_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: ShopProduct | null;
  onSuccess: (product: ShopProduct | null) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [variations, setVariations] = useState(product?.variations || []);
  const [collections, setCollections] = useState<Collection[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!product;

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    const data = await getCollections();
    setCollections(data);
  };

  const defaultValues: Partial<FormValues> = {
    title: product?.title || "",
    price: product ? product.price / 100 : undefined,
    description: product?.description || "",
    image_url: product?.image_url || "",
    in_stock: product?.in_stock ?? true,
    category: product?.category || "",
    collection_id: product?.collection_id || undefined,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadProductImage(file);
      
      if (imageUrl) {
        form.setValue('image_url', imageUrl);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Convert price to cents for storage
      const productData: ProductFormValues = {
        title: data.title,
        price: Math.round(data.price * 100),
        description: data.description,
        image_url: data.image_url,
        in_stock: data.in_stock,
        category: data.category,
        collection_id: data.collection_id || undefined,
        variations: variations,
      };

      let savedProduct: ShopProduct | null = null;
      
      if (isEditing && product) {
        savedProduct = await updateProduct(product.id, productData);
        if (savedProduct) {
          toast.success("Product updated successfully");
        }
      } else {
        savedProduct = await createProduct(productData);
        if (savedProduct) {
          toast.success("Product created successfully");
        }
      }
      
      onSuccess(savedProduct);
      form.reset(defaultValues);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save product");
      onSuccess(null); // Pass null to indicate failure
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price (USD)</FormLabel>
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
        </div>
        
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
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.title} ({collection.designer_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <FormLabel>Product Image</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormControl>
                    <Input placeholder="Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </div>
                <div className="flex flex-col items-center">
                  <div className="border rounded-md p-2 w-full relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : field.value ? (
                        <img 
                          src={field.value} 
                          alt="Preview" 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 mb-1" />
                          <span className="text-xs">Upload image</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
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
        
        {/* Product Variations */}
        <ProductVariationForm 
          variations={variations}
          onVariationsChange={setVariations}
        />
        
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditing ? "Update Product" : "Create Product"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
