
import React, { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { ShopProduct } from "@/types/shop";
import { ProductSubmission } from "@/types/shopSubmission";
import { 
  getDesignerProducts,
  deleteDesignerProduct,
  submitDraftForApproval
} from "@/services/designerProductService";
import ProductFormDialog from "@/components/shop/ProductFormDialog";
import StatusBadge from "@/components/shop/StatusBadge";
import ErrorBoundary from "@/components/shop/ErrorBoundary";
import { toast } from "sonner";
import { 
  Trash2, 
  Edit, 
  Plus, 
  Send, 
  Loader2,
  Eye,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import NotificationsDropdown from "@/components/shop/NotificationsDropdown";

const MyProductsPage: React.FC = () => {
  const { user, userRole, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<ProductSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (isAuthenticated && userRole) {
      fetchProducts();
    }
  }, [isAuthenticated, userRole]);

  const fetchProducts = async () => {
    setIsLoading(true);
    const data = await getDesignerProducts();
    setProducts(data);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    const success = await deleteDesignerProduct(productToDelete);
    if (success) {
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productToDelete)
      );
      setProductToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSubmitForApproval = async (productId: string) => {
    const success = await submitDraftForApproval(productId);
    if (success) {
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, status: "pending" } 
            : product
        )
      );
    }
  };

  // If not a designer, redirect to home
  if (!authLoading && (!isAuthenticated || (userRole !== 'designer' && userRole !== 'admin'))) {
    toast.error("You don't have permission to access this page");
    return <Navigate to="/" />;
  }

  const filteredProducts = products.filter(product => {
    // Apply status filter
    if (filter !== "all" && product.status !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm && !product.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const dateA = new Date(a.created_at || "").getTime();
    const dateB = new Date(b.created_at || "").getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Group products by status for better organization
  const groupedProducts = sortedProducts.reduce((acc, product) => {
    if (!acc[product.status]) {
      acc[product.status] = [];
    }
    acc[product.status].push(product);
    return acc;
  }, {} as Record<string, ProductSubmission[]>);
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Products</h1>
            <p className="text-gray-600">Manage your product listings</p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <NotificationsDropdown />
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  {filter === "all" ? "All Status" : filter === "draft" ? "Drafts" : 
                   filter === "pending" ? "Pending" : filter === "published" ? "Published" : "Rejected"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("draft")}>
                  Drafts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("pending")}>
                  Pending Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("published")}>
                  Published
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("rejected")}>
                  Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              title={sortOrder === "desc" ? "Newest first" : "Oldest first"}
            >
              {sortOrder === "desc" ? (
                <SortDesc className="h-4 w-4" />
              ) : (
                <SortAsc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        <ErrorBoundary>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative h-40 bg-gray-100">
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
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={product.status} />
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle>{product.title}</CardTitle>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold">${product.price}</span>
                      {product.collection && (
                        <Badge variant="outline" className="ml-2">
                          {product.collection.title}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {product.description || "No description provided"}
                    </p>
                    
                    {product.status === "rejected" && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <p className="font-semibold text-red-700">Rejection reason:</p>
                        <p className="text-red-600">{product.rejection_reason || "No reason provided"}</p>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/shop/product/${product.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      
                      {product.status !== "published" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      {product.status === "draft" && (
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
                          onClick={() => handleSubmitForApproval(product.id)}
                        >
                          <Send className="h-4 w-4 mr-1" /> Submit
                        </Button>
                      )}
                      
                      {product.status !== "published" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setProductToDelete(product.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No products found</h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2">
                {filter !== "all"
                  ? `You don't have any ${filter} products.`
                  : searchTerm
                  ? "No products match your search."
                  : "You haven't created any products yet. Click 'Add New Product' to get started."}
              </p>
              <Button
                className="mt-4 bg-emerge-gold text-black hover:bg-emerge-gold/80"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </div>
          )}
        </ErrorBoundary>
        
        {/* Product Form Dialogs */}
        <ProductFormDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          product={null}
          onSuccess={(newProduct) => {
            if (newProduct) {
              setProducts(prev => [newProduct as ProductSubmission, ...prev]);
            }
            setIsAddDialogOpen(false);
          }}
          submitType="draft"
        />
        
        {selectedProduct && (
          <ProductFormDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            product={selectedProduct}
            onSuccess={(updatedProduct) => {
              if (updatedProduct) {
                setProducts(prev => prev.map(product => 
                  product.id === updatedProduct.id ? updatedProduct as ProductSubmission : product
                ));
              }
              setSelectedProduct(null);
              setIsEditDialogOpen(false);
            }}
            submitType="draft"
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default MyProductsPage;
