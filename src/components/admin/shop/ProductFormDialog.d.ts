
import { Dispatch, SetStateAction } from 'react';
import { ProductCategory } from '@/services/productTypes';

export interface ProductVariation {
  size?: string;
  color?: string;
  quantity: number;
  sku?: string;
}

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  product?: any;
  onSuccess?: () => void;
  onProductChange?: (product: any) => void;
}
