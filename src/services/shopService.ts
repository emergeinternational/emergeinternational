
import { supabase } from "@/integrations/supabase/client";
import { ShopProduct, ProductFormValues } from "@/types/shop";
import { toast } from "sonner";

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
export const createProduct = async (productData: ProductFormValues): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("shop_products")
      .insert(productData);

    if (error) {
      throw error;
    }

    toast.success("Product created successfully");
    return true;
  } catch (error) {
    console.error("Error creating product:", error);
    toast.error("Failed to create product");
    return false;
  }
};

// Update an existing product
export const updateProduct = async (id: string, updates: Partial<ShopProduct>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("shop_products")
      .update(updates)
      .eq("id", id);

    if (error) {
      throw error;
    }

    toast.success("Product updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Failed to update product");
    return false;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
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
