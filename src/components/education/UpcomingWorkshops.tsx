
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Workshop {
  id: string; // Changed from number to string to match the Workshop interface in workshopService.ts
  name: string;
  date: string;
  location: string;
  spots?: number;
}

interface UpcomingWorkshopsProps {
  workshops: Workshop[];
  showAllWorkshops?: boolean;
}

const UpcomingWorkshops = ({ workshops, showAllWorkshops = false }: UpcomingWorkshopsProps) => {
  const displayedWorkshops = showAllWorkshops ? workshops : workshops.slice(0, 3);

  return (
    <section className={showAllWorkshops ? "" : "mb-12"}>
      {!showAllWorkshops && <h2 className="emerge-heading text-2xl mb-6">Upcoming Workshops</h2>}
      <div className="bg-emerge-cream p-6">
        <div className="space-y-4">
          {displayedWorkshops.map(workshop => (
            <div key={workshop.id} className="flex justify-between items-center p-3 bg-white">
              <div>
                <h3 className="font-medium">{workshop.name}</h3>
                <p className="text-gray-600 text-sm">
                  {workshop.date} • {workshop.location}
                  {workshop.spots && (
                    <span className="ml-2 text-emerge-gold">
                      {workshop.spots} spots left
                    </span>
                  )}
                </p>
              </div>
              <Link to={`/education/workshop/${workshop.id}`}>
                <Button variant="outline" className="bg-emerge-gold text-white hover:bg-emerge-darkGold">
                  Register
                </Button>
              </Link>
            </div>
          ))}
        </div>
        {!showAllWorkshops && (
          <div className="mt-6 text-center">
            <Link to="/workshops" className="emerge-button-primary">
              View All Workshops
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingWorkshops;
