
import React from 'react';
import { StatsCard } from "@/components/admin/StatsCard";
import { EventsSection } from "@/components/admin/EventsSection";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { CertificateManagement } from "@/components/admin/CertificateManagement"; // Corrected import
import AdminLayout from '@/layouts/AdminLayout';

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Users" value="1,234" change="+12%" />
          <StatsCard title="New Sign-ups" value="56" change="+8%" />
          <StatsCard title="Active Courses" value="18" change="+3%" />
          <StatsCard title="Revenue" value="$5,690" change="+15%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EventsSection />
          </div>
          <div>
            <CertificateManagement 
              certificate={{
                id: "cert-001",
                name: "Fashion Design Certificate",
                status: "active"
              }}
            />
          </div>
        </div>

        <PaymentsTable />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
