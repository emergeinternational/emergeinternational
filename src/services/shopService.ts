
import { supabase } from "@/integrations/supabase/client";
import { ShopProduct, ProductFormValues } from "@/types/shop";
import { toast } from "sonner";
import { getAuthStatus, hasShopEditAccess } from "./shopAuthService";

// Get all products
export const getProducts = async (): Promise<ShopProduct[]> => {
  try {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
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
      .select("*")
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

// Create a new product
export const createProduct = async (productData: ProductFormValues): Promise<ShopProduct | null> => {
  try {
    // Check if user has edit access
    if (!hasShopEditAccess()) {
      toast.error("You don't have permission to create products");
      return null;
    }

    const { data, error } = await supabase
      .from("shop_products")
      .insert(productData)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    toast.success("Product created successfully");
    return data;
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
    
    const { data, error } = await supabase
      .from("shop_products")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    toast.success("Product updated successfully");
    return data;
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
