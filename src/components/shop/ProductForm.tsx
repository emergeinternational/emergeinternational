
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ShopProduct, Collection } from '@/types/shop';
import { useForm } from 'react-hook-form';
import { uploadProductImage } from '@/services/shopService';
import ProductVariationForm from './ProductVariationForm';
import { toast } from 'sonner';

interface ProductFormProps {
  productToEdit: ShopProduct | null;
  collections: Collection[];
  onSubmit: (formData: any) => void;
  isSubmitting: boolean;
}

type FormValues = {
  title: string;
  price: number;
  description: string;
  image_url: string;
  in_stock: boolean;
  category: string;
  collection_id: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
};

const ProductForm: React.FC<ProductFormProps> = ({ 
  productToEdit, 
  collections, 
  onSubmit, 
  isSubmitting 
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [variations, setVariations] = useState<any[]>([]);
  
  // Set default values for the form
  const defaultValues: FormValues = {
    title: productToEdit?.title || '',
    price: productToEdit?.price || 0,
    description: productToEdit?.description || '',
    image_url: productToEdit?.image_url || '',
    in_stock: productToEdit?.in_stock ?? true,
    category: productToEdit?.category || 'clothing',
    collection_id: productToEdit?.collection_id || '',
    status: productToEdit?.status || 'draft',
  };
  
  const { 
    register, 
    handleSubmit, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<FormValues>({ defaultValues });
  
  // Watch all form fields
  const formValues = watch();
  
  // Initialize variations from product if editing
  useEffect(() => {
    if (productToEdit?.variations) {
      setVariations(productToEdit.variations);
    }
  }, [productToEdit]);
  
  // Set image preview if product has an image
  useEffect(() => {
    if (defaultValues.image_url) {
      setImagePreview(defaultValues.image_url);
    }
  }, [defaultValues.image_url]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  const handleImageUpload = async () => {
    if (image) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadProductImage(image);
        
        if (imageUrl) {
          setValue('image_url', imageUrl);
          toast.success('Image uploaded successfully');
        } else {
          toast.error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  const processFormSubmit = async (data: FormValues) => {
    try {
      // Validate required fields before submitting
      if (!data.title.trim()) {
        toast.error("Product title is required");
        return;
      }
      
      if (!data.image_url && !image) {
        toast.error("Product image is required");
        return;
      }
      
      if (!data.price || data.price <= 0) {
        toast.error("Valid price is required");
        return;
      }
      
      // Upload image if selected but not yet uploaded
      if (image && !formValues.image_url.includes('product-images')) {
        await handleImageUpload();
      }
      
      // Combine form data with variations
      const formData = {
        ...data,
        variations,
      };
      
      // Submit the form
      onSubmit(formData);
    } catch (error) {
      console.error("Error processing form submit:", error);
      toast.error("Error submitting the form. Please try again.");
    }
  };
  
  return (
    <form onSubmit={handleSubmit(processFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h2 className="text-lg font-medium mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              {...register('title', { required: true })}
              placeholder="Enter product name"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">Product title is required</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...register('price', { 
                required: true,
                min: 0.01,
                valueAsNumber: true
              })}
              placeholder="0.00"
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && (
              <p className="text-sm text-red-500">Valid price is required</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Enter product description"
            rows={4}
          />
        </div>
      </div>
      
      {/* Category and Collection */}
      <div>
        <h2 className="text-lg font-medium mb-4">Category & Collection</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category <span className="text-red-500">*</span></Label>
            <Select 
              value={formValues.category}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="footwear">Footwear</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="new_arrivals">New Arrivals</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Collection</Label>
            <Select 
              value={formValues.collection_id}
              onValueChange={(value) => setValue('collection_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Collection</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Image Upload */}
      <div>
        <h2 className="text-lg font-medium mb-4">Product Image <span className="text-red-500">*</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="image">Upload Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            
            {image && !formValues.image_url.includes('product-images') && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleImageUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            )}
            
            {(errors.image_url || !formValues.image_url) && !image && (
              <p className="text-sm text-red-500">Product image is required</p>
            )}
          </div>
          
          <div>
            {imagePreview && (
              <div className="border rounded-md p-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-32 object-contain mx-auto"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status and Stock */}
      <div>
        <h2 className="text-lg font-medium mb-4">Status & Stock</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={formValues.status}
              onValueChange={(value) => setValue('status', value as 'draft' | 'pending' | 'published' | 'rejected')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 flex items-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="in_stock"
                checked={formValues.in_stock}
                onCheckedChange={(checked) => setValue('in_stock', checked)}
              />
              <Label htmlFor="in_stock">In Stock</Label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Variations */}
      <div>
        <h2 className="text-lg font-medium mb-4">Product Variations</h2>
        <ProductVariationForm 
          variations={variations} 
          setVariations={setVariations} 
        />
      </div>
      
      {/* Submit Button */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? 'Saving...' : productToEdit ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
