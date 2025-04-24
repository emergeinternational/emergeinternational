
import { Plus } from "lucide-react";

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
  return (
    <div>
      <div className="bg-emerge-cream p-4 rounded mb-5">
        <div className="flex justify-between items-center">
          <button className="flex items-center text-emerge-gold">
            <Plus className="w-4 h-4 mr-2" />
            <span>ADD NEW EVENT</span>
          </button>
          <button className="bg-emerge-gold px-6 py-1 text-black rounded">
            MANAGE
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white p-5 rounded shadow">
            <h3 className="font-medium mb-2">{event.name}</h3>
            <p className="text-gray-500 text-sm mb-3">Date: {event.date}</p>
            <p className="text-sm">Registrations: {event.registrations}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsSection;
