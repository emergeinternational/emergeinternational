
import AdminLayout from "../../layouts/AdminLayout";
import DesignersManager from "../../components/admin/designers/DesignersManager";
import { Toaster } from "@/components/ui/toaster";
import PageLock from "../../components/admin/PageLock";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DesignersPage = () => {
  const [pageLocked, setPageLocked] = useState(true);
  const { userRole } = useAuth();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Designers Management</h1>
          <p className="text-sm text-gray-500">
            Manage designer profiles and their associated products
          </p>
        </div>
        
        <PageLock 
          userRole={userRole} 
          pageId="designersPage" 
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
          <DesignersManager isLocked={pageLocked} />
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default DesignersPage;
