
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { getPendingSubmissions, updateProductStatus } from '@/services/designerProductService';
import { ProductSubmission } from '@/types/shopSubmission';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertCircle, Check, Loader2, Package, X } from 'lucide-react';
import StatusBadge from '@/components/shop/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ErrorBoundary from '@/components/shop/ErrorBoundary';

const ProductApprovalsPage: React.FC = () => {
  const [pendingProducts, setPendingProducts] = useState<ProductSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { userRole, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Check if user has admin or editor role
  const hasModeratorAccess = userRole === 'admin' || userRole === 'editor';
  
  useEffect(() => {
    // Check if user is authenticated and has admin/editor role
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error("Please log in to access this page");
        navigate('/login');
        return;
      }
      
      if (!hasModeratorAccess) {
        toast.error("You don't have permission to access this page");
        navigate('/shop');
        return;
      }
      
      // Fetch pending submissions
      fetchPendingSubmissions();
    }
  }, [isAuthenticated, userRole, authLoading, navigate, hasModeratorAccess]);
  
  const fetchPendingSubmissions = async () => {
    try {
      setIsLoading(true);
      const data = await getPendingSubmissions();
      setPendingProducts(data);
    } catch (error) {
      console.error("Failed to load pending submissions:", error);
      toast.error("Failed to load pending submissions");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApprove = async (productId: string) => {
    try {
      const success = await updateProductStatus(productId, 'published');
      if (success) {
        setPendingProducts(pendingProducts.filter(p => p.id !== productId));
        toast.success("Product approved and published");
      }
    } catch (error) {
      console.error("Failed to approve product:", error);
      toast.error("Failed to approve product");
    }
  };
  
  const openRejectDialog = (product: ProductSubmission) => {
    setSelectedProduct(product);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };
  
  const handleReject = async () => {
    if (!selectedProduct) return;
    
    try {
      const success = await updateProductStatus(
        selectedProduct.id,
        'rejected',
        rejectionReason || undefined
      );
      
      if (success) {
        setPendingProducts(pendingProducts.filter(p => p.id !== selectedProduct.id));
        setIsRejectDialogOpen(false);
        setSelectedProduct(null);
        toast.success("Product submission rejected");
      }
    } catch (error) {
      console.error("Failed to reject product:", error);
      toast.error("Failed to reject product");
    }
  };
  
  // Authentication loading state
  if (authLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Verifying your credentials...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  // Auth or role check failed - show a helpful message instead of redirecting immediately
  if (!isAuthenticated || !hasModeratorAccess) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
                <p className="mb-4">Only administrators and editors can access this page.</p>
                <Button onClick={() => navigate('/shop')}>Go to Shop</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Product Approval Dashboard</h1>
            <p className="text-gray-500">Review and manage pending product submissions</p>
          </div>
          
          <ErrorBoundary>
            <Card>
              <Tabs defaultValue="pending">
                <CardHeader className="pb-0">
                  <TabsList>
                    <TabsTrigger value="pending">
                      Pending Approval ({pendingProducts.length})
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <TabsContent value="pending">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p>Loading submissions...</p>
                      </div>
                    ) : pendingProducts.length === 0 ? (
                      <div className="text-center py-12">
                        <Check className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No pending submissions to review</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingProducts.map(product => (
                          <ErrorBoundary key={product.id}>
                            <Card>
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
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{product.title}</h3>
                                    <p className="text-sm text-gray-500">${product.price?.toFixed(2)}</p>
                                  </div>
                                </div>
                              </CardHeader>
                              
                              <CardContent>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                                
                                <div className="text-xs bg-gray-50 p-2 rounded">
                                  <p className="text-gray-600">
                                    <span className="font-medium">Designer:</span> {product.created_by}
                                  </p>
                                  <p className="text-gray-600">
                                    <span className="font-medium">Category:</span> {product.category || 'Not specified'}
                                  </p>
                                  <p className="text-gray-600">
                                    <span className="font-medium">Variations:</span> {product.variations?.length || 0}
                                  </p>
                                </div>
                              </CardContent>
                              
                              <CardFooter className="flex justify-between">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                  onClick={() => openRejectDialog(product)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                
                                <Button 
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApprove(product.id)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </CardFooter>
                            </Card>
                          </ErrorBoundary>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </ErrorBoundary>
          
          {/* Rejection dialog */}
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Product</DialogTitle>
                <DialogDescription>
                  Please provide a reason for rejecting this product submission.
                  The designer will see this feedback.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this product submission does not meet our requirements..."
                  className="mt-2"
                />
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject}>
                  Confirm Rejection
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
};

export default ProductApprovalsPage;
