
export type ProductCategory = "accessories" | "footwear" | "new_arrivals" | "clothing";

export interface ProductVariationOption {
  value: string;
  price_adjustment: number;
}

export interface ProductVariation {
  id?: string;
  name: string;
  options: string[];
  price_adjustments: number[];
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: ProductCategory;
  image_url?: string;
  is_published: boolean;
  in_stock: boolean;
  created_at?: string;
  updated_at?: string;
  variations?: ProductVariation[];
  sales_count?: number;
  revenue?: number;
}
