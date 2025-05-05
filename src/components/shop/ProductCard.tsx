
import React from 'react';
import { ShopProduct } from '@/services/shopService';

interface ProductCardProps {
  product?: ShopProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  if (!product) {
    return (
      <div className="border p-4 rounded-md bg-gray-50">
        <div className="h-32 bg-gray-200 rounded-md mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-md hover:shadow-md transition-shadow">
      {product.image_url ? (
        <img 
          src={product.image_url} 
          alt={product.title}
          className="h-32 object-cover w-full rounded-md mb-2"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      ) : (
        <div className="h-32 bg-gray-100 flex items-center justify-center rounded-md mb-2">
          No image
        </div>
      )}
      <h3 className="font-medium">{product.title}</h3>
      <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
    </div>
  );
};

export default ProductCard;
