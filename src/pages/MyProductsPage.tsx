
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { getDesignerProducts, saveProductDraft, submitDraftForApproval, deleteDesignerProduct } from '@/services/designerProductService';
import { ProductSubmission } from '@/types/shopSubmission';
import { ShopProduct } from '@/types/shop';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreHorizontal, Package, PlusCircle } from 'lucide-react';
import StatusBadge from '@/components/shop/StatusBadge';
import ProductFormDialog from '@/components/shop/ProductFormDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import NotificationsDropdown from '@/components/shop/NotificationsDropdown';
import ErrorBoundary from '@/components/shop/ErrorBoundary';

const MyProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddNewOpen, setIsAddNewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [submitType, setSubmitType] = useState<'draft' | 'pending'>('pending');
  const { user, userRole, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated and has designer role
    if (!authLoading && !isAuthenticated) {
      toast.error("Please log in to access your products");
      navigate('/login');
      return;
    }
    
    if (!authLoading && userRole !== 'designer' && userRole !== 'admin') {
      toast.error("Only designers can access this page");
      navigate('/shop');
      return;
    }
    
    // Fetch designer products
    fetchDesignerProducts();
  }, [isAuthenticated, userRole, authLoading, navigate]);
  
  const fetchDesignerProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getDesignerProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load designer products:", error);
      toast.error("Failed to load your products");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditProduct = (product: ProductSubmission) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };
  
  const handleDeleteProduct = async (product: ProductSubmission) => {
    try {
      if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
        const success = await deleteDesignerProduct(product.id);
        if (success) {
          setProducts(products.filter(p => p.id !== product.id));
          toast.success("Product deleted successfully");
        }
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };
  
  const handleProductUpdate = (updatedProduct: ShopProduct | null) => {
    if (!updatedProduct) return;
    
    // Refresh the products list to get the latest data
    fetchDesignerProducts();
  };
  
  const handleSubmitDraft = async (productId: string) => {
    try {
      const success = await submitDraftForApproval(productId);
      if (success) {
        // Refresh product list
        fetchDesignerProducts();
      }
    } catch (error) {
      console.error("Failed to submit draft:", error);
      toast.error("Failed to submit product for approval");
    }
  };
  
  const getDraftProducts = () => products.filter(p => p.status === 'draft');
  const getPendingProducts = () => products.filter(p => p.status === 'pending');
  const getApprovedProducts = () => products.filter(p => p.status === 'published');
  const getRejectedProducts = () => products.filter(p => p.status === 'rejected');
  
  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-10">
      <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
      <p className="text-gray-500">{message}</p>
    </div>
  );
  
  // Authentication loading state
  if (authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Verifying your credentials...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Auth or role check failed - show a helpful message instead of redirecting immediately
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                <p className="mb-4">Please log in to access your product submissions.</p>
                <Button onClick={() => navigate('/login')}>Go to Login</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  if (userRole !== 'designer' && userRole !== 'admin') {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
                <p className="mb-4">Only designers can access product submissions.</p>
                <Button onClick={() => navigate('/shop')}>Go to Shop</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <ErrorBoundary>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Products</h1>
              <p className="text-gray-500">Manage your shop products and submissions</p>
            </div>
            <div className="flex space-x-2">
              <NotificationsDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Product
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setSubmitType('pending');
                    setIsAddNewOpen(true);
                  }}>
                    Submit for Approval
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSubmitType('draft');
                    setIsAddNewOpen(true);
                  }}>
                    Save as Draft
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <ErrorBoundary>
            <Card>
              <Tabs defaultValue="all" className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="grid grid-cols-5 sm:w-[500px]">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="drafts">
                      Drafts
                      {getDraftProducts().length > 0 && (
                        <Badge variant="secondary" className="ml-1">{getDraftProducts().length}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                      Pending
                      {getPendingProducts().length > 0 && (
                        <Badge variant="secondary" className="ml-1">{getPendingProducts().length}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="overflow-hidden">
                          <Skeleton className="h-40 w-full" />
                          <CardHeader className="pb-2">
                            <Skeleton className="h-6 w-3/4" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                          </CardContent>
                          <CardFooter>
                            <Skeleton className="h-8 w-20" />
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <>
                      <TabsContent value="all">
                        {products.length > 0 ? (
                          <ProductGrid 
                            products={products} 
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            onSubmitDraft={handleSubmitDraft}
                          />
                        ) : (
                          <EmptyState message="You haven't created any products yet" />
                        )}
                      </TabsContent>
                      
                      <TabsContent value="drafts">
                        {getDraftProducts().length > 0 ? (
                          <ProductGrid 
                            products={getDraftProducts()} 
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            onSubmitDraft={handleSubmitDraft}
                          />
                        ) : (
                          <EmptyState message="You don't have any draft products" />
                        )}
                      </TabsContent>
                      
                      <TabsContent value="pending">
                        {getPendingProducts().length > 0 ? (
                          <ProductGrid 
                            products={getPendingProducts()}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                          />
                        ) : (
                          <EmptyState message="You don't have any pending product submissions" />
                        )}
                      </TabsContent>
                      
                      <TabsContent value="published">
                        {getApprovedProducts().length > 0 ? (
                          <ProductGrid 
                            products={getApprovedProducts()}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            readOnly={true}
                          />
                        ) : (
                          <EmptyState message="You don't have any published products yet" />
                        )}
                      </TabsContent>
                      
                      <TabsContent value="rejected">
                        {getRejectedProducts().length > 0 ? (
                          <ProductGrid 
                            products={getRejectedProducts()}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            showRejectionReason={true}
                          />
                        ) : (
                          <EmptyState message="You don't have any rejected submissions" />
                        )}
                      </TabsContent>
                    </>
                  )}
                </CardContent>
              </Tabs>
            </Card>
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
      
      {/* Product form dialogs */}
      <ProductFormDialog 
        open={isAddNewOpen}
        onOpenChange={setIsAddNewOpen}
        product={null}
        onSuccess={handleProductUpdate}
        submitType={submitType}
      />
      
      {selectedProduct && (
        <ProductFormDialog 
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          product={selectedProduct}
          onSuccess={handleProductUpdate}
        />
      )}
    </MainLayout>
  );
};

interface ProductGridProps {
  products: ProductSubmission[];
  onEdit: (product: ProductSubmission) => void;
  onDelete: (product: ProductSubmission) => void;
  onSubmitDraft?: (productId: string) => void;
  readOnly?: boolean;
  showRejectionReason?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onEdit, 
  onDelete, 
  onSubmitDraft,
  readOnly = false,
  showRejectionReason = false
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ErrorBoundary key={product.id}>
          <Card className="overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <StatusBadge status={product.status} />
              </div>
            </div>
            <CardHeader>
              <h3 className="font-medium truncate">{product.title}</h3>
              <p className="text-sm text-gray-500">${product.price?.toFixed(2)}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              
              {showRejectionReason && product.rejection_reason && (
                <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-xs font-medium text-red-800">Reason for rejection:</p>
                  <p className="text-xs text-red-600">{product.rejection_reason}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {!readOnly && (
                <div className="flex space-x-2">
                  {product.status === 'draft' && onSubmitDraft && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onSubmitDraft(product.id)}
                    >
                      Submit
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        Edit
                      </DropdownMenuItem>
                      
                      {/* Only allow deletion of non-published products */}
                      {product.status !== 'published' && (
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => onDelete(product)}
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </CardFooter>
          </Card>
        </ErrorBoundary>
      ))}
    </div>
  );
};

export default MyProductsPage;
