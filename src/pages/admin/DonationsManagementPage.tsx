
import AdminLayout from "../../layouts/AdminLayout";
import DonationsManager from "../../components/admin/donations/DonationsManager";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PageLock from "../../components/admin/PageLock";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DonationsManagementPage = () => {
  const [pageLocked, setPageLocked] = useState<boolean>(true);
  const { userRole } = useAuth();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Donations Management</h1>
          <p className="text-sm text-gray-500">
            Track donations, manage donors, and issue certificates
          </p>
        </div>

        <PageLock 
          userRole={userRole} 
          pageId="donationsPage" 
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
          <DonationsManager isLocked={pageLocked} />
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default DonationsManagementPage;
