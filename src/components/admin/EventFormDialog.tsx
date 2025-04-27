
import React from 'react';
import EventForm from '@/components/events/EventForm';
import { useEventForm } from '@/hooks/useEventForm';
import { useEventsAdmin } from "@/hooks/useEvents";

const EventFormDialog: React.FC = () => {
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
  } = useEventForm(() => {
    // Ensure we refetch after successful form submission
    console.log("Refetching events after form submission");
    refetch();
  });

  return (
    <EventForm 
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      form={form}
      isEditMode={isEditMode}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      currentEvent={currentEvent}
    />
  );
};

export default EventFormDialog;
