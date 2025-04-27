
import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import CertificateManagement from "@/components/admin/CertificateManagement";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";

const CertificateAdminPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Certificate Management</h1>
          <Button variant="default" className="bg-emerge-gold hover:bg-emerge-gold/90">
            <Award className="h-4 w-4 mr-2" />
            Certificate Settings
          </Button>
        </div>
        
        <CertificateManagement />
      </div>
    </AdminLayout>
  );
};

export default CertificateAdminPage;
