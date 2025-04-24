
import MainLayout from "../layouts/MainLayout";
import UpcomingWorkshops from "../components/education/UpcomingWorkshops";

const Workshops = () => {
  const workshops = [
    { 
      id: 1, 
      name: "Sustainable Dyeing Techniques", 
      date: "June 15-16, 2025", 
      location: "Addis Ababa",
      spots: 5
    },
    { 
      id: 2, 
      name: "Fashion Photography Masterclass", 
      date: "July 8, 2025", 
      location: "Online",
      spots: 15
    },
    { 
      id: 3, 
      name: "Pattern Making Workshop", 
      date: "August 22-23, 2025", 
      location: "Dire Dawa",
      spots: 8
    },
    { 
      id: 4, 
      name: "African Textile Innovation", 
      date: "September 5-6, 2025", 
      location: "Nairobi",
      spots: 12
    },
    { 
      id: 5, 
      name: "Digital Fashion Marketing", 
      date: "September 15, 2025", 
      location: "Online",
      spots: 20
    },
    { 
      id: 6, 
      name: "Sustainable Fashion Design", 
      date: "October 1-2, 2025", 
      location: "Lagos",
      spots: 10
    }
  ];

  return (
    <MainLayout>
      <div className="emerge-container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="emerge-heading text-4xl mb-8">Fashion Workshops</h1>
          <p className="text-lg text-gray-600 mb-12">
            Join our hands-on workshops led by industry experts. Learn practical skills, 
            network with fellow professionals, and take your fashion career to the next level.
          </p>
          <UpcomingWorkshops 
            workshops={workshops} 
            showAllWorkshops={true} 
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Workshops;
