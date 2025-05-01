
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProductsTable from "./ProductsTable";
import ProductFormDialog from "./ProductFormDialog";
import { Product, ProductVariation } from "@/services/productTypes";
import { RefetchOptions } from '@tanstack/react-query';

interface ProductsManagerProps {
  isLocked?: boolean;
}

const ProductsManager: React.FC<ProductsManagerProps> = ({ isLocked = false }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    
    // Subscribe to changes
    const channel = supabase
      .channel('product_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change detected:', payload);
          fetchProducts();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Fetch products first
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (productsError) throw productsError;
      
      // Fetch variations for all products
      const { data: variationsData, error: variationsError } = await supabase
        .from('product_variations')
        .select('*');
        
      if (variationsError) throw variationsError;
      
      // Map variations to their products
      const productsWithVariations = productsData.map((product: Product) => {
        const productVariations = variationsData.filter(
          (variation: ProductVariation) => variation.product_id === product.id
        );
        
        return {
          ...product,
          variations: productVariations.length > 0 
            ? productVariations 
            : (Array.isArray(product.variations) ? product.variations : [])
        };
      });
      
      setProducts(productsWithVariations);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error loading products",
        description: error instanceof Error ? error.message : "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleRefresh = (options?: RefetchOptions) => {
    fetchProducts();
  };

  return (
    <div>
      <ProductsTable 
        products={products} 
        isLoading={isLoading} 
        onEdit={handleEdit} 
        onRefresh={handleRefresh}
        isLocked={isLocked} 
      />
      
      {selectedProduct && (
        <ProductFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          product={selectedProduct}
          onSuccess={() => {
            fetchProducts();
            setSelectedProduct(null);
            setIsEditDialogOpen(false);
          }}
          isLocked={isLocked}
        />
      )}
    </div>
  );
};

export default ProductsManager;
