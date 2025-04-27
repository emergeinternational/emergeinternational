
import React from 'react';
import { Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Event } from '@/hooks/useEvents';
import EventFormFields from './EventFormFields';
import TicketTypeFormFields from './TicketTypeFormFields';

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  isEditMode: boolean;
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
  currentEvent: Event | null;
}

const EventForm: React.FC<EventFormProps> = ({
  open,
  onOpenChange,
  form,
  isEditMode,
  onSubmit,
  isSubmitting,
  currentEvent
}) => {
  const handleDialogClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <EventFormFields form={form} />
            <TicketTypeFormFields form={form} isEditMode={isEditMode} />
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update Event" : "Create Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
