import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AdminLayout from '@/layouts/AdminLayout';
import EventsSection from '@/components/admin/EventsSection';
import DiscountCodeManager from '@/components/admin/DiscountCodeManager';
import EventRegistrations from '@/components/admin/EventRegistrations';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEventForm } from '@/hooks/useEventForm';
import { useEventsAdmin } from "@/hooks/useEvents";
import { EventForm } from '@/components/events/EventForm';
import { PaymentInstructionsManager } from '@/components/admin/PaymentInstructionsManager';
import { QRCodeScanner } from '@/components/admin/QRCodeScanner';

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState('registrations');
  const { refetch } = useEventsAdmin();
  
  const eventFormProps = useEventForm(() => refetch());

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Event Management</h1>
        
        <Tabs 
          defaultValue="registrations" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-4"
        >
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="registrations" className="text-base font-medium">
              Registrations & Payments
            </TabsTrigger>
            <TabsTrigger value="management" className="text-base font-medium">
              Event Management
            </TabsTrigger>
            <TabsTrigger value="discounts" className="text-base font-medium">
              Discount Codes
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-base font-medium">
              Payment Settings
            </TabsTrigger>
            <TabsTrigger value="qr-scanner" className="text-base font-medium">
              Entry Scanner
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Registrations & Payments</CardTitle>
                <CardDescription>
                  Manage attendee registrations, approve payments, and manage QR code tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EventRegistrations />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="management" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Events & Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <EventsSection onCreateEvent={handleCreateEvent} onEditEvent={handleEditEvent} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="discounts" className="space-y-4">
            <DiscountCodeManager />
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentInstructionsManager />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="qr-scanner" className="space-y-4">
            <QRCodeScanner />
          </TabsContent>
        </Tabs>

        <EventForm {...eventFormProps} />
      </div>
    </AdminLayout>
  );
};

export default EventsPage;
