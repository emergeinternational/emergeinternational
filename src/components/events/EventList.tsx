
import React from 'react';
import { Event } from '@/hooks/useEvents';
import { CalendarPlus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';

interface EventListProps {
  events: Event[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onAddEvent: () => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  isLoading,
  error,
  onAddEvent,
  onEditEvent,
  onDeleteEvent
}) => {
  const { hasRole } = useAuth();
  const canEdit = hasRole(['admin', 'editor']);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading events. Please try again.</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 mb-4">No events found</p>
        {canEdit && <p className="text-sm">Add your first event using the button above.</p>}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tickets</TableHead>
            {canEdit && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">
                <div>
                  {event.name}
                  {event.is_featured && (
                    <Badge variant="secondary" className="ml-2">Featured</Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {event.description}
                </div>
              </TableCell>
              <TableCell>
                {new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </TableCell>
              <TableCell>{event.location || "—"}</TableCell>
              <TableCell>
                {new Date(event.date) > new Date() ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                    Upcoming
                  </Badge>
                ) : (
                  <Badge variant="secondary">Past</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{event.ticket_types?.length || 0} types</span>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="tickets">
                      <AccordionTrigger className="py-1 text-xs text-gray-500">
                        View tickets
                      </AccordionTrigger>
                      <AccordionContent>
                        {event.ticket_types && event.ticket_types.length > 0 ? (
                          <div className="space-y-2">
                            {event.ticket_types.map((ticket) => (
                              <div key={ticket.id} className="border-b pb-1 last:border-0">
                                <div className="flex justify-between text-sm">
                                  <span>{ticket.name}</span>
                                  <span className="font-medium">{event.currency_code} {ticket.price}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {ticket.tickets_sold || 0}/{ticket.quantity} sold
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 py-1">No tickets defined</div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TableCell>
              {canEdit && (
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onEditEvent(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => onDeleteEvent(event)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EventList;
