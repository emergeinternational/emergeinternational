import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StatsCard from "@/components/admin/StatsCard";
import CertificateManagement from "@/components/admin/CertificateManagement";
import EventsSection from "@/components/admin/EventsSection";
import { useAuth } from "@/hooks/useAuth";
import PaymentsTable from "@/components/admin/PaymentsTable";

const Dashboard = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  const events = [
    { id: 1, name: "Fashion Week 2025", date: "Apr 15, 2025", registrations: 120 },
    { id: 2, name: "Design Workshop", date: "May 20, 2025", registrations: 45 },
  ];
  
  const stats = [
    { title: "Total Users", value: "2,845", change: "+12% from last month" },
    { title: "Active Courses", value: "24", change: "+2 from last month" },
    { title: "Revenue", value: "$12,428", change: "+18% from last month" },
    { title: "New Students", value: "642", change: "+8% from last month" },
  ];
  
  const payments = [
    {
      id: "pay_123",
      user: "John Doe",
      amount: 250,
      date: "2025-03-15",
      status: "completed"
    },
    {
      id: "pay_124",
      user: "Jane Smith",
      amount: 120,
      date: "2025-03-16",
      status: "pending"
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <StatsCard 
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <EventsSection events={events} />
          </TabsContent>
          
          <TabsContent value="certificates">
            {hasRole(['admin']) && <CertificateManagement />}
          </TabsContent>
          
          <TabsContent value="payments">
            <PaymentsTable 
              payments={payments}
              onActivate={(id) => console.log(`Activate payment ${id}`)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
