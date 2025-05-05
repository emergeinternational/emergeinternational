
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

export interface ShopProductV2 {
  id: string;
  title: string;
  price: number;
  description?: string;
  image_url?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  variations?: ProductVariation[];
  in_stock: boolean;
  created_by?: string;
  collection_id?: string;
  rejection_reason?: string;
}

export interface Collection {
  id: string;
  title: string;
  designer_name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
