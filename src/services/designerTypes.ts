
export type CreatorCategory = 
  | 'fashion_designer'
  | 'interior_designer'
  | 'graphic_designer'
  | 'visual_artist'
  | 'photographer'
  | 'event_planner'
  | 'model'
  | 'creative_director';

export type DesignerSpecialty = 'apparel' | 'accessories' | 'footwear' | 'jewelry' | 'other';

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
