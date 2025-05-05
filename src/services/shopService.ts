
// @module = 'Shop'
// TODO: Add product fetch, add, edit, delete logic here when stable

import { supabase } from "@/integrations/supabase/client";

// Basic type for products
export interface ShopProduct {
  id: string;
  title: string;
  price: number;
  description?: string;
  image_url?: string;
  category?: string;
  created_at?: string;
}

// Simple fetch function to get products
export const getProducts = async (): Promise<ShopProduct[]> => {
  try {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getProducts:", error);
    return [];
  }
};
