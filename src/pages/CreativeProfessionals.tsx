
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Designer } from "@/services/designerTypes";
import MainLayout from "../layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/utils/usePageTitle";

const CreativeProfessionals = () => {
  usePageTitle("Creative Professionals 🌍 | Emerge International");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: designers, isLoading } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designers')
        .select('*');
      if (error) throw error;
      return data as Designer[];
    },
  });

  const categories = [
    { value: "all", label: "All Professionals" },
    { value: "fashion_designer", label: "Fashion Designers" },
    { value: "interior_designer", label: "Interior Designers" },
    { value: "graphic_designer", label: "Graphic Designers" },
    { value: "visual_artist", label: "Visual Artists" },
    { value: "photographer", label: "Photographers" },
    { value: "event_planner", label: "Event Planners" },
    { value: "model", label: "Models" },
    { value: "creative_director", label: "Creative Directors" },
  ];

  const filteredDesigners = designers?.filter(designer => 
    selectedCategory === "all" || designer.category === selectedCategory
  );

  const featuredDesigners = designers?.filter(designer => designer.featured) || [];

  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">Creative Professionals</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover the talented creative professionals who are part of the Emerge International community, 
            from fashion designers and models to photographers and visual artists.
          </p>
        </div>

        {featuredDesigners.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif font-semibold mb-6">Featured Professionals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDesigners.map((designer) => (
                <FeaturedDesignerCard key={designer.id} designer={designer} />
              ))}
            </div>
          </div>
        )}

        <div>
          <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
            <div className="flex justify-center mb-8">
              <TabsList className="overflow-x-auto flex p-1 max-w-full">
                {categories.map((category) => (
                  <TabsTrigger key={category.value} value={category.value} className="whitespace-nowrap">
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {categories.map((category) => (
              <TabsContent key={category.value} value={category.value} className="mt-0">
                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading creative professionals...</p>
                  </div>
                ) : filteredDesigners?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No creative professionals found in this category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDesigners?.map((designer) => (
                      <DesignerCard key={designer.id} designer={designer} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

interface DesignerCardProps {
  designer: Designer;
}

const DesignerCard = ({ designer }: DesignerCardProps) => {
  const getCategoryLabel = (category: string): string => {
    const categories: Record<string, string> = {
      fashion_designer: "Fashion Designer",
      interior_designer: "Interior Designer",
      graphic_designer: "Graphic Designer",
      visual_artist: "Visual Artist",
      photographer: "Photographer",
      event_planner: "Event Planner",
      model: "Model",
      creative_director: "Creative Director",
    };
    return categories[category] || category;
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 overflow-hidden">
        {designer.image_url ? (
          <img 
            src={designer.image_url} 
            alt={designer.full_name}
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium">{designer.full_name}</h3>
        <div className="flex items-center my-2">
          <Badge variant="outline" className="mr-2">{getCategoryLabel(designer.category)}</Badge>
          <Badge className="capitalize">{designer.specialty}</Badge>
        </div>
        {designer.bio && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {designer.bio}
          </p>
        )}
        <div className="mt-3 flex items-center space-x-3">
          {designer.social_media?.instagram && (
            <a 
              href={`https://instagram.com/${designer.social_media.instagram}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-800"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          )}
          {designer.portfolio_url && (
            <a 
              href={designer.portfolio_url} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
              aria-label="Portfolio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          )}
          {designer.social_media?.website && (
            <a 
              href={designer.social_media.website} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800"
              aria-label="Website"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const FeaturedDesignerCard = ({ designer }: DesignerCardProps) => {
  const getCategoryLabel = (category: string): string => {
    const categories: Record<string, string> = {
      fashion_designer: "Fashion Designer",
      interior_designer: "Interior Designer",
      graphic_designer: "Graphic Designer",
      visual_artist: "Visual Artist",
      photographer: "Photographer",
      event_planner: "Event Planner",
      model: "Model",
      creative_director: "Creative Director",
    };
    return categories[category] || category;
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 border-2 border-emerge-gold">
      <div className="h-64 overflow-hidden">
        {designer.image_url ? (
          <img 
            src={designer.image_url} 
            alt={designer.full_name}
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-medium">{designer.full_name}</h3>
          <Badge className="bg-emerge-gold hover:bg-emerge-gold text-white">Featured</Badge>
        </div>
        <div className="flex items-center mb-3">
          <Badge variant="outline" className="mr-2">{getCategoryLabel(designer.category)}</Badge>
          <Badge className="capitalize">{designer.specialty}</Badge>
        </div>
        {designer.bio && (
          <p className="text-gray-600 mt-3 line-clamp-3">
            {designer.bio}
          </p>
        )}
        {designer.featured_project && (
          <div className="mt-4 bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-sm">Featured Project: {designer.featured_project.title}</h4>
            {designer.featured_project.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{designer.featured_project.description}</p>
            )}
          </div>
        )}
        <div className="mt-4 flex items-center space-x-3">
          {designer.social_media?.instagram && (
            <a 
              href={`https://instagram.com/${designer.social_media.instagram}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-800"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          )}
          {designer.portfolio_url && (
            <a 
              href={designer.portfolio_url} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
              aria-label="Portfolio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          )}
          {designer.social_media?.website && (
            <a 
              href={designer.social_media.website} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800"
              aria-label="Website"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeProfessionals;
