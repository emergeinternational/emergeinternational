
import React, { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import CertificateManagement from "@/components/admin/CertificateManagement";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import CertificateSettings from "@/components/admin/CertificateSettings";

const CertificateAdminPage = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Certificate Management</h1>
          <Button 
            variant="default" 
            className="bg-emerge-gold hover:bg-emerge-gold/90"
            onClick={() => setShowSettings(true)}
          >
            <Award className="h-4 w-4 mr-2" />
            Certificate Settings
          </Button>
        </div>
        
        <CertificateManagement />
        
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetContent side="right" className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Certificate Settings</SheetTitle>
              <SheetDescription>
                Configure certificate requirements and appearance
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <CertificateSettings onClose={() => setShowSettings(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AdminLayout>
  );
};

export default CertificateAdminPage;
