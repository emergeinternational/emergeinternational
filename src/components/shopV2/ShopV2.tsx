
import React, { useState, useEffect } from 'react';
import { ShopProductV2, Collection } from '@/types/shopV2';
import { 
  getProducts, 
  getCollections, 
  deleteProduct,
  subscribeToProducts 
} from '@/services/shopV2Service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ProductGridV2 from './ProductGridV2';
import ProductsManagerV2 from './ProductsManagerV2';
import CollectionsManagerV2 from './CollectionsManagerV2';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ShopV2Props {
  userRole?: string | null;
}

const ShopV2: React.FC<ShopV2Props> = ({ userRole }) => {
  const [products, setProducts] = useState<ShopProductV2[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const isAdmin = userRole === 'admin' || userRole === 'editor';

  // Function to load products
  const loadProducts = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Get products based on role
      const productsData = await getProducts(
        isAdmin ? undefined : { status: 'published' }
      );
      
      setProducts(productsData);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load collections
  const loadCollections = async () => {
    try {
      const collectionsData = await getCollections();
      setCollections(collectionsData);
    } catch (err) {
      console.error('Error loading collections:', err);
      // Don't set the main error state, as this is secondary data
    }
  };

  // Initial data loading
  useEffect(() => {
    loadProducts();
    loadCollections();
  }, [isAdmin]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = subscribeToProducts((payload) => {
      // Handle different events (INSERT, UPDATE, DELETE)
      if (payload.eventType === 'INSERT') {
        const newProduct = payload.new as ShopProductV2;
        
        // Only add to UI if it's published or user is admin
        if (newProduct.status === 'published' || isAdmin) {
          setProducts(prev => [newProduct, ...prev]);
        }
      } 
      else if (payload.eventType === 'UPDATE') {
        const updatedProduct = payload.new as ShopProductV2;
        setProducts(prev => prev.map(p => 
          p.id === updatedProduct.id ? updatedProduct : p
        ));
      }
      else if (payload.eventType === 'DELETE') {
        const deletedProductId = payload.old.id;
        setProducts(prev => prev.filter(p => p.id !== deletedProductId));
      }
    });

    return () => {
      // Clean up the subscription when component unmounts
      subscription.unsubscribe();
    };
  }, [isAdmin]);

  // Handle product edit
  const handleEditProduct = (product: ShopProductV2) => {
    // This will be handled in the ProductsManager component
  };

  // Handle product delete
  const handleDeleteProduct = async (productId: string) => {
    try {
      const success = await deleteProduct(productId);
      
      if (success) {
        // Remove from UI
        setProducts(prev => prev.filter(p => p.id !== productId));
        
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle adding a new product
  const handleProductAdded = (product: ShopProductV2) => {
    setProducts(prev => [product, ...prev]);
  };

  // Handle updating a product
  const handleProductUpdated = (updatedProduct: ShopProductV2) => {
    setProducts(prev => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  // Handle adding a new collection
  const handleCollectionAdded = (collection: Collection) => {
    setCollections(prev => [collection, ...prev]);
  };

  // Render error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <button 
          onClick={loadProducts}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shop V2</h1>
        <p className="text-gray-600">Browse our collection of products</p>
      </div>
      
      {isAdmin && (
        <Tabs defaultValue="products" className="mb-10">
          <TabsList className="mb-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6">
            <ProductsManagerV2
              onProductAdded={handleProductAdded}
              onProductUpdated={handleProductUpdated}
              collections={collections}
            />
          </TabsContent>
          
          <TabsContent value="collections">
            <CollectionsManagerV2
              collections={collections}
              onCollectionAdded={handleCollectionAdded}
            />
          </TabsContent>
        </Tabs>
      )}
      
      <ProductGridV2 
        products={products} 
        loading={isLoading}
        isAdmin={isAdmin}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

export default ShopV2;
