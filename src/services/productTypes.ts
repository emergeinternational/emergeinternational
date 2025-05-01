
export type ProductCategory = 'clothing' | 'footwear' | 'accessories' | 'new_arrivals';

export interface ProductVariation {
  id: string;
  product_id: string;
  size?: string;
  color?: string;
  stock_quantity: number;
  sku: string;
  price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  price: number;
  category: ProductCategory;
  is_published: boolean;
  in_stock: boolean;
  stock_quantity?: number;
  designer_id?: string;
  variations: ProductVariation[];
  sku?: string;
  weight?: number;
  dimensions?: any;
  shipping_info?: any;
  created_at?: string;
  updated_at?: string;
  sales_count?: number;
  revenue?: number;
}
