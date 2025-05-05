
import { ShopProduct } from "./shop";

export type ProductStatus = 'draft' | 'pending' | 'published' | 'rejected';

export interface ProductNotification {
  id: string;
  user_id: string;
  product_id: string;
  message: string;
  status: ProductStatus;
  is_read: boolean;
  created_at: string;
  product?: ShopProduct;
}

export interface ProductSubmission extends ShopProduct {
  status: ProductStatus;
  created_by: string;
  rejection_reason?: string;
}

export interface StatusBadgeProps {
  status: ProductStatus;
}
