
export interface ShopProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  in_stock: boolean;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormValues {
  title: string;
  price: number;
  description?: string;
  image_url?: string;
  in_stock: boolean;
  category: string;
}
