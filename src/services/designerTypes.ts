
export type CreatorCategory = 
  | 'fashion_designer'
  | 'interior_designer'
  | 'graphic_designer'
  | 'visual_artist'
  | 'photographer'
  | 'event_planner'
  | 'model'
  | 'creative_director';

// Specialty types for each category
// FashionDesigner specialties
export type FashionDesignerSpecialty = 'apparel' | 'accessories' | 'footwear' | 'jewelry' | 'other';

// InteriorDesigner specialties
export type InteriorDesignerSpecialty = 'residential' | 'commercial' | 'hospitality' | 'other';

// GraphicDesigner specialties
export type GraphicDesignerSpecialty = 'branding' | 'digital' | 'print' | 'illustration' | 'other';

// VisualArtist specialties
export type VisualArtistSpecialty = 'painting' | 'sculpture' | 'digital_art' | 'mixed_media' | 'other';

// Photographer specialties
export type PhotographerSpecialty = 'portrait' | 'fashion' | 'event' | 'commercial' | 'other';

// EventPlanner specialties
export type EventPlannerSpecialty = 'weddings' | 'corporate' | 'social' | 'non_profit' | 'other';

// Model specialties
export type ModelSpecialty = 'runway' | 'commercial' | 'editorial' | 'fitness' | 'other';

// CreativeDirector specialties
export type CreativeDirectorSpecialty = 'fashion' | 'advertising' | 'brand' | 'art_direction' | 'other';

// Union type for all specialties
export type DesignerSpecialty =
  | FashionDesignerSpecialty
  | InteriorDesignerSpecialty
  | GraphicDesignerSpecialty
  | VisualArtistSpecialty
  | PhotographerSpecialty
  | EventPlannerSpecialty
  | ModelSpecialty
  | CreativeDirectorSpecialty;

export interface FeaturedProject {
  title: string;
  description?: string;
  image_url?: string;
  link?: string;
}

export interface Designer {
  id: string;
  full_name: string;
  email?: string;
  bio?: string;
  specialty: DesignerSpecialty;
  category: CreatorCategory;
  portfolio_url?: string;
  image_url?: string;
  location?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  featured: boolean;
  products?: string[];
  revenue?: number;
  sales_count?: number;
  created_at?: string;
  updated_at?: string;
  featured_project?: FeaturedProject | null;
  achievements?: string[];
  showcase_images?: string[];
}

// Helper function to get specialty options based on category
export const getSpecialtyOptions = (category: CreatorCategory): { value: string; label: string }[] => {
  switch (category) {
    case 'fashion_designer':
      return [
        { value: 'apparel', label: 'Apparel' },
        { value: 'accessories', label: 'Accessories' },
        { value: 'footwear', label: 'Footwear' },
        { value: 'jewelry', label: 'Jewelry' },
        { value: 'other', label: 'Other' }
      ];
    case 'interior_designer':
      return [
        { value: 'residential', label: 'Residential' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'hospitality', label: 'Hospitality' },
        { value: 'other', label: 'Other' }
      ];
    case 'graphic_designer':
      return [
        { value: 'branding', label: 'Branding' },
        { value: 'digital', label: 'Digital' },
        { value: 'print', label: 'Print' },
        { value: 'illustration', label: 'Illustration' },
        { value: 'other', label: 'Other' }
      ];
    case 'visual_artist':
      return [
        { value: 'painting', label: 'Painting' },
        { value: 'sculpture', label: 'Sculpture' },
        { value: 'digital_art', label: 'Digital Art' },
        { value: 'mixed_media', label: 'Mixed Media' },
        { value: 'other', label: 'Other' }
      ];
    case 'photographer':
      return [
        { value: 'portrait', label: 'Portrait' },
        { value: 'fashion', label: 'Fashion' },
        { value: 'event', label: 'Event' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'other', label: 'Other' }
      ];
    case 'event_planner':
      return [
        { value: 'weddings', label: 'Weddings' },
        { value: 'corporate', label: 'Corporate' },
        { value: 'social', label: 'Social Events' },
        { value: 'non_profit', label: 'Non-Profit Events' },
        { value: 'other', label: 'Other' }
      ];
    case 'model':
      return [
        { value: 'runway', label: 'Runway' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'editorial', label: 'Editorial' },
        { value: 'fitness', label: 'Fitness' },
        { value: 'other', label: 'Other' }
      ];
    case 'creative_director':
      return [
        { value: 'fashion', label: 'Fashion' },
        { value: 'advertising', label: 'Advertising' },
        { value: 'brand', label: 'Brand Development' },
        { value: 'art_direction', label: 'Art Direction' },
        { value: 'other', label: 'Other' }
      ];
    default:
      return [{ value: 'other', label: 'Other' }];
  }
};

// Helper function to get the appropriate specialty type based on category
export const getCategorySpecialty = (category: CreatorCategory, specialty: string): DesignerSpecialty => {
  // Simply return the specialty as the appropriate type since our union type will handle this
  return specialty as DesignerSpecialty;
};
