
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import ProductsTable from "./ProductsTable";
import ProductFormDialog from "./ProductFormDialog";

interface ProductsManagerProps {
  isLocked?: boolean;
}

const ProductsManager = ({ isLocked = false }: ProductsManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Fetch all products
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Handle product edit
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  // Filter products based on search query
  const filteredProducts = products?.filter((product) =>
    product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form close and refresh data
  const handleFormClose = (refresh: boolean) => {
    setIsFormOpen(false);
    setEditingProduct(null);
    if (refresh) {
      refetch();
    }
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading products: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Add Button Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }} 
          className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
          disabled={isLocked}
        >
          <PlusCircle className="mr-2" size={18} />
          Add New Product
        </Button>
      </div>

      {/* Products Table */}
      <ProductsTable 
        products={filteredProducts || []} 
        isLoading={isLoading} 
        onEdit={handleEditProduct}
        onRefresh={refetch}
        isLocked={isLocked}
      />

      {/* Product Form Dialog */}
      <ProductFormDialog 
        open={isFormOpen}
        product={editingProduct}
        onClose={handleFormClose}
      />
    </div>
  );
};

export default ProductsManager;
