
import AdminLayout from "../../layouts/AdminLayout";
import ProductsManager from "../../components/admin/shop/ProductsManager";
import { Toaster } from "@/components/ui/toaster";
import PageLock from "../../components/admin/PageLock";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ProductsPage = () => {
  const [pageLocked, setPageLocked] = useState(true);
  const { userRole } = useAuth();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Products Management</h1>
          <p className="text-sm text-gray-500">
            Manage, create, and update product listings
          </p>
        </div>
        
        <PageLock 
          userRole={userRole} 
          pageId="productsPage" 
          onLockStatusChange={setPageLocked} 
        />
        
        {pageLocked && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              This page is currently locked. Only viewing is available.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow">
          <ProductsManager isLocked={pageLocked} />
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default ProductsPage;
