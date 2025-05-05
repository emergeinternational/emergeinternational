
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
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}) => {
  const handleSuccess = (updatedProduct: ShopProduct | null) => {
    onSuccess(updatedProduct);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <ProductForm 
          product={product} 
          onSuccess={handleSuccess} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
