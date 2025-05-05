
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
  status?: 'draft' | 'pending' | 'published' | 'rejected';
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
  status?: 'draft' | 'pending' | 'published' | 'rejected';
}

// Add these diagnostic types to fix build errors
export type DiagnosticStatus = 'pending' | 'error' | 'running' | 'success' | 'warning';

export interface DiagnosticTest {
  name: string;
  message: string;
  status: DiagnosticStatus;
  details: any;
  runTest: () => Promise<void>;
}

export interface DiagnosticTestResult {
  status: DiagnosticStatus;
  details: any;
}

export interface RLSPolicy {
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string;
  with_check: string;
}

// Add this interface to help with typed access to shop system settings JSON
export interface ShopSystemSettings {
  recoveryMode?: boolean;
  liveSync?: boolean;
  mockupData?: {
    last_seeded?: string;
    seed_count?: number;
  };
}
