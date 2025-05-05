
import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { getProducts } from "../services/shopService";
import { getCollections } from "../services/collectionService";
import { ShopProduct, Collection } from "../types/shop";
import ProductCard from "../components/shop/ProductCard";
import ProductFormDialog from "../components/shop/ProductFormDialog";
import CollectionFormDialog from "../components/shop/CollectionFormDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { hasShopEditAccess, hasShopAdminAccess } from "@/services/shopAuthService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ErrorBoundary from "@/components/shop/ErrorBoundary";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

// Import AdminFloatingPanel with bare minimum props
interface AdminFloatingPanelProps {
  onAddProduct: () => void;
}

const AdminFloatingPanel: React.FC<AdminFloatingPanelProps> = ({ onAddProduct }) => {
  return (
    <div className="fixed bottom-6 right-6 flex gap-2">
      <Button onClick={onAddProduct}>
        Add Product
      </Button>
    </div>
  );
};

interface ShopProps {
  userRole: string | null;
  showDiagnostics?: boolean;
}

const Shop: React.FC<ShopProps> = ({ userRole, showDiagnostics = false }) => {
  try {
    // State for shop data
    const [products, setProducts] = useState<ShopProduct[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    
    // State for filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [isGridView, setIsGridView] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]); // Default price range
    const [maxPrice, setMaxPrice] = useState(100000);
    
    // State for dialogs
    const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
    const [isAddCollectionDialogOpen, setIsAddCollectionDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);

    // Simplified system settings
    const [systemSettings] = useState({
      recoveryMode: false,
      diagnosticsEnabled: false
    });
    
    // Get auth status directly from props
    const isAdmin = userRole === 'admin';
    const isEditor = userRole === 'editor' || userRole === 'admin';
    const canEdit = isEditor || isAdmin;

    // Load products and collections
    useEffect(() => {
      try {
        fetchProducts();
        fetchCollections();

        // Subscribe to product changes
        const productsChannel = supabase
          .channel('shop_product_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'shop_products'
            },
            (payload) => {
              console.log('Product change detected:', payload);
              fetchProducts();
              setLastUpdated(new Date());
            }
          )
          .subscribe();
          
        // Subscribe to variation changes
        const variationsChannel = supabase
          .channel('product_variations_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'product_variations'
            },
            (payload) => {
              console.log('Variation change detected:', payload);
              fetchProducts();
              setLastUpdated(new Date());
            }
          )
          .subscribe();
          
        // Subscribe to collection changes
        const collectionsChannel = supabase
          .channel('collections_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'collections'
            },
            (payload) => {
              console.log('Collection change detected:', payload);
              fetchCollections();
              setLastUpdated(new Date());
            }
          )
          .subscribe();
        
        return () => {
          supabase.removeChannel(productsChannel);
          supabase.removeChannel(variationsChannel);
          supabase.removeChannel(collectionsChannel);
        };
      } catch (error) {
        console.error("Error in Shop useEffect:", error);
        setLoading(false);
      }
    }, []);

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        
        // Defensive check for valid data
        if (!data || !Array.isArray(data)) {
          console.error("Invalid products data received:", data);
          setProducts([]);
          return;
        }
        
        setProducts(data);
        setLastUpdated(new Date());
        
        // Extract unique categories with null checks
        const uniqueCategories = Array.from(
          new Set(data.filter(product => product && product.category).map(product => product.category))
        ) as string[];
        
        setCategories(uniqueCategories);
        
        // Set max price based on products with defensive checks
        const highestPrice = Math.max(
          ...data.map(product => (product && product.price) ? product.price : 0),
          ...data.flatMap(p => (p && p.variations) 
            ? p.variations.map(v => (v && v.price) ? v.price : 0) 
            : [0])
        );
        setMaxPrice(Math.max(highestPrice, 100000)); // Ensure there is a reasonable minimum
        setPriceRange([0, Math.max(highestPrice, 100000)]);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCollections = async () => {
      try {
        const data = await getCollections();
        if (!data || !Array.isArray(data)) {
          console.error("Invalid collections data received:", data);
          setCollections([]);
        } else {
          setCollections(data);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        setCollections([]);
      }
    };

    const handleDeleteProduct = async (id: string) => {
      if (!hasShopEditAccess()) {
        toast.error("You don't have permission to delete products");
        return;
      }
      
      if (!id) {
        toast.error("Invalid product ID");
        return;
      }
      
      try {
        // Import locally to avoid global reference
        const { deleteProduct } = await import("../services/shopService");
        const success = await deleteProduct(id);
        if (success) {
          // Optimistic UI update
          setProducts(prevProducts => prevProducts.filter(product => product && product.id !== id));
          toast.success("Product deleted successfully");
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
        // Refresh products to ensure UI is in sync with backend
        fetchProducts();
      }
    };

    const handleEditProduct = (product: ShopProduct) => {
      if (!hasShopEditAccess()) {
        toast.error("You don't have permission to edit products");
        return;
      }
      
      if (!product || !product.id) {
        toast.error("Invalid product selected for editing");
        return;
      }
      
      setSelectedProduct(product);
      setIsEditDialogOpen(true);
    };

    const handleSizeChange = (size: string) => {
      if (!size) return; // Defensive check
      
      setSelectedSizes(prev => 
        prev.includes(size)
          ? prev.filter(s => s !== size)
          : [...prev, size]
      );
    };

    const handleColorChange = (color: string) => {
      if (!color) return; // Defensive check
      
      setSelectedColors(prev => 
        prev.includes(color)
          ? prev.filter(c => c !== color)
          : [...prev, color]
      );
    };

    const handleClearFilters = () => {
      setSearchTerm("");
      setSelectedCategory(null);
      setSelectedCollection(null);
      setSelectedSizes([]);
      setSelectedColors([]);
      setPriceRange([0, maxPrice]);
    };

    // Add null checks and defensive programming to filter
    const filteredProducts = products.filter(product => {
      if (!product) return false;
      
      const matchesSearch = !searchTerm || (
        ((product.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (product.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      const matchesCollection = !selectedCollection || product.collection_id === selectedCollection;
      
      const matchesPrice = (product.price ?? 0) >= priceRange[0] && (product.price ?? 0) <= priceRange[1];
      
      const matchesSize = selectedSizes.length === 0 || (
        product.variations?.some(v => v?.size && selectedSizes.includes(v.size))
      );
      
      const matchesColor = selectedColors.length === 0 || (
        product.variations?.some(v => v?.color && selectedColors.includes(v.color))
      );
      
      return matchesSearch && matchesCategory && matchesCollection && matchesPrice && matchesSize && matchesColor;
    });

    // Group products by collection for better display
    const groupedProducts = filteredProducts.reduce((acc, product) => {
      if (!product) return acc;
      
      const collectionId = product.collection_id || 'uncategorized';
      if (!acc[collectionId]) {
        acc[collectionId] = [];
      }
      acc[collectionId].push(product);
      return acc;
    }, {} as Record<string, ShopProduct[]>);

    const collectionEntries = Object.entries(groupedProducts).map(([collectionId, products]) => {
      const collection = collections.find(c => c && c.id === collectionId);
      return {
        id: collectionId,
        title: collection ? collection.title : 'Other Products',
        designer: collection ? collection.designer_name : '',
        products
      };
    }).sort((a, b) => {
      // Sort collections with named collections first
      if (a.id === 'uncategorized' && b.id !== 'uncategorized') return 1;
      if (a.id !== 'uncategorized' && b.id === 'uncategorized') return -1;
      return a.title.localeCompare(b.title);
    });

    return (
      <MainLayout>
        <ErrorBoundary>
          <div className="container mx-auto px-4 py-8">
            {/* Replaced AdminRecoveryTools with simple message */}
            {isAdmin && (
              <div className="mb-6">
                <div className="text-yellow-500 text-sm p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                  Recovery features temporarily disabled. Admin tools will return in the next update.
                </div>
              </div>
            )}
            
            {/* Text center heading section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop Our Collection</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover our curated selection of fashion and accessories from emerging designers
              </p>
            </div>

            {/* Search and Filter Section */}
            <ErrorBoundary>
              <div className="mb-8 flex items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={fetchProducts}
                  className="ml-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </ErrorBoundary>

            {/* Main Content with Sidebar */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Filter Sidebar */}
              <ErrorBoundary>
                <div className="w-full md:w-64 flex-shrink-0">
                  <FilterSidebar 
                    collections={collections}
                    products={products}
                    selectedCollection={selectedCollection}
                    selectedCategory={selectedCategory}
                    selectedSizes={selectedSizes}
                    selectedColors={selectedColors}
                    priceRange={priceRange}
                    maxPrice={maxPrice}
                    onCollectionChange={setSelectedCollection}
                    onCategoryChange={setSelectedCategory}
                    onSizeChange={handleSizeChange}
                    onColorChange={handleColorChange}
                    onPriceRangeChange={setPriceRange}
                    onClearFilters={handleClearFilters}
                  />
                </div>
              </ErrorBoundary>

              {/* Products Display */}
              <ErrorBoundary>
                <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array(8).fill(0).map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="aspect-square w-full" />
                        <CardHeader className="pb-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                        <CardContent className="pb-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6 mt-2" />
                        </CardContent>
                        <CardFooter>
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-8 w-1/3 ml-auto" />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="space-y-8">
                    {collectionEntries.map(({ id, title, designer, products }) => (
                      <div key={id} className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold">
                            {title}
                            {designer && <span className="ml-2 text-sm text-gray-500">by {designer}</span>}
                          </h2>
                        </div>
                        
                        <div className={isGridView 
                          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
                          : "space-y-4"
                        }>
                          {products.map(product => (
                            <ErrorBoundary key={product.id}>
                              <ProductCard 
                                product={product} 
                                onEdit={handleEditProduct} 
                                onDelete={handleDeleteProduct} 
                                canEdit={canEdit}
                              />
                            </ErrorBoundary>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500">
                      Try adjusting your filters or search terms
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleClearFilters}
                      className="mt-4"
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
                </div>
              </ErrorBoundary>
            </div>
            
            {/* Admin floating panel for actions */}
            {canEdit && (
              <AdminFloatingPanel 
                onAddProduct={() => setIsAddProductDialogOpen(true)}
              />
            )}
            
            {/* Form dialogs */}
            <ProductFormDialog
              open={isAddProductDialogOpen}
              onOpenChange={setIsAddProductDialogOpen}
              product={null}
              onSuccess={(newProduct) => {
                if (newProduct) {
                  setProducts(prev => [newProduct, ...prev]);
                }
                setIsAddProductDialogOpen(false);
              }}
            />
            
            {selectedProduct && (
              <ProductFormDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                product={selectedProduct}
                onSuccess={(updatedProduct) => {
                  if (updatedProduct) {
                    setProducts(prev => prev.map(product => 
                      product.id === updatedProduct.id ? updatedProduct : product
                    ));
                  }
                  setSelectedProduct(null);
                  setIsEditDialogOpen(false);
                }}
              />
            )}
            
            <CollectionFormDialog
              open={isAddCollectionDialogOpen}
              onOpenChange={setIsAddCollectionDialogOpen}
              collection={null}
              onSuccess={(newCollection) => {
                if (newCollection) {
                  setCollections(prev => [newCollection, ...prev]);
                }
                setIsAddCollectionDialogOpen(false);
              }}
            />
          </div>
        </ErrorBoundary>
      </MainLayout>
    );
  } catch (error) {
    console.error("Critical error in Shop component:", error);
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="p-4 border rounded-md bg-yellow-50">
            <div className="text-yellow-600">
              An error occurred loading the Shop. Please refresh the page to try again.
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
};

export default Shop;
