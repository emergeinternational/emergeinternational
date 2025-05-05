
import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { ChevronRight, Plus, PenLine, Trash2 } from "lucide-react";
import { ShippingBanner } from "@/components/ShippingBanner";
import { Product, getAllProducts, addProduct, updateProduct, deleteProduct, toggleMockData } from "../services/shopService";
import ProductCard from "../components/shop/ProductCard";
import AdminModeToggle from "../components/shop/AdminModeToggle";
import ProductForm from "../components/shop/ProductForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [useMockData, setUseMockData] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { toast } = useToast();
  
  const categories = [
    { id: "new", name: "New Arrivals" },
    { id: "clothing", name: "Clothing" },
    { id: "footwear", name: "Footwear" },
    { id: "accessories", name: "Accessories" },
  ];
  
  useEffect(() => {
    loadProducts();
  }, [useMockData]);
  
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast({
        title: "Error Loading Products",
        description: "There was an error loading the products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleAdmin = (value: boolean) => {
    setIsAdmin(value);
  };
  
  const handleToggleMockData = () => {
    const newValue = !useMockData;
    setUseMockData(newValue);
    toggleMockData(newValue);
    toast({
      title: newValue ? "Using Mock Data" : "Using Database",
      description: newValue 
        ? "Displaying mock product data for demonstration" 
        : "Connected to the database for real product data",
    });
  };
  
  const openAddProductForm = () => {
    setSelectedProduct(null);
    setIsFormDialogOpen(true);
  };
  
  const openEditProductForm = (product: Product) => {
    setSelectedProduct(product);
    setIsFormDialogOpen(true);
  };
  
  const handleFormSubmit = async (productData: Product) => {
    try {
      let result;
      
      if (selectedProduct?.id) {
        // Update existing product
        result = await updateProduct(selectedProduct.id, productData);
      } else {
        // Add new product
        result = await addProduct(productData);
      }
      
      if (result) {
        await loadProducts();
        setIsFormDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };
  
  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
  };
  
  const handleDelete = async () => {
    if (!productToDelete?.id) return;
    
    try {
      const success = await deleteProduct(productToDelete.id);
      
      if (success) {
        toast({
          title: "Product Deleted",
          description: `Successfully deleted: ${productToDelete.title}`,
        });
        await loadProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProductToDelete(null);
    }
  };

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <MainLayout>
      <ShippingBanner />
      <div className="emerge-container py-8">
        <h1 className="emerge-heading text-4xl mb-8">Shop</h1>
        
        {/* Admin Mode Toggle */}
        <AdminModeToggle isAdmin={isAdmin} onChange={handleToggleAdmin} />
        
        {isAdmin && (
          <div className="bg-gray-50 p-4 rounded-md mb-6 flex flex-wrap gap-2">
            <Button 
              onClick={openAddProductForm} 
              className="bg-emerge-gold text-black hover:bg-emerge-gold/80 flex items-center gap-2"
            >
              <Plus size={16} />
              Add New Product
            </Button>
            
            <Button 
              onClick={handleToggleMockData} 
              variant="outline"
            >
              {useMockData ? "Use Database" : "Use Mock Data"}
            </Button>
            
            <Button 
              onClick={loadProducts} 
              variant="outline"
            >
              Refresh Products
            </Button>
          </div>
        )}
        
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row">
            <select 
              className="block sm:hidden mb-4 p-2 border border-gray-300 rounded"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              <option value="all">ALL PRODUCTS</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            
            <div className="hidden sm:flex flex-col space-y-2 w-64 mr-8">
              <button 
                onClick={() => setActiveCategory("all")}
                className={`text-left py-2 px-4 flex justify-between items-center ${
                  activeCategory === "all" ? "font-bold text-emerge-gold" : ""
                }`}
              >
                <span>ALL PRODUCTS</span>
                {activeCategory === "all" && <ChevronRight size={16} />}
              </button>
              
              {categories.map(category => (
                <button 
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`text-left py-2 px-4 flex justify-between items-center ${
                    activeCategory === category.id ? "font-bold text-emerge-gold" : ""
                  }`}
                >
                  <span>{category.name}</span>
                  {activeCategory === category.id && <ChevronRight size={16} />}
                </button>
              ))}
            </div>
            
            <div className="flex-1">
              {isLoading ? (
                <div className="text-center py-8">
                  <p>Loading products...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="relative">
                      <ProductCard product={product} />
                      
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="bg-white/80 hover:bg-white"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openEditProductForm(product);
                            }}
                          >
                            <PenLine size={16} />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="bg-white/80 hover:bg-red-100 text-red-600"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              confirmDelete(product);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <p>No products found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-8">
          <h2 className="emerge-heading text-2xl mb-4">About Our Products</h2>
          <p className="text-gray-700 max-w-3xl">
            Every item in our collection is designed and crafted by emerging African fashion talents. 
            We focus on sustainable materials, ethical production practices, and supporting local communities.
            By purchasing from Emerge International, you're directly supporting the growth and development 
            of Africa's fashion industry.
          </p>
        </div>
      </div>
      
      {/* Product Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={selectedProduct || undefined} 
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.title}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Shop;
