
import { supabase } from "@/integrations/supabase/client";
import { ShopProductV2, ProductVariation, Collection } from "@/types/shopV2";
import { v4 as uuidv4 } from 'uuid';

// Get all products with optional filters
export const getProducts = async (options?: {
  status?: 'draft' | 'pending' | 'published' | 'rejected';
  collection_id?: string;
  category?: string;
  in_stock?: boolean;
}): Promise<ShopProductV2[]> => {
  try {
    let query = supabase
      .from("shop_products")
      .select("*, variations:product_variations(*)");
    
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    if (options?.collection_id) {
      query = query.eq('collection_id', options.collection_id);
    }
    
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    
    if (options?.in_stock !== undefined) {
      query = query.eq('in_stock', options.in_stock);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }
    
    return data as ShopProductV2[];
  } catch (error) {
    console.error("Error in getProducts:", error);
    return [];
  }
};

// Get a single product by ID
export const getProductById = async (id: string): Promise<ShopProductV2 | null> => {
  try {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*, variations:product_variations(*)")
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }
    
    return data as ShopProductV2;
  } catch (error) {
    console.error("Error in getProductById:", error);
    return null;
  }
};

// Create a new product
export const createProduct = async (product: Partial<ShopProductV2>): Promise<ShopProductV2 | null> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("User not authenticated");
      return null;
    }
    
    // Create product
    const { data, error } = await supabase
      .from("shop_products")
      .insert({
        ...product,
        created_by: user.id,
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating product:", error);
      return null;
    }
    
    return data as ShopProductV2;
  } catch (error) {
    console.error("Error in createProduct:", error);
    return null;
  }
};

// Update an existing product
export const updateProduct = async (id: string, updates: Partial<ShopProductV2>): Promise<ShopProductV2 | null> => {
  try {
    const { data, error } = await supabase
      .from("shop_products")
      .update(updates)
      .eq('id', id)
      .select("*, variations:product_variations(*)")
      .single();
      
    if (error) {
      console.error("Error updating product:", error);
      return null;
    }
    
    return data as ShopProductV2;
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return null;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("shop_products")
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting product:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return false;
  }
};

// Upload product image
export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;
    
    // Try to ensure the bucket exists (may fail if user doesn't have admin rights, but that's ok)
    try {
      await supabase
        .storage
        .createBucket('product-images', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 5 // 5MB
        });
    } catch (err) {
      console.log("Bucket might already exist or user doesn't have admin rights");
    }
    
    const { error } = await supabase
      .storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }
    
    const { data } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error("Error in uploadProductImage:", error);
    return null;
  }
};

// Get all collections
export const getCollections = async (): Promise<Collection[]> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching collections:", error);
      return [];
    }
    
    return data as Collection[];
  } catch (error) {
    console.error("Error in getCollections:", error);
    return [];
  }
};

// Create a new collection
export const createCollection = async (collection: Partial<Collection>): Promise<Collection | null> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .insert(collection)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating collection:", error);
      return null;
    }
    
    return data as Collection;
  } catch (error) {
    console.error("Error in createCollection:", error);
    return null;
  }
};

// Product variations methods
export const addProductVariation = async (variation: Omit<ProductVariation, 'id' | 'created_at' | 'updated_at'>): Promise<ProductVariation | null> => {
  try {
    const { data, error } = await supabase
      .from("product_variations")
      .insert(variation)
      .select()
      .single();
      
    if (error) {
      console.error("Error adding variation:", error);
      return null;
    }
    
    return data as ProductVariation;
  } catch (error) {
    console.error("Error in addProductVariation:", error);
    return null;
  }
};

export const updateProductVariation = async (id: string, updates: Partial<ProductVariation>): Promise<ProductVariation | null> => {
  try {
    const { data, error } = await supabase
      .from("product_variations")
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating variation:", error);
      return null;
    }
    
    return data as ProductVariation;
  } catch (error) {
    console.error("Error in updateProductVariation:", error);
    return null;
  }
};

export const deleteProductVariation = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("product_variations")
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting variation:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteProductVariation:", error);
    return false;
  }
};

// Subscribe to real-time updates for products
export const subscribeToProducts = (callback: (payload: any) => void) => {
  return supabase
    .channel('public:shop_products')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'shop_products' }, 
      payload => callback(payload))
    .subscribe();
};
