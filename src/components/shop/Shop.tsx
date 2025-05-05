
import React, { useState, useEffect } from 'react';
import { ShopProduct } from '@/types/shop';
import { getProducts } from '@/services/shopService';
import ProductGrid from './ProductGrid';

interface ShopProps {
  userRole?: string | null;
}

const Shop: React.FC<ShopProps> = ({ userRole }) => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shop</h1>
        <p className="text-gray-600">Browse our collection of products</p>
      </div>
      
      <ProductGrid products={products} loading={isLoading} />
    </div>
  );
};

export default Shop;
