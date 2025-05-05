
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
import { Upload, ImageIcon, Loader2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title must be less than 100 characters"),
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(product?.image_url || null);
  const [variations, setVariations] = useState(product?.variations || []);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollection, setNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesigner, setNewCollectionDesigner] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!product;

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      toast.error("Could not load collections");
    }
  };

  const defaultValues: Partial<FormValues> = {
    title: product?.title || "",
    price: product ? product.price / 100 : undefined, // Convert cents to dollars for display
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

  // For simple file upload simulation
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create an object URL for immediate preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      
      // Start progress simulation
      const stopSimulation = simulateProgress();
      
      // Upload the image
      const imageUrl = await uploadProductImage(file);
      
      // Clean up simulation
      stopSimulation();
      setUploadProgress(100);
      
      if (imageUrl) {
        form.setValue('image_url', imageUrl);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
      // Reset preview on error
      setPreviewImage(product?.image_url || null);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after a delay
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Handle new collection creation if needed
      let collectionId = data.collection_id;
      if (newCollection && newCollectionName && newCollectionDesigner) {
        // Create a new collection via API call
        const response = await fetch('/api/collections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newCollectionName,
            designer_name: newCollectionDesigner
          })
        });
        
        if (response.ok) {
          const newCollectionData = await response.json();
          collectionId = newCollectionData.id;
          await fetchCollections(); // Refresh collections
        } else {
          toast.error('Failed to create new collection');
          return;
        }
      }
      
      // Convert price to cents for storage
      const productData: ProductFormValues = {
        title: data.title,
        price: Math.round(data.price * 100), // Convert dollars to cents for storage
        description: data.description,
        image_url: data.image_url,
        in_stock: data.in_stock,
        category: data.category,
        collection_id: collectionId || undefined,
        variations: variations,
      };

      let savedProduct: ShopProduct | null = null;
      
      if (isEditing && product) {
        // Update existing product with optimistic UI update
        const updatedProduct = {
          ...product,
          ...productData,
        };
        
        // Optimistic update
        onSuccess(updatedProduct);
        
        savedProduct = await updateProduct(product.id, productData);
        
        if (savedProduct) {
          toast.success("Product updated successfully");
        } else {
          // If update fails, revert the optimistic update
          onSuccess(product);
          toast.error("Failed to update product");
        }
      } else {
        // Create new product
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

  const removeImage = () => {
    form.setValue('image_url', '');
    setPreviewImage(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
            
            <div>
              <FormLabel>Collection</FormLabel>
              {!newCollection ? (
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="collection_id"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setNewCollection(true)}
                    size="sm"
                  >
                    + New
                  </Button>
                </div>
              ) : (
                <Card className="mt-2 mb-4">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium">Collection Name</label>
                      <Input
                        placeholder="Collection name"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Designer Name</label>
                      <Input
                        placeholder="Designer name"
                        value={newCollectionDesigner}
                        onChange={(e) => setNewCollectionDesigner(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setNewCollection(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
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
                      rows={4}
                    />
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
          </div>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <div className="border rounded-lg p-4 space-y-4">
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
                    
                    {/* Hidden input for storing the URL */}
                    <input type="hidden" {...field} />
                    
                    {previewImage ? (
                      <div className="relative aspect-square rounded-md border overflow-hidden">
                        <img 
                          src={previewImage}
                          alt="Product preview"
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        
                        {!isUploading && (
                          <Button 
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                            onClick={removeImage}
                          >
                            <X size={16} />
                          </Button>
                        )}
                        
                        {isUploading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <span className="text-sm">{uploadProgress}%</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-40 flex flex-col items-center justify-center border-dashed"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <span>Uploading... {uploadProgress}%</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mb-2" />
                            <span>Click to upload product image</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              JPG, PNG or GIF, max 5MB
                            </span>
                          </>
                        )}
                      </Button>
                    )}
                    
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            {/* Product Variations */}
            <div className="pt-4">
              <ProductVariationForm 
                variations={variations}
                onVariationsChange={setVariations}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
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
