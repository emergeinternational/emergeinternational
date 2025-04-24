
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Event {
  id: number;
  name: string;
  date: string;
  registrations: number;
}

interface EventsSectionProps {
  events: Event[];
}

const EventsSection = ({ events }: EventsSectionProps) => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const canEdit = hasRole(['admin', 'editor']);
  const canDelete = hasRole(['admin']);

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedEvent) return;

    // In a real app, you'd delete the event from Supabase
    toast({
      title: "Event Deleted",
      description: `${selectedEvent.name} has been deleted successfully.`
    });
    setIsDeleteDialogOpen(false);
  };

  const handleUpdateEvent = () => {
    if (!selectedEvent) return;

    // In a real app, you'd update the event in Supabase
    toast({
      title: "Event Updated",
      description: `${selectedEvent.name} has been updated successfully.`
    });
  };

  return (
    <div>
      <div className="bg-emerge-cream p-4 rounded mb-5">
        <div className="flex justify-between items-center">
          <Dialog>
            <DialogTrigger asChild>
              <button 
                className="flex items-center text-emerge-gold"
                disabled={!canEdit}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span>ADD NEW EVENT</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name">Event Name</label>
                  <input 
                    id="name" 
                    className="border p-2 rounded-md" 
                    placeholder="Enter event name"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="date">Event Date</label>
                  <input 
                    id="date" 
                    className="border p-2 rounded-md" 
                    placeholder="E.g. June 12, 2025"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => {
                  toast({
                    title: "Event Added",
                    description: "The event has been added successfully."
                  });
                }}>
                  Add Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button disabled={!canEdit} className="bg-emerge-gold px-6 py-1 text-black rounded hover:bg-yellow-600">
            MANAGE
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white p-5 rounded shadow">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium mb-2">{event.name}</h3>
                <p className="text-gray-500 text-sm mb-3">Date: {event.date}</p>
                <p className="text-sm">Registrations: {event.registrations}</p>
              </div>
              {canEdit && (
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditClick(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label htmlFor="edit-name">Event Name</label>
                          <input
                            id="edit-name"
                            className="border p-2 rounded-md"
                            defaultValue={selectedEvent?.name}
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="edit-date">Event Date</label>
                          <input
                            id="edit-date"
                            className="border p-2 rounded-md"
                            defaultValue={selectedEvent?.date}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" onClick={handleUpdateEvent}>
                            Update Event
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {canDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteClick(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{selectedEvent?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventsSection;
