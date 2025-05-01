
import { Dispatch, SetStateAction } from 'react';
import { Json } from '@/types/supabase';

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
