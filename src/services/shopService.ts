
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShopProduct {
  id: string;
  title: string;
  price: number;
  description?: string;
  image_url?: string;
  in_stock: boolean;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches all products from the shop_products table
 */
export const getProducts = async (): Promise<ShopProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    toast.error("Failed to load products");
    return [];
  }
};

/**
 * Fetches a single product by ID
 */
export const getProductById = async (id: string): Promise<ShopProduct | null> => {
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    toast.error("Failed to load product details");
    return null;
  }
};

/**
 * Creates a new product
 */
export const createProduct = async (product: Omit<ShopProduct, 'id' | 'created_at' | 'updated_at'>): Promise<ShopProduct | null> => {
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .insert(product)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    
    toast.success("Product created successfully");
    return data;
  } catch (error) {
    console.error("Error creating product:", error);
    toast.error("Failed to create product");
    return null;
  }
};

/**
 * Updates an existing product
 */
export const updateProduct = async (id: string, updates: Partial<ShopProduct>): Promise<ShopProduct | null> => {
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    
    toast.success("Product updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Failed to update product");
    return null;
  }
};

/**
 * Deletes a product by ID
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('shop_products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success("Product deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    toast.error("Failed to delete product");
    return false;
  }
};

/**
 * Fetches products by category
 */
export const getProductsByCategory = async (category: string): Promise<ShopProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching products by category:", error);
    toast.error("Failed to load products for this category");
    return [];
  }
};

// TODO: Add functions for inventory management and stock tracking
// TODO: Add functions for featured products
// TODO: Add functions for product filtering and sorting
