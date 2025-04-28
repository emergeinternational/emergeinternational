
import React, { useState, useEffect } from "react";
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
  const [mockProducts, setMockProducts] = useState<Product[]>([]);
  const [isLoadingMock, setIsLoadingMock] = useState(false);

  // Fetch all products with additional logging
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching products:", fetchError);
          throw fetchError;
        }

        console.log("Products fetched successfully:", data);
        return data as Product[] || [];
      } catch (err) {
        console.error("Error in queryFn:", err);
        throw err;
      }
    },
  });

  // Load mock products from Shop page on component mount
  useEffect(() => {
    const loadMockProducts = () => {
      setIsLoadingMock(true);
      try {
        // Mock products data from Shop.tsx
        const shopMockProducts: Product[] = [
          { 
            id: "mock-1", 
            title: "Emerge T-Shirt", 
            price: 4800, 
            category: "clothing", 
            image_url: "/placeholder.svg",
            is_published: true,
            in_stock: true,
            description: "Comfortable cotton t-shirt with Emerge logo",
            sales_count: 12
          },
          { 
            id: "mock-2", 
            title: "Designer Earrings", 
            price: 12500, 
            category: "accessories", 
            image_url: "/placeholder.svg",
            is_published: true,
            in_stock: true,
            description: "Handcrafted designer earrings",
            sales_count: 5
          },
          { 
            id: "mock-3", 
            title: "Leather Bag", 
            price: 4800, 
            category: "accessories", 
            image_url: "/placeholder.svg",
            is_published: true,
            in_stock: true,
            description: "Premium leather bag with custom design",
            sales_count: 8
          },
          { 
            id: "mock-4", 
            title: "Tailored Coat", 
            price: 12500, 
            category: "clothing", 
            image_url: "/placeholder.svg",
            is_published: true,
            in_stock: true,
            description: "Tailored coat for all seasons",
            sales_count: 3
          },
          { 
            id: "mock-5", 
            title: "Woven Sandals", 
            price: 3200, 
            category: "footwear", 
            image_url: "/placeholder.svg",
            is_published: true,
            in_stock: true,
            description: "Handwoven comfortable sandals",
            sales_count: 9
          },
          { 
            id: "mock-6", 
            title: "Patterned Scarf", 
            price: 2400, 
            category: "accessories", 
            image_url: "/placeholder.svg",
            is_published: true,
            in_stock: true,
            description: "Beautiful patterned scarf with traditional design",
            sales_count: 15
          },
          { 
            id: "mock-7", 
            title: "Denim Jacket", 
            price: 8600, 
            category: "clothing", 
            image_url: "/placeholder.svg",
            is_published: true,
            in_stock: true,
            description: "Premium denim jacket with custom embroidery",
            sales_count: 7
          },
          { 
            id: "mock-8", 
            title: "Leather Boots", 
            price: 7500, 
            category: "footwear", 
            image_url: "/placeholder.svg",
            is_published: true,
            in_stock: true,
            description: "Durable leather boots for all terrains",
            sales_count: 11
          },
        ];
        
        // Filter out any mock products that have already been converted to real products
        if (products) {
          const existingProductTitles = products.map(p => p.title.toLowerCase());
          const filteredMocks = shopMockProducts.filter(
            mock => !existingProductTitles.includes(mock.title.toLowerCase())
          );
          setMockProducts(filteredMocks);
        } else {
          setMockProducts(shopMockProducts);
        }
      } catch (err) {
        console.error("Error loading mock products:", err);
      } finally {
        setIsLoadingMock(false);
      }
    };

    loadMockProducts();
  }, [products]);

  // Handle product edit
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    // For mock products, just show a toast notification
    if (productId.startsWith("mock-")) {
      const mockProductToDelete = mockProducts.find(p => p.id === productId);
      toast({
        title: "Mock product action",
        description: `The product "${mockProductToDelete?.title}" would be deleted in a live environment.`,
      });
      return;
    }
    
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

  // Handle mock product save/conversion
  const handleMockProductSave = (editedProduct: Product) => {
    if (editedProduct.id.startsWith("mock-")) {
      // If this was a real conversion, remove it from mock products
      if (!editedProduct.id.startsWith("mock-")) {
        setMockProducts(prevMock => 
          prevMock.filter(p => p.id !== `mock-${editedProduct.id}`)
        );
        refetch(); // Refresh to get the new real product
      } else {
        // Just update the UI for mock products
        setMockProducts(prevMock => 
          prevMock.map(p => p.id === editedProduct.id ? editedProduct : p)
        );
      }
    }
  };

  // Combine database products and mock products
  const combinedProducts = [...(products || []), ...mockProducts];

  // Filter products based on search query and selected category
  const filteredProducts = combinedProducts?.filter((product) => {
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
            isLoading={isLoading || isLoadingMock} 
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onRefresh={refetch} 
          />
        </TabsContent>
        
        {["new_arrivals", "clothing", "footwear", "accessories"].map((category) => (
          <TabsContent key={category} value={category}>
            <ProductsTable 
              products={filteredProducts || []} 
              isLoading={isLoading || isLoadingMock} 
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onRefresh={refetch} 
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Product Form Dialog */}
      <ProductFormDialog 
        open={isFormOpen}
        product={editingProduct}
        onClose={handleFormClose}
        onMockSave={handleMockProductSave}
      />
    </div>
  );
};

export default ProductsManager;
