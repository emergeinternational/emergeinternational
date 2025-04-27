
import React, { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EventsSection from "@/components/admin/EventsSection";
import { QRCodeScanner } from "@/components/admin/QRCodeScanner";
import EventRegistrations from "@/components/admin/EventRegistrations";

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Event Management</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <EventsSection />
          </TabsContent>
          
          <TabsContent value="registrations">
            <EventRegistrations />
          </TabsContent>
          
          <TabsContent value="scanner">
            <div className="max-w-md mx-auto">
              <QRCodeScanner />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EventsPage;
