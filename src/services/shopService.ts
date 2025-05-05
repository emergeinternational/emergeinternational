
import { supabase } from "@/integrations/supabase/client";
import { ShopProduct, ProductFormValues, ProductVariation } from "@/types/shop";
import { toast } from "sonner";
import { getAuthStatus, hasShopEditAccess } from "./shopAuthService";

// Get all products with collections
export const getProducts = async (): Promise<ShopProduct[]> => {
  try {
    console.log("Fetching all products...");
    const { data, error } = await supabase
      .from("shop_products")
      .select("*, variations:product_variations(*), collection:collections(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in getProducts:", error);
      throw error;
    }

    console.log(`Retrieved ${data?.length || 0} products`);
    return data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    toast.error("Failed to load products");
    return [];
  }
};

// Get products by collection
export const getProductsByCollection = async (collectionId: string): Promise<ShopProduct[]> => {
  try {
    console.log(`Fetching products for collection ID: ${collectionId}`);
    const { data, error } = await supabase
      .from("shop_products")
      .select("*, variations:product_variations(*), collection:collections(*)")
      .eq("collection_id", collectionId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in getProductsByCollection:", error);
      throw error;
    }

    console.log(`Retrieved ${data?.length || 0} products for collection`);
    return data || [];
  } catch (error) {
    console.error("Error fetching products by collection:", error);
    toast.error("Failed to load products");
    return [];
  }
};

// Get a specific product by ID
export const getProductById = async (id: string): Promise<ShopProduct | null> => {
  try {
    console.log(`Fetching product with ID: ${id}`);
    const { data, error } = await supabase
      .from("shop_products")
      .select("*, variations:product_variations(*), collection:collections(*)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error in getProductById:", error);
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
      console.error("Permission denied: User doesn't have edit access");
      toast.error("You don't have permission to upload images");
      return null;
    }
    
    console.log("Uploading product image...");
    
    // Check if file is valid
    if (!file || file.size === 0) {
      throw new Error("Invalid file or empty file");
    }
    
    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size exceeds 5MB limit");
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
      console.error("Storage upload error:", error);
      throw error;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(data.path);
      
    console.log("Image uploaded successfully:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    toast.error(error instanceof Error ? error.message : "Failed to upload image");
    return null;
  }
};

// Create a new product with variations and collection
export const createProduct = async (productData: ProductFormValues): Promise<ShopProduct | null> => {
  try {
    // Check if user has edit access
    if (!hasShopEditAccess()) {
      console.error("Permission denied: User doesn't have product creation access");
      toast.error("You don't have permission to create products");
      return null;
    }

    console.log("Creating new product:", productData.title);

    // Validate required fields
    if (!productData.title) {
      throw new Error("Product title is required");
    }

    if (!productData.price || productData.price <= 0) {
      throw new Error("Valid price is required");
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
      console.error("Error creating product:", error);
      throw error;
    }

    // If there are variations, add them
    if (variations.length > 0) {
      console.log(`Adding ${variations.length} variations to product`);
      
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

    // Get the product with variations and collection
    const product = await getProductById(data.id);
    
    // Create a product snapshot after successful creation
    try {
      await supabase.rpc('create_product_snapshot');
      console.log("Product snapshot created after new product addition");
    } catch (snapshotErr) {
      console.error("Failed to create product snapshot:", snapshotErr);
      // Non-critical error, don't throw
    }
    
    toast.success("Product created successfully");
    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    toast.error(error instanceof Error ? error.message : "Failed to create product");
    return null;
  }
};

// Update an existing product
export const updateProduct = async (id: string, updates: Partial<ProductFormValues>): Promise<ShopProduct | null> => {
  try {
    // Check if user has edit access
    if (!hasShopEditAccess()) {
      console.error("Permission denied: User doesn't have product update access");
      toast.error("You don't have permission to update products");
      return null;
    }
    
    console.log(`Updating product ID: ${id}`);
    
    // Validate product ID
    if (!id) {
      throw new Error("Product ID is required for updates");
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
      console.error("Error updating product:", error);
      throw error;
    }

    // Handle variations: We'll delete existing variations and insert new ones
    if (variations.length > 0) {
      console.log(`Updating ${variations.length} variations for product ID: ${id}`);
      
      // Delete existing variations
      const { error: deleteError } = await supabase
        .from("product_variations")
        .delete()
        .eq("product_id", id);
        
      if (deleteError) {
        console.error("Error deleting existing variations:", deleteError);
        throw deleteError;
      }
      
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

    // Get the updated product with variations and collection
    const updatedProduct = await getProductById(id);
    
    // Create a product snapshot after successful update
    try {
      await supabase.rpc('create_product_snapshot');
      console.log("Product snapshot created after product update");
    } catch (snapshotErr) {
      console.error("Failed to create product snapshot:", snapshotErr);
      // Non-critical error, don't throw
    }
    
    toast.success("Product updated successfully");
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error(error instanceof Error ? error.message : "Failed to update product");
    return null;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    // Check if user has edit access
    if (!hasShopEditAccess()) {
      console.error("Permission denied: User doesn't have product deletion access");
      toast.error("You don't have permission to delete products");
      return false;
    }
    
    console.log(`Deleting product ID: ${id}`);
    
    // Create a snapshot before deletion
    try {
      await supabase.rpc('create_product_snapshot');
      console.log("Product snapshot created before deletion");
    } catch (snapshotErr) {
      console.error("Failed to create product snapshot before deletion:", snapshotErr);
      // Continue with deletion despite snapshot failure
    }
    
    // Delete the product
    const { error } = await supabase
      .from("shop_products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }

    toast.success("Product deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    toast.error(error instanceof Error ? error.message : "Failed to delete product");
    return false;
  }
};
