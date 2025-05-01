
import { Dispatch, SetStateAction } from 'react';
import { Product } from '@/services/productTypes';

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  product: Product | null;
  onSuccess: () => void;
}
