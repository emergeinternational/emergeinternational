
export type CreatorCategory = 
  | 'fashion_designer'
  | 'interior_designer'
  | 'graphic_designer'
  | 'visual_artist'
  | 'photographer'
  | 'event_planner'
  | 'model'
  | 'creative_director';

export type DesignerSpecialty = {
  fashion_designer: 'apparel' | 'accessories' | 'footwear' | 'jewelry' | 'other';
  interior_designer: 'residential' | 'commercial' | 'hospitality' | 'other';
  graphic_designer: 'branding' | 'digital' | 'print' | 'illustration' | 'other';
  visual_artist: 'painting' | 'sculpture' | 'digital_art' | 'mixed_media' | 'other';
  photographer: 'portrait' | 'fashion' | 'event' | 'commercial' | 'other';
  event_planner: 'weddings' | 'corporate' | 'social' | 'non_profit' | 'other';
  model: 'runway' | 'commercial' | 'editorial' | 'fitness' | 'other';
  creative_director: 'fashion' | 'advertising' | 'brand' | 'art_direction' | 'other';
}[CreatorCategory];

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
  const specialtyMap: Record<CreatorCategory, Array<{ value: string; label: string }>> = {
    fashion_designer: [
      { value: 'apparel', label: 'Apparel' },
      { value: 'accessories', label: 'Accessories' },
      { value: 'footwear', label: 'Footwear' },
      { value: 'jewelry', label: 'Jewelry' },
      { value: 'other', label: 'Other' }
    ],
    interior_designer: [
      { value: 'residential', label: 'Residential' },
      { value: 'commercial', label: 'Commercial' },
      { value: 'hospitality', label: 'Hospitality' },
      { value: 'other', label: 'Other' }
    ],
    graphic_designer: [
      { value: 'branding', label: 'Branding' },
      { value: 'digital', label: 'Digital' },
      { value: 'print', label: 'Print' },
      { value: 'illustration', label: 'Illustration' },
      { value: 'other', label: 'Other' }
    ],
    visual_artist: [
      { value: 'painting', label: 'Painting' },
      { value: 'sculpture', label: 'Sculpture' },
      { value: 'digital_art', label: 'Digital Art' },
      { value: 'mixed_media', label: 'Mixed Media' },
      { value: 'other', label: 'Other' }
    ],
    photographer: [
      { value: 'portrait', label: 'Portrait' },
      { value: 'fashion', label: 'Fashion' },
      { value: 'event', label: 'Event' },
      { value: 'commercial', label: 'Commercial' },
      { value: 'other', label: 'Other' }
    ],
    event_planner: [
      { value: 'weddings', label: 'Weddings' },
      { value: 'corporate', label: 'Corporate' },
      { value: 'social', label: 'Social Events' },
      { value: 'non_profit', label: 'Non-Profit Events' },
      { value: 'other', label: 'Other' }
    ],
    model: [
      { value: 'runway', label: 'Runway' },
      { value: 'commercial', label: 'Commercial' },
      { value: 'editorial', label: 'Editorial' },
      { value: 'fitness', label: 'Fitness' },
      { value: 'other', label: 'Other' }
    ],
    creative_director: [
      { value: 'fashion', label: 'Fashion' },
      { value: 'advertising', label: 'Advertising' },
      { value: 'brand', label: 'Brand Development' },
      { value: 'art_direction', label: 'Art Direction' },
      { value: 'other', label: 'Other' }
    ]
  };

  return specialtyMap[category];
};

