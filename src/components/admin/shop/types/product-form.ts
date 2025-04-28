
import { Product } from "@/services/productTypes";

export interface ProductFormProps {
  open: boolean;
  product?: Product | null;
  onClose: (refresh: boolean) => void;
  onMockSave?: (product: Product) => void;
}

export interface ProductTabProps {
  product: Product | null;
  onChange: (field: string, value: any) => void;
  formValues: any;
  isMockProduct: boolean;
}

