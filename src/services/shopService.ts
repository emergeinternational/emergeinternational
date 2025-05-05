
import { supabase } from "@/integrations/supabase/client";
import { ShopProduct, ProductFormValues, ProductVariation } from "@/types/shop";
import { toast } from "sonner";
import { getAuthStatus, hasShopEditAccess } from "./shopAuthService";

// Get all products
export const getProducts = async (): Promise<ShopProduct[]> => {
  try {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*, variations:product_variations(*)")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    toast.error("Failed to load products");
    return [];
  }
};

// Get a specific product by ID
export const getProductById = async (id: string): Promise<ShopProduct | null> => {
  try {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*, variations:product_variations(*)")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    toast.error("Failed to load product details");
    return null;
  }
};

// Upload product image to Supabase Storage
export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    if (!hasShopEditAccess()) {
      toast.error("You don't have permission to upload images");
      return null;
    }
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(data.path);
      
    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    toast.error("Failed to upload image");
    return null;
  }
};

// Create a new product with variations
export const createProduct = async (productData: ProductFormValues): Promise<ShopProduct | null> => {
  try {
    // Check if user has edit access
    if (!hasShopEditAccess()) {
      toast.error("You don't have permission to create products");
      return null;
    }

    // Extract variations to insert separately
    const variations = productData.variations || [];
    const { variations: _, ...productWithoutVariations } = productData;
    
    // Create the product first
    const { data, error } = await supabase
      .from("shop_products")
      .insert(productWithoutVariations)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    // If there are variations, add them
    if (variations.length > 0) {
      const variationsWithProductId = variations.map(variation => ({
        ...variation,
        product_id: data.id
      }));
      
      const { error: variationsError } = await supabase
        .from("product_variations")
        .insert(variationsWithProductId);
      
      if (variationsError) {
        console.error("Error adding variations:", variationsError);
        toast.error("Product created but failed to add variations");
      }
    }

    // Get the product with variations
    const product = await getProductById(data.id);
    
    toast.success("Product created successfully");
    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    toast.error("Failed to create product");
    return null;
  }
};

// Update an existing product
export const updateProduct = async (id: string, updates: Partial<ProductFormValues>): Promise<ShopProduct | null> => {
  try {
    // Check if user has edit access
    if (!hasShopEditAccess()) {
      toast.error("You don't have permission to update products");
      return null;
    }
    
    // Extract variations to update separately
    const variations = updates.variations || [];
    const { variations: _, ...productUpdatesWithoutVariations } = updates;
    
    // Update the product
    const { data, error } = await supabase
      .from("shop_products")
      .update(productUpdatesWithoutVariations)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    // Handle variations: We'll delete existing variations and insert new ones
    if (variations.length > 0) {
      // Delete existing variations
      await supabase
        .from("product_variations")
        .delete()
        .eq("product_id", id);
      
      // Insert new variations
      const variationsWithProductId = variations.map(variation => ({
        ...variation,
        product_id: id
      }));
      
      const { error: variationsError } = await supabase
        .from("product_variations")
        .insert(variationsWithProductId);
      
      if (variationsError) {
        console.error("Error updating variations:", variationsError);
        toast.error("Product updated but failed to update variations");
      }
    }

    // Get the updated product with variations
    const updatedProduct = await getProductById(id);
    
    toast.success("Product updated successfully");
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Failed to update product");
    return null;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    // Check if user has edit access
    if (!hasShopEditAccess()) {
      toast.error("You don't have permission to delete products");
      return false;
    }
    
    const { error } = await supabase
      .from("shop_products")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    toast.success("Product deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    toast.error("Failed to delete product");
    return false;
  }
};
