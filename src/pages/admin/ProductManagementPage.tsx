
import React, { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import ProductsManager from "../../components/admin/shop/ProductsManager";
import { Toaster } from "@/components/ui/toaster";
import PageLock from "../../components/admin/PageLock";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ProductFormDialog from "@/components/admin/shop/ProductFormDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ProductManagementPage = () => {
  const [pageLocked, setPageLocked] = useState(true);
  const { userRole } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
          
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
            disabled={pageLocked}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
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
      
      <ProductFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        product={null}
        onSuccess={() => {
          setIsAddDialogOpen(false);
        }}
      />
      
      <Toaster />
    </AdminLayout>
  );
};

export default ProductManagementPage;
