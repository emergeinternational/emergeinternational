
export interface ShopProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  status?: string;
  in_stock?: boolean;
  collection_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  variations?: ProductVariation[];
  collection?: Collection;
}

export interface ProductVariation {
  id: string;
  product_id: string;
  sku: string;
  size?: string;
  color?: string;
  price?: number;
  stock_quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface Collection {
  id: string;
  title: string;
  designer_name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormValues {
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  in_stock?: boolean;
  collection_id?: string;
  variations?: ProductVariation[];
}

// Basic system types for future use
export interface ShopSystemSettings {
  recoveryMode?: boolean;
  fallbackLevel?: string;
  liveSync?: boolean;
  mockupData?: {
    last_seeded?: string;
    seed_count?: number;
  };
  diagnosticsEnabled?: boolean;
}

export interface ProductSnapshot {
  id: string;
  createdAt: string;
  version: number;
  productCount: number;
  createdBy: string;
  filePath: string;
}

export interface RecoveryLogEntry {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'failure' | 'pending';
  details?: any;
}
