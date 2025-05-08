
import { Dispatch, SetStateAction } from 'react';

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  product: any;
  onSuccess: () => void;
}
