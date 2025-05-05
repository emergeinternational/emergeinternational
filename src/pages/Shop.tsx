import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { getProducts, deleteProduct } from "../services/shopService";
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
import AdminFloatingPanel from "@/components/shop/AdminFloatingPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import ShopDiagnosticPanel from "@/components/shop/ShopDiagnosticPanel";
import RecoveryFallback from "@/components/shop/RecoveryFallback";
import DeveloperNotesOverlay from "@/components/shop/DeveloperNotesOverlay";
import AdminRecoveryTools from "@/components/shop/AdminRecoveryTools";
import { getShopSystemSettings, toggleDiagnosticsMode } from "@/services/shopSystemService";
import { RefreshCw } from "lucide-react";

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
    const [dataError, setDataError] = useState<boolean>(false);
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

    // State for system settings
    const [systemSettings, setSystemSettings] = useState<any>({
      recoveryMode: false,
      fallbackLevel: 'minimal',
      diagnosticsEnabled: showDiagnostics
    });

    // State for recovery errors 
    const [recoveryError, setRecoveryError] = useState<Error | null>(null);
    
    // Get auth status directly from props
    const isAdmin = userRole === 'admin';
    const isEditor = userRole === 'editor' || userRole === 'admin';
    const canEdit = isEditor || isAdmin;

    // Load system settings for admins
    useEffect(() => {
      if (isAdmin) {
        loadSystemSettings();
      }
    }, [isAdmin]);
    
    const loadSystemSettings = async () => {
      try {
        const settings = await getShopSystemSettings();
        setSystemSettings({
          recoveryMode: settings.recoveryMode,
          fallbackLevel: settings.fallbackLevel || 'minimal',
          diagnosticsEnabled: settings.diagnosticsEnabled,
          liveSync: settings.liveSync
        });
      } catch (error) {
        console.error("Error loading system settings:", error);
      }
    };

    // Handle diagnostics toggle
    const handleToggleDiagnostics = async () => {
      if (hasShopAdminAccess()) {
        const newValue = !systemSettings.diagnosticsEnabled;
        const success = await toggleDiagnosticsMode(newValue);
        
        if (success) {
          setSystemSettings(prev => ({
            ...prev,
            diagnosticsEnabled: newValue
          }));
          
          toast.success(`Diagnostics ${newValue ? 'enabled' : 'disabled'}`);
          
          // Update URL if turning diagnostics on
          if (newValue) {
            // Add the diagnostics parameter if not already present
            const url = new URL(window.location.href);
            if (!url.searchParams.has('diagnostics')) {
              url.searchParams.set('diagnostics', 'true');
              window.history.pushState({}, '', url.toString());
            }
          } else {
            // Remove the diagnostics parameter if present
            const url = new URL(window.location.href);
            if (url.searchParams.has('diagnostics')) {
              url.searchParams.delete('diagnostics');
              window.history.pushState({}, '', url.toString());
            }
          }
        }
      } else {
        toast.error("You don't have permission to toggle diagnostics mode");
      }
    };

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
        
        // Subscribe to system settings changes for admins
        let settingsChannel;
        if (isAdmin) {
          settingsChannel = supabase
            .channel('shop_system_settings_changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'shop_system_settings'
              },
              (payload) => {
                console.log('System settings changed:', payload);
                loadSystemSettings();
              }
            )
            .subscribe();
        }
        
        return () => {
          supabase.removeChannel(productsChannel);
          supabase.removeChannel(variationsChannel);
          supabase.removeChannel(collectionsChannel);
          if (settingsChannel) {
            supabase.removeChannel(settingsChannel);
          }
        };
      } catch (error) {
        console.error("Error in Shop useEffect:", error);
        handleRecoveryMode(error as Error);
      }
    }, []);

    const handleRecoveryMode = (error: Error) => {
      setRecoveryError(error);
      setDataError(true);
      
      // If system is in recovery mode, don't show the error toast
      if (!systemSettings.recoveryMode) {
        toast.error("Shop encountered an error and is attempting to recover");
      }
    };

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        
        // Defensive check for valid data
        if (!data || !Array.isArray(data)) {
          console.error("Invalid products data received:", data);
          throw new Error("Invalid products data format");
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
        
        // Clear any previous data error state
        setDataError(false);
        setRecoveryError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        handleRecoveryMode(error as Error);
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

    // If we should render in recovery mode
    const shouldUseRecoveryMode = systemSettings.recoveryMode || dataError;

    // If in full recovery mode, render the RecoveryFallback component
    if (shouldUseRecoveryMode && systemSettings.fallbackLevel === 'full') {
      return (
        <MainLayout>
          <RecoveryFallback 
            products={products} 
            error={recoveryError} 
            level="full"
          />
          {isAdmin && <AdminRecoveryTools />}
        </MainLayout>
      );
    }

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

    // If we should show the diagnostic panel
    const showDiagnosticsPanel = (showDiagnostics || systemSettings.diagnosticsEnabled) && isAdmin;

    return (
      <MainLayout>
        <ErrorBoundary>
          <div className="container mx-auto px-4 py-8">
            {/* AdminRecoveryTools component - only visible to admins */}
            {isAdmin && <AdminRecoveryTools />}
            
            {/* Shop Diagnostic Panel - only shown when diagnostics is enabled for admins */}
            {showDiagnosticsPanel && (
              <ErrorBoundary 
                fallback={<div className="bg-red-100 p-4 mb-6 rounded-lg">Error loading diagnostics panel</div>}
              >
                <ShopDiagnosticPanel />
              </ErrorBoundary>
            )}
            
            {/* Recovery mode notice - only when using partial recovery mode */}
            {shouldUseRecoveryMode && systemSettings.fallbackLevel !== 'full' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Shop Recovery Mode Active
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Some features may be limited while the shop is in recovery mode. 
                        {isAdmin && (
                          <Button 
                            variant="link" 
                            onClick={() => loadSystemSettings()}
                            className="p-0 h-auto text-yellow-800 underline"
                          >
                            Refresh status
                          </Button>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Text center heading section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop Our Collection</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover our curated selection of fashion and accessories from emerging designers
              </p>
              
              {/* Admin diagnostics toggle - only visible to admins */}
              {isAdmin && (
                <div className="flex justify-center mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleToggleDiagnostics}
                    className="text-xs"
                  >
                    {systemSettings.diagnosticsEnabled ? 'Disable' : 'Enable'} Diagnostics
                  </Button>
                </div>
              )}
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
                  onClick={refreshProducts}
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
              <ErrorBoundary fallback={
                // Fall back to minimal recovery view if product section fails
                <div className="flex-1">
                  <RecoveryFallback products={products} level="minimal" />
                </div>
              }>
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
                            <ErrorBoundary 
                              key={product.id}
                              fallback={
                                // Fall back to minimal product card if individual card fails
                                shouldUseRecoveryMode ? (
                                  <div className="border rounded-md overflow-hidden">
                                    <RecoveryFallback products={[product]} level="minimal" />
                                  </div>
                                ) : (
                                  <Card className="overflow-hidden">
                                    <CardHeader className="pb-2">
                                      <h3 className="font-medium truncate">{product.title || 'Untitled Product'}</h3>
                                    </CardHeader>
                                    <CardFooter>
                                      <span className="font-semibold">${product.price?.toFixed(2) || '0.00'}</span>
                                    </CardFooter>
                                  </Card>
                                )
                              }
                            >
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
                onRefresh={refreshProducts}
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
            
            {/* Developer Notes Overlay - only visible to admin and activated via Alt+D */}
            <DeveloperNotesOverlay products={products} />
          </div>
        </ErrorBoundary>
      </MainLayout>
    );
  } catch (error) {
    console.error("Critical error in Shop component:", error);
    return (
      <MainLayout>
        <RecoveryFallback products={[]} error={error as Error} level="full" />
      </MainLayout>
    );
  }
};

export default Shop;
