
export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProduct?: any;
  product?: any;
  onSuccess?: () => void;
  isLocked?: boolean;
}
