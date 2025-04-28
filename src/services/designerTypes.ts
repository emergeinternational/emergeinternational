
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
export const getSpecialtyOptions = (category: CreatorCategory): { value: DesignerSpecialty; label: string }[] => {
  const specialtyMap: Record<CreatorCategory, Array<{ value: DesignerSpecialty; label: string }>> = {
    fashion_designer: [
      { value: 'apparel' as DesignerSpecialty, label: 'Apparel' },
      { value: 'accessories' as DesignerSpecialty, label: 'Accessories' },
      { value: 'footwear' as DesignerSpecialty, label: 'Footwear' },
      { value: 'jewelry' as DesignerSpecialty, label: 'Jewelry' },
      { value: 'other' as DesignerSpecialty, label: 'Other' }
    ],
    interior_designer: [
      { value: 'residential' as DesignerSpecialty, label: 'Residential' },
      { value: 'commercial' as DesignerSpecialty, label: 'Commercial' },
      { value: 'hospitality' as DesignerSpecialty, label: 'Hospitality' },
      { value: 'other' as DesignerSpecialty, label: 'Other' }
    ],
    graphic_designer: [
      { value: 'branding' as DesignerSpecialty, label: 'Branding' },
      { value: 'digital' as DesignerSpecialty, label: 'Digital' },
      { value: 'print' as DesignerSpecialty, label: 'Print' },
      { value: 'illustration' as DesignerSpecialty, label: 'Illustration' },
      { value: 'other' as DesignerSpecialty, label: 'Other' }
    ],
    visual_artist: [
      { value: 'painting' as DesignerSpecialty, label: 'Painting' },
      { value: 'sculpture' as DesignerSpecialty, label: 'Sculpture' },
      { value: 'digital_art' as DesignerSpecialty, label: 'Digital Art' },
      { value: 'mixed_media' as DesignerSpecialty, label: 'Mixed Media' },
      { value: 'other' as DesignerSpecialty, label: 'Other' }
    ],
    photographer: [
      { value: 'portrait' as DesignerSpecialty, label: 'Portrait' },
      { value: 'fashion' as DesignerSpecialty, label: 'Fashion' },
      { value: 'event' as DesignerSpecialty, label: 'Event' },
      { value: 'commercial' as DesignerSpecialty, label: 'Commercial' },
      { value: 'other' as DesignerSpecialty, label: 'Other' }
    ],
    event_planner: [
      { value: 'weddings' as DesignerSpecialty, label: 'Weddings' },
      { value: 'corporate' as DesignerSpecialty, label: 'Corporate' },
      { value: 'social' as DesignerSpecialty, label: 'Social Events' },
      { value: 'non_profit' as DesignerSpecialty, label: 'Non-Profit Events' },
      { value: 'other' as DesignerSpecialty, label: 'Other' }
    ],
    model: [
      { value: 'runway' as DesignerSpecialty, label: 'Runway' },
      { value: 'commercial' as DesignerSpecialty, label: 'Commercial' },
      { value: 'editorial' as DesignerSpecialty, label: 'Editorial' },
      { value: 'fitness' as DesignerSpecialty, label: 'Fitness' },
      { value: 'other' as DesignerSpecialty, label: 'Other' }
    ],
    creative_director: [
      { value: 'fashion' as DesignerSpecialty, label: 'Fashion' },
      { value: 'advertising' as DesignerSpecialty, label: 'Advertising' },
      { value: 'brand' as DesignerSpecialty, label: 'Brand Development' },
      { value: 'art_direction' as DesignerSpecialty, label: 'Art Direction' },
      { value: 'other' as DesignerSpecialty, label: 'Other' }
    ]
  };

  return specialtyMap[category];
};
