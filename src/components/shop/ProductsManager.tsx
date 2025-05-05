
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShopProduct } from "@/types/shop";
import { getProducts, deleteProduct } from "@/services/shopService";
import ProductsTable from "./ProductsTable";
import ProductFormDialog from "./ProductFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { getAuthStatus, hasShopEditAccess } from "@/services/shopAuthService";
import CollectionsManager from "./CollectionsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MockupGenerator from "./recovery/MockupGenerator";

interface ProductsManagerProps {
  isLocked?: boolean;
}

const ProductsManager: React.FC<ProductsManagerProps> = ({ isLocked = false }) => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = getAuthStatus();
  const canEdit = !isLocked && hasShopEditAccess();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    
    // Subscribe to changes
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
      
    // Also listen for variation changes
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
      
    // Listen for collections changes
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
          fetchProducts();
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
    try {
      setIsLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
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

  const handleEdit = (product: ShopProduct) => {
    if (!canEdit) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit products",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!canEdit) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete products",
        variant: "destructive"
      });
      return;
    }
    
    if (confirm("Are you sure you want to delete this product?")) {
      const success = await deleteProduct(productId);
      if (success) {
        setProducts(prev => prev.filter(product => product.id !== productId));
      }
    }
  };

  // If user doesn't have permission, don't render the component
  if (!isAdmin && !isLocked) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have permission to access this page</p>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          {isAdmin && <TabsTrigger value="tools">Tools</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Shop Products</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={fetchProducts} 
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              
              {canEdit && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              )}
            </div>
          </div>

          <ProductsTable 
            products={products} 
            isLoading={isLoading} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            isLocked={!canEdit} 
          />
        </TabsContent>
        
        <TabsContent value="collections">
          <CollectionsManager isLocked={isLocked} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="tools">
            <MockupGenerator isLocked={isLocked} onProductsGenerated={fetchProducts} />
          </TabsContent>
        )}
      </Tabs>
      
      {/* Form dialog for adding new products */}
      <ProductFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        product={null}
        onSuccess={(newProduct) => {
          if (newProduct) {
            setProducts(prev => [newProduct, ...prev]);
          }
          setIsAddDialogOpen(false);
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
            setIsEditDialogOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ProductsManager;
