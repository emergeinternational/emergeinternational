
import React from 'react';
import { ShopProductV2 } from '@/types/shopV2';
import ProductCardV2 from './ProductCardV2';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridV2Props {
  products: ShopProductV2[];
  loading?: boolean;
  isAdmin?: boolean;
  onEdit?: (product: ShopProductV2) => void;
  onDelete?: (id: string) => void;
}

const ProductGridV2: React.FC<ProductGridV2Props> = ({ 
  products, 
  loading = false,
  isAdmin = false,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col h-full">
            <Skeleton className="h-48 w-full" />
            <div className="mt-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-gray-50">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCardV2 
          key={product.id} 
          product={product}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ProductGridV2;
