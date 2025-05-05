
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
  variations?: ProductVariation[];
  collection_id?: string;
  collection?: Collection;
}

export interface ProductVariation {
  id?: string;
  product_id?: string;
  size?: string;
  color?: string;
  stock_quantity: number;
  sku: string;
  price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Collection {
  id: string;
  title: string;
  description?: string;
  designer_name: string;
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
  collection_id?: string;
  variations?: ProductVariation[];
}
