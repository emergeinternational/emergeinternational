
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from '@/layouts/AdminLayout';
import EventsSection from '@/components/admin/EventsSection';
import DiscountCodeManager from '@/components/admin/DiscountCodeManager';
import EventRegistrations from '@/components/admin/EventRegistrations';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Event } from "@/hooks/useEvents";
import { useEventForm } from '@/hooks/useEventForm';
import EventForm from '@/components/events/EventForm';
import { useEventsAdmin } from "@/hooks/useEvents";

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState('management');
  const { refetch } = useEventsAdmin();
  
  const {
    form,
    isDialogOpen,
    setIsDialogOpen,
    isEditMode,
    currentEvent,
    isSubmitting,
    onSubmit,
    handleCreateEvent,
    handleEditEvent
  } = useEventForm(() => refetch());

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Event Management</h1>
        
        <Tabs defaultValue="management" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="management">Event Management</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="discounts">Discount Codes</TabsTrigger>
          </TabsList>
          
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
          
          <TabsContent value="registrations" className="space-y-4">
            <EventRegistrations />
          </TabsContent>
          
          <TabsContent value="discounts" className="space-y-4">
            <DiscountCodeManager />
          </TabsContent>
        </Tabs>

        <EventForm 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          form={form}
          isEditMode={isEditMode}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          currentEvent={currentEvent}
        />
      </div>
    </AdminLayout>
  );
};

export default EventsPage;
