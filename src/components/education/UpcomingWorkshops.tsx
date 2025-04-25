
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface WorkshopDisplay {
  id: number | string;
  name: string;
  date: string;
  location: string;
  spots?: number;
}

interface UpcomingWorkshopsProps {
  workshops: WorkshopDisplay[];
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
        {!showAllWorkshops && workshops.length > 0 && (
          <div className="mt-6 text-center">
            <Link to="/workshops" className="emerge-button-primary">
              View All Workshops
            </Link>
          </div>
        )}
        {workshops.length === 0 && (
          <div className="text-center py-8">
            <p>No upcoming workshops available at this time.</p>
            <p className="text-sm text-gray-500 mt-2">Check back soon for new workshops!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingWorkshops;
