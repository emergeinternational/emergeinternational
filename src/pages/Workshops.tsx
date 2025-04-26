
import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWorkshops, getArchivedWorkshops, Workshop } from "../services/workshopService";
import UpcomingWorkshops from "../components/education/UpcomingWorkshops";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

const Workshops = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingWorkshops, setUpcomingWorkshops] = useState<Workshop[]>([]);
  const [archivedWorkshops, setArchivedWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setIsLoading(true);
        const upcoming = await getWorkshops();
        const archived = await getArchivedWorkshops();
        
        setUpcomingWorkshops(upcoming);
        setArchivedWorkshops(archived);
      } catch (error) {
        console.error("Error fetching workshops data:", error);
        toast({
          title: "Error",
          description: "Failed to load workshops. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshops();
  }, [toast]);

  // Check if a URL is valid and not pointing to example.com or other placeholders
  const isValidUrl = (url?: string): boolean => {
    if (!url) return false;
    
    try {
      new URL(url);
      const lowercaseUrl = url.toLowerCase();
      return (
        !lowercaseUrl.includes('example.com') && 
        !lowercaseUrl.includes('placeholder') && 
        !lowercaseUrl.includes('localhost')
      );
    } catch (e) {
      return false;
    }
  };

  return (
    <MainLayout>
      <div className="emerge-container py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="emerge-heading text-4xl mb-8">Fashion Workshops</h1>
          <p className="text-lg text-gray-600 mb-12">
            Join our hands-on workshops led by industry experts. Learn practical skills, 
            network with fellow professionals, and take your fashion career to the next level.
          </p>
          
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 border-b w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger 
                value="upcoming"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-emerge-gold data-[state=active]:bg-transparent"
              >
                Upcoming Workshops
              </TabsTrigger>
              <TabsTrigger 
                value="archived"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-emerge-gold data-[state=active]:bg-transparent"
              >
                Past Workshops
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-pulse text-emerge-gold">Loading workshops...</div>
                </div>
              ) : upcomingWorkshops.length > 0 ? (
                <UpcomingWorkshops 
                  workshops={upcomingWorkshops.map(w => ({
                    id: w.id, // Using the string ID directly
                    name: w.name,
                    date: new Date(w.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }),
                    location: w.location,
                    spots: w.spots,
                    isUrlValid: isValidUrl(w.registration_link)
                  }))} 
                  showAllWorkshops={true}
                />
              ) : (
                <div className="text-center py-12 bg-emerge-cream p-6">
                  <p className="text-lg">No upcoming workshops scheduled at this time.</p>
                  <p className="text-gray-600 mt-2">Please check back soon for new workshops!</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="archived" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-pulse text-emerge-gold">Loading archived workshops...</div>
                </div>
              ) : archivedWorkshops.length > 0 ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-medium mb-4">Past Workshops</h2>
                  {archivedWorkshops.map(workshop => (
                    <div key={workshop.id} className="bg-white p-5 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{workshop.name}</h3>
                          <p className="text-gray-600 text-sm">
                            {new Date(workshop.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })} • {workshop.location}
                          </p>
                          {workshop.description && (
                            <p className="mt-2 text-gray-700">{workshop.description}</p>
                          )}
                          {!isValidUrl(workshop.registration_link) && workshop.registration_link && (
                            <div className="mt-2 mb-1 py-1.5 px-2 bg-emerge-gold/10 inline-flex items-center text-sm rounded">
                              <AlertTriangle size={14} className="text-emerge-gold mr-1.5 flex-shrink-0" />
                              <span className="text-gray-700">Workshop materials coming soon</span>
                            </div>
                          )}
                        </div>
                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                          Past Event
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-emerge-cream p-6">
                  <p className="text-lg">No archived workshops available.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Workshops;
