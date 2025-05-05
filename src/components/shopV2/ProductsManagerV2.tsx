
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShopProductV2, Collection } from '@/types/shopV2';
import { Plus } from 'lucide-react';
import ProductFormV2 from './ProductFormV2';
import { createProduct, updateProduct } from '@/services/shopV2Service';
import { useToast } from '@/hooks/use-toast';

interface ProductsManagerV2Props {
  onProductAdded: (product: ShopProductV2) => void;
  onProductUpdated: (product: ShopProductV2) => void;
  collections: Collection[];
  isLocked?: boolean;
}

const ProductsManagerV2: React.FC<ProductsManagerV2Props> = ({ 
  onProductAdded,
  onProductUpdated,
  collections,
  isLocked = false
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ShopProductV2 | undefined>(undefined);
  const { toast } = useToast();
  
  if (isLocked) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md border border-yellow-200">
          <h3 className="font-medium">Product Management</h3>
          <p className="text-sm">
            You need admin permissions to manage products.
          </p>
        </div>
      </div>
    );
  }

  const openNewProductDialog = () => {
    setCurrentProduct(undefined);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: ShopProductV2) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (productData: Partial<ShopProductV2>) => {
    try {
      if (isEditing && currentProduct) {
        // Update existing product
        const updatedProduct = await updateProduct(currentProduct.id, productData);
        if (updatedProduct) {
          onProductUpdated(updatedProduct);
          toast({
            title: "Success",
            description: "Product updated successfully"
          });
          setIsDialogOpen(false);
        }
      } else {
        // Create new product
        const newProduct = await createProduct(productData);
        if (newProduct) {
          onProductAdded(newProduct);
          toast({
            title: "Success",
            description: "Product created successfully"
          });
          setIsDialogOpen(false);
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Products</h2>
        <Button onClick={openNewProductDialog} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductFormV2
            product={currentProduct}
            collections={collections}
            onSubmit={handleSubmit}
            submitType={isEditing ? 'pending' : 'draft'}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductsManagerV2;
