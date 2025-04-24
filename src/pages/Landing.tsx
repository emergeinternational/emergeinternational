
import MainLayout from "../layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center">
        <div className="emerge-container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="emerge-heading text-5xl md:text-6xl mb-6">
              Welcome{userPreferences.country ? ` from ${userPreferences.country}` : ''} to Emerge International
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Discover a curated collection of fashion that bridges cultures and celebrates creativity. 
              With a special focus on Africa's vibrant influence, we bring you worldwide design excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/shop")}
                className="emerge-button-primary flex items-center"
              >
                Start Shopping
                <ArrowRight className="ml-2" />
              </Button>
              
              <Button
                onClick={() => navigate("/education")}
                variant="outline"
                className="emerge-button-secondary"
              >
                Explore Our Academy
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="p-6 bg-emerge-cream rounded-lg">
                <h3 className="text-xl font-serif text-emerge-gold mb-2">Global Fashion</h3>
                <p className="text-gray-600">Curated collections from talented designers worldwide</p>
              </div>
              
              <div className="p-6 bg-emerge-cream rounded-lg">
                <h3 className="text-xl font-serif text-emerge-gold mb-2">African Heritage</h3>
                <p className="text-gray-600">Celebrating Africa's rich fashion influence and creativity</p>
              </div>
              
              <div className="p-6 bg-emerge-cream rounded-lg">
                <h3 className="text-xl font-serif text-emerge-gold mb-2">Sustainable Future</h3>
                <p className="text-gray-600">Committed to ethical fashion and responsible practices</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Landing;
