
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Search, Filter } from "lucide-react";
import ProductsTable from "./ProductsTable";
import ProductFormDialog from "./ProductFormDialog";
import { Product, ProductCategory } from "@/services/productTypes";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ProductsManager = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [priceFilter, setPriceFilter] = useState<{min?: number, max?: number}>({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all products
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[] || [];
    },
  });

  // Handle product edit
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      
      if (error) throw error;
      
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
      
      refetch();
    } catch (err: any) {
      toast({
        title: "Error deleting product",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Filter products based on search query and selected category
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = 
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || 
      product.category === selectedCategory;
    
    const matchesPrice = 
      (!priceFilter.min || product.price >= priceFilter.min) &&
      (!priceFilter.max || product.price <= priceFilter.max);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

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
      {/* Search, Filter and Add Button */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-2/3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search products by name or description..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="md:w-auto"
          >
            <Filter className="mr-2" size={18} />
            Filters
          </Button>
        </div>
        
        <Button 
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }} 
          className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
        >
          <PlusCircle className="mr-2" size={18} />
          Add New Product
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select 
              value={selectedCategory} 
              onValueChange={(value) => setSelectedCategory(value as ProductCategory | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="new_arrivals">New Arrivals</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="footwear">Footwear</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price
            </label>
            <Input
              type="number"
              placeholder="0"
              min={0}
              value={priceFilter.min || ""}
              onChange={(e) => setPriceFilter({
                ...priceFilter, 
                min: e.target.value ? parseInt(e.target.value) : undefined
              })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price
            </label>
            <Input
              type="number"
              placeholder="No limit"
              min={0}
              value={priceFilter.max || ""}
              onChange={(e) => setPriceFilter({
                ...priceFilter, 
                max: e.target.value ? parseInt(e.target.value) : undefined
              })}
            />
          </div>
          
          <div className="md:col-span-3 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setPriceFilter({});
              }}
              className="mr-2"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <Tabs defaultValue="all" onValueChange={(value) => setSelectedCategory(value as ProductCategory | "all")} className="mb-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="new_arrivals">New Arrivals</TabsTrigger>
          <TabsTrigger value="clothing">Clothing</TabsTrigger>
          <TabsTrigger value="footwear">Footwear</TabsTrigger>
          <TabsTrigger value="accessories">Accessories</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ProductsTable 
            products={filteredProducts || []} 
            isLoading={isLoading} 
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onRefresh={refetch} 
          />
        </TabsContent>
        <TabsContent value="new_arrivals">
          <ProductsTable 
            products={filteredProducts || []} 
            isLoading={isLoading} 
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onRefresh={refetch} 
          />
        </TabsContent>
        <TabsContent value="clothing">
          <ProductsTable 
            products={filteredProducts || []} 
            isLoading={isLoading} 
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onRefresh={refetch} 
          />
        </TabsContent>
        <TabsContent value="footwear">
          <ProductsTable 
            products={filteredProducts || []} 
            isLoading={isLoading} 
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onRefresh={refetch} 
          />
        </TabsContent>
        <TabsContent value="accessories">
          <ProductsTable 
            products={filteredProducts || []} 
            isLoading={isLoading} 
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onRefresh={refetch} 
          />
        </TabsContent>
      </Tabs>

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
