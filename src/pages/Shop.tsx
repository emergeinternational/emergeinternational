
import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { getProducts, deleteProduct } from "../services/shopService";
import { ShopProduct } from "../types/shop";
import ProductCard from "../components/shop/ProductCard";
import ProductFormDialog from "../components/shop/ProductFormDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Trash2 } from "lucide-react";
import { getAuthStatus } from "@/services/shopAuthService"; // Changed to local shopAuthService
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

const Shop = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  // Get auth status from isolated service
  const { isAdmin } = getAuthStatus();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map(product => product.category).filter(Boolean))
      ) as string[];
      
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const success = await deleteProduct(id);
      if (success) {
        fetchProducts();
        toast.success("Product deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop Our Collection</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our curated selection of fashion and accessories from emerging designers
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className={!selectedCategory ? "bg-primary text-primary-foreground" : ""}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
                onClick={() => handleCategorySelect(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToDelete(product.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching your criteria</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Form dialog for adding new products */}
      <ProductFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        product={null}
        onSuccess={fetchProducts}
      />
    </MainLayout>
  );
};

export default Shop;
