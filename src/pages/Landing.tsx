import MainLayout from "../layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center relative overflow-hidden">
        {/* Fashion Watermark */}
        <div className="absolute top-0 right-0 opacity-5 transform rotate-12 translate-x-1/4 -translate-y-1/4">
          <ShoppingBag 
            size={500} 
            className="text-emerge-gold/20" 
            strokeWidth={0.5} 
          />
        </div>

        <div className="emerge-container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="emerge-heading text-4xl md:text-6xl mb-6 relative">
              <span className="relative z-10">
                Welcome{userPreferences.country ? ` to ${userPreferences.country}` : ''} 
                <span className="block mt-2 text-emerge-gold text-4xl md:text-6xl whitespace-normal">Emerge International</span>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              A curated platform uniting African fashion talent - from designers 
              and models to photographers and industry experts. Experience innovative 
              fashion shows, collaborative workshops, and inspiring events.
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
              <div className="p-6 bg-emerge-cream rounded-lg shadow-sm">
                <h3 className="text-xl font-serif text-emerge-gold mb-2">Fashion Ecosystem</h3>
                <p className="text-gray-600">Uniting designers, models, photographers, and industry professionals in collaborative showcases</p>
              </div>
              
              <div className="p-6 bg-emerge-cream rounded-lg shadow-sm">
                <h3 className="text-xl font-serif text-emerge-gold mb-2">African Talent</h3>
                <p className="text-gray-600">Celebrating Africa's diverse fashion professionals through our innovative platform</p>
              </div>
              
              <div className="p-6 bg-emerge-cream rounded-lg shadow-sm">
                <h3 className="text-xl font-serif text-emerge-gold mb-2">Industry Growth</h3>
                <p className="text-gray-600">Nurturing the next generation of fashion professionals through mentorship and opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Landing;
