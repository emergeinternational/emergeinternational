
import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { getProducts, deleteProduct } from "../services/shopService";
import { getCollections } from "../services/collectionService";
import { ShopProduct, Collection } from "../types/shop";
import ProductCard from "../components/shop/ProductCard";
import ProductFormDialog from "../components/shop/ProductFormDialog";
import CollectionFormDialog from "../components/shop/CollectionFormDialog";
import CollectionFilter from "../components/shop/CollectionFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Trash2, Edit, Plus } from "lucide-react";
import { hasShopEditAccess, getAuthStatus } from "@/services/shopAuthService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isAddCollectionDialogOpen, setIsAddCollectionDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Get auth status from isolated service
  const { isAdmin } = getAuthStatus();
  const canEdit = hasShopEditAccess();

  useEffect(() => {
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
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(variationsChannel);
      supabase.removeChannel(collectionsChannel);
    };
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

  const fetchCollections = async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!canEdit) {
      toast.error("You don't have permission to delete products");
      return;
    }
    
    try {
      const success = await deleteProduct(id);
      if (success) {
        setProducts(products.filter(product => product.id !== id));
        toast.success("Product deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEditProduct = (product: ShopProduct) => {
    if (!canEdit) {
      toast.error("You don't have permission to edit products");
      return;
    }
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    const matchesCollection = selectedCollection ? product.collection_id === selectedCollection : true;
    
    return matchesSearch && matchesCategory && matchesCollection;
  });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };
  
  const handleCollectionSelect = (collectionId: string | null) => {
    setSelectedCollection(collectionId);
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
              {canEdit && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => setIsAddCollectionDialogOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Collection
                  </Button>
                  <Button 
                    onClick={() => setIsAddProductDialogOpen(true)}
                    className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Collection Filter */}
          {collections.length > 0 && (
            <CollectionFilter 
              collections={collections} 
              selectedCollection={selectedCollection}
              onCollectionSelect={handleCollectionSelect}
            />
          )}
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className={!selectedCategory ? "bg-primary text-primary-foreground" : ""}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
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
                {canEdit && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <Button 
                      variant="secondary"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(product);
                      }}
                      className="bg-white/80 hover:bg-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
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
                setSelectedCollection(null);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Form dialog for adding new products */}
      <ProductFormDialog
        open={isAddProductDialogOpen}
        onOpenChange={setIsAddProductDialogOpen}
        product={null}
        onSuccess={(newProduct) => {
          if (newProduct) {
            setProducts(prev => [newProduct, ...prev]);
          }
        }}
      />
      
      {/* Form dialog for editing existing products */}
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
          }}
        />
      )}
      
      {/* Form dialog for adding new collections */}
      <CollectionFormDialog
        open={isAddCollectionDialogOpen}
        onOpenChange={setIsAddCollectionDialogOpen}
        collection={null}
        onSuccess={(newCollection) => {
          if (newCollection) {
            setCollections(prev => [newCollection, ...prev]);
          }
        }}
      />
    </MainLayout>
  );
};

export default Shop;
