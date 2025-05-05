
import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { ProductSubmission } from "@/types/shopSubmission";
import { getPendingSubmissions, updateProductStatus } from "@/services/designerProductService";
import StatusBadge from "@/components/shop/StatusBadge";
import ErrorBoundary from "@/components/shop/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Search,
  UserCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ProductApprovalsPage: React.FC = () => {
  const { userRole, isLoading: authLoading } = useAuth();
  const [pendingProducts, setPendingProducts] = useState<ProductSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && (userRole === 'admin' || userRole === 'editor')) {
      fetchPendingSubmissions();
    }
  }, [userRole, authLoading]);

  const fetchPendingSubmissions = async () => {
    setIsLoading(true);
    const data = await getPendingSubmissions();
    setPendingProducts(data);
    setIsLoading(false);
  };

  const handleApprove = async (id: string) => {
    const success = await updateProductStatus(id, "published");
    if (success) {
      setPendingProducts(prev => prev.filter(product => product.id !== id));
      toast.success("Product approved and published");
    }
  };

  const handleReject = async () => {
    if (!selectedProduct) return;
    
    const success = await updateProductStatus(
      selectedProduct.id, 
      "rejected",
      rejectionReason
    );
    
    if (success) {
      setPendingProducts(prev => prev.filter(product => product.id !== selectedProduct.id));
      setSelectedProduct(null);
      setRejectionReason("");
      setIsRejectDialogOpen(false);
      toast.success("Product rejected");
    }
  };

  // If not an admin or editor, redirect to home
  if (!authLoading && !["admin", "editor"].includes(userRole || "")) {
    toast.error("You don't have permission to access this page");
    return <Navigate to="/" />;
  }

  const filteredProducts = pendingProducts.filter(product => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      product.title.toLowerCase().includes(searchLower) ||
      (product.description || "").toLowerCase().includes(searchLower) ||
      (product.profiles?.full_name || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Product Approvals</h1>
            <p className="text-sm text-gray-500">Review and approve pending product submissions</p>
          </div>
          
          <Button variant="outline" onClick={fetchPendingSubmissions}>
            Refresh
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by product title, description or designer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <ErrorBoundary>
          {isLoading ? (
            <div className="space-y-6">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <Skeleton className="h-48 w-full md:w-48" />
                    <div className="flex-1 p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6 mb-2" />
                      <Skeleton className="h-4 w-4/6" />
                      <div className="flex justify-end mt-4">
                        <Skeleton className="h-10 w-24 mr-2" />
                        <Skeleton className="h-10 w-24" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-6">
              {filteredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="h-48 w-full md:w-48 bg-gray-100 flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="mb-1">{product.title}</CardTitle>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <UserCircle className="h-4 w-4 mr-1" />
                            <span>
                              {product.profiles?.full_name || "Unknown Designer"}
                            </span>
                          </div>
                        </div>
                        
                        <StatusBadge status={product.status} />
                      </div>
                      
                      <p className="text-lg font-semibold mb-2">${product.price}</p>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {product.description || "No description provided"}
                      </p>
                      
                      {product.variations && product.variations.length > 0 && (
                        <>
                          <Separator className="my-2" />
                          <div className="text-sm mb-2">
                            <span className="font-medium">Variations:</span> {product.variations.length}
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {Array.from(new Set(product.variations.map(v => v.size))).filter(Boolean).map(size => (
                              <span key={`size-${size}`} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {size}
                              </span>
                            ))}
                            {Array.from(new Set(product.variations.map(v => v.color))).filter(Boolean).map(color => (
                              <span key={`color-${color}`} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {color}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => window.open(`/shop/product/${product.id}`, '_blank')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsRejectDialogOpen(true);
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button 
                          variant="default" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(product.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No pending approvals</h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2">
                {searchTerm 
                  ? "No products match your search criteria." 
                  : "There are no products waiting for approval at this time."}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </ErrorBoundary>
        
        {/* Rejection Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Product</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this product submission.
                This will be visible to the designer.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div>
                <h4 className="text-sm font-medium mb-1">Product:</h4>
                <p>{selectedProduct?.title}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Rejection Reason:</h4>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this product is being rejected..."
                  className="resize-none"
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Reject Submission
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ProductApprovalsPage;
