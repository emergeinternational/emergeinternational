
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductForm from "./ProductForm";
import { ShopProduct } from "@/types/shop";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ShopProduct | null;
  onSuccess: (product: ShopProduct | null) => void;
  submitType?: 'draft' | 'pending';
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSuccess,
  submitType = 'pending'
}) => {
  const handleSuccess = (updatedProduct: ShopProduct | null) => {
    onSuccess(updatedProduct);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product 
              ? "Edit Product" 
              : submitType === 'draft' 
                ? "Create Draft Product" 
                : "Submit New Product"}
          </DialogTitle>
        </DialogHeader>
        <ProductForm 
          product={product} 
          onSuccess={handleSuccess}
          submitType={submitType}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
