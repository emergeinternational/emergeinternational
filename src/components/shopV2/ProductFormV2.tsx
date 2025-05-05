import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShopProductV2, Collection } from '@/types/shopV2';
import { uploadProductImage } from '@/services/shopV2Service';
import { useToast } from '@/hooks/use-toast';
import { ImagePlus, X } from 'lucide-react';
import ProductVariationFormV2 from './ProductVariationFormV2';

interface ProductFormV2Props {
  product?: ShopProductV2;
  collections?: Collection[];
  onSubmit: (product: Partial<ShopProductV2>) => Promise<void>;
  submitType: 'draft' | 'pending';
}

const ProductFormV2: React.FC<ProductFormV2Props> = ({
  product,
  collections = [],
  onSubmit,
  submitType = 'draft'
}) => {
  const isEditing = !!product;
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [variations, setVariations] = useState<any[]>(product?.variations || []);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm({
    defaultValues: {
      title: product?.title || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || '',
      collection_id: product?.collection_id || '',
      image_url: product?.image_url || '',
      in_stock: product?.in_stock !== undefined ? product.in_stock : true,
    }
  });
  
  const imageUrl = watch('image_url');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const url = await uploadProductImage(file);
      if (url) {
        setValue('image_url', url);
        toast({
          title: "Image uploaded",
          description: "Your product image has been uploaded successfully"
        });
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading your image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setValue('image_url', '');
  };

  const onFormSubmit = async (data: any) => {
    try {
      // Prepare product data
      const productData: Partial<ShopProductV2> = {
        ...data,
        status: submitType, // 'draft' or 'pending'
        price: parseFloat(data.price),
      };
      
      // If we're editing, we need to keep the ID
      if (isEditing && product) {
        productData.id = product.id;
      }
      
      await onSubmit(productData);
      
      // Reset form if it's a new product
      if (!isEditing) {
        reset();
        setVariations([]);
      }
      
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{isEditing ? 'Edit Product' : 'New Product'}</h3>
          
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              {...register('title', { required: "Product title is required" })}
              placeholder="Enter product title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message as string}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your product"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { 
                    required: "Price is required",
                    min: { value: 0, message: "Price must be positive" }
                  })}
                  placeholder="0.00"
                  className={`pl-7 ${errors.price ? "border-red-500" : ""}`}
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price.message as string}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="e.g., Clothing, Accessories"
              />
            </div>
          </div>
          
          {collections.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="collection_id">Collection</Label>
              <Select 
                onValueChange={(value) => setValue('collection_id', value)}
                defaultValue={product?.collection_id || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            {imageUrl ? (
              <div className="relative w-full h-64 border rounded-md overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt="Product" 
                  className="w-full h-full object-contain" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <Button 
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border border-dashed rounded-md p-6 text-center">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Label htmlFor="image" className="flex flex-col items-center cursor-pointer">
                  <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium">
                    {isUploading ? "Uploading..." : "Click to upload image"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </span>
                </Label>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="in_stock"
              {...register('in_stock')}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="in_stock" className="cursor-pointer">In Stock</Label>
          </div>
        </div>
      </Card>
      
      <ProductVariationFormV2
        variations={variations}
        setVariations={setVariations}
        productId={product?.id}
      />
      
      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting 
            ? 'Saving...' 
            : isEditing 
              ? 'Update Product' 
              : submitType === 'pending' 
                ? 'Submit for Review' 
                : 'Save as Draft'
          }
        </Button>
      </div>
    </form>
  );
};

export default ProductFormV2;
