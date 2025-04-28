
import React from "react";
import { AdminLayout } from "@/layouts/AdminLayout"; 
import { TalentSyncDashboard } from "@/components/admin/TalentSyncDashboard";
import { Card } from "@/components/ui/card";

export default function TalentSyncPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Talent Sync Management</h1>
        
        <Card className="p-6">
          <TalentSyncDashboard />
        </Card>
      </div>
    </AdminLayout>
  );
}
