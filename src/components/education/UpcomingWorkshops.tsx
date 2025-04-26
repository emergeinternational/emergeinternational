import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Users, ArrowRight, AlertTriangle } from "lucide-react";

interface WorkshopData {
  id: string;
  name: string;
  date: string;
  location: string;
  spots?: number;
  isUrlValid?: boolean;
}

interface UpcomingWorkshopsProps {
  workshops: WorkshopData[];
  showAllWorkshops: boolean;
}

const UpcomingWorkshops = ({ workshops, showAllWorkshops }: UpcomingWorkshopsProps) => {
  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        <h2 className="emerge-heading text-2xl">Upcoming Workshops</h2>
        {!showAllWorkshops && (
          <Button asChild variant="ghost" className="text-emerge-gold">
            <Link to="/workshops" className="flex items-center">
              View all workshops <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        )}
      </div>
      
      <div className="bg-emerge-cream p-6">
        <div className="space-y-4">
          {workshops.map(workshop => (
            <div key={workshop.id} className="bg-white p-5 border border-gray-200">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg">{workshop.name}</h3>
                  <span className="bg-emerge-gold/10 text-emerge-gold text-xs px-2 py-1 rounded">
                    {workshop.date}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600 text-sm mt-2">
                  <MapPin size={14} className="mr-1" /> 
                  <span>{workshop.location}</span>
                  
                  {workshop.spots !== undefined && workshop.spots > 0 && (
                    <div className="flex items-center ml-4">
                      <Users size={14} className="mr-1" /> 
                      <span>{workshop.spots} spots left</span>
                    </div>
                  )}
                </div>
                
                {workshop.isUrlValid === false && (
                  <div className="mt-2 mb-1 py-1.5 px-2 bg-emerge-gold/10 inline-flex items-center text-sm rounded">
                    <AlertTriangle size={14} className="text-emerge-gold mr-1.5 flex-shrink-0" />
                    <span className="text-gray-700">Workshop registration coming soon</span>
                  </div>
                )}
                
                <div className="mt-3 flex justify-end">
                  <Button asChild size="sm">
                    <Link to={`/workshops/${workshop.id}`}>
                      Workshop Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {workshops.length === 0 && (
            <div className="text-center py-8">
              <p>No upcoming workshops scheduled at this time.</p>
              <p className="text-gray-600 mt-2">Please check back soon for new workshops!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UpcomingWorkshops;
