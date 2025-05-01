
import { Product } from "@/services/productTypes";

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess?: () => void;
  isLocked?: boolean;
}
