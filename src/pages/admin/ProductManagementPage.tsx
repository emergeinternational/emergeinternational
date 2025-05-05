
import React, { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import ProductsManager from "../../components/shop/ProductsManager";
import { Toaster } from "@/components/ui/toaster";
import PageLock from "../../components/admin/PageLock";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ProductManagementPage = () => {
  const [pageLocked, setPageLocked] = useState(true);
  const { userRole } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleClearCache = () => {
    setRefreshTrigger(prev => prev + 1);
    localStorage.removeItem('productCache');
    sessionStorage.removeItem('productCache');
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Product Management</h1>
            <p className="text-sm text-gray-500">
              Create, edit and manage product listings
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleClearCache}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Clear Cache
            </Button>
          </div>
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
          <ProductsManager isLocked={pageLocked} key={refreshTrigger} />
        </div>
      </div>
      
      <Toaster />
    </AdminLayout>
  );
};

export default ProductManagementPage;
