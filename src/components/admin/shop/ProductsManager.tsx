
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProductsTable from "./ProductsTable";
import ProductFormDialog from "./ProductFormDialog";
import { RefetchOptions } from '@tanstack/react-query';

interface ProductsManagerProps {
  isLocked?: boolean;
}

const ProductsManager: React.FC<ProductsManagerProps> = ({ isLocked = false }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProducts(data || []);
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

  const handleEdit = (product: any) => {
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
        // @ts-expect-error - Component is read-only
        <ProductFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          product={selectedProduct}
          onSuccess={() => {
            fetchProducts();
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductsManager;
