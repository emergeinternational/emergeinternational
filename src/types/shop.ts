
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

// Diagnostic types for shop module
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

// Shop system settings JSON
export interface ShopSystemSettings {
  recoveryMode?: boolean;
  fallbackLevel?: 'minimal' | 'full';
  diagnosticsEnabled?: boolean;
  liveSync?: boolean;
  mockupData?: {
    last_seeded?: string;
    seed_count?: number;
  };
}

// Recovery log entry interface
export interface RecoveryLogEntry {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'failure' | 'pending';
  details?: any;
}
