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
                <span className="text-2xl md:text-3xl">Welcome To</span> {userPreferences.country ? `${userPreferences.country}` : ''}
                <span className="block mt-2 text-emerge-gold text-4xl md:text-6xl whitespace-normal">Emerge International</span>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              A global stage for fashion, music, and art—powered by The Black Traveler. We curate experiences that connect 
              continents and cultures, spotlighting a diverse group of designers and creatives as catalysts in the global 
              creative movement. From Lagos to London, New York City to Addis our platform celebrates innovation, 
              identity, and storytelling that transcends borders.

              <span className="block mt-4 font-semibold text-emerge-gold">
                Rooted in passion for fashion and arts. Reverberating worldwide.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/shop")}
                className="emerge-button-primary flex items-center"
              >
                Explore Collections
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
                <h3 className="text-xl font-serif text-emerge-gold mb-2">Cultural Expression</h3>
                <p className="text-gray-600">Elevating fashion as a powerful medium of cultural storytelling and global dialogue</p>
              </div>
              
              <div className="p-6 bg-emerge-cream rounded-lg shadow-sm">
                <h3 className="text-xl font-serif text-emerge-gold mb-2">Creative Ecosystem</h3>
                <p className="text-gray-600">Connecting designers, models, photographers, and industry professionals across the world</p>
              </div>
              
              <div className="p-6 bg-emerge-cream rounded-lg shadow-sm">
                <h3 className="text-xl font-serif text-emerge-gold mb-2">Global Visibility</h3>
                <p className="text-gray-600">Providing a world-class platform that showcases the depth and innovation of industry talent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Landing;
