
import { Dispatch, SetStateAction } from 'react';
import { ProductCategory } from '@/services/productTypes';

export interface ProductVariation {
  id?: string;
  name: string;
  options: string[];
  price_adjustments: number[];
}

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  product?: any;
  onSuccess?: () => void;
  onProductChange?: (product: any) => void;
}
