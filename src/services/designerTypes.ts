
// Designer Types
export type CreatorCategory = 
  | 'fashion_designer'
  | 'graphic_designer'
  | 'interior_designer'
  | 'photographer'
  | 'model'
  | 'visual_artist'
  | 'event_planner'
  | 'creative_director';

// Change to string-based specialties
export type DesignerSpecialty = string; 

export type SocialMedia = {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
};

export type FeaturedProject = {
  title: string;
  description: string;
  image_url: string;
  link?: string;
};

export type Designer = {
  id: string;
  full_name: string;
  email?: string;
  bio?: string;
  specialty: DesignerSpecialty;
  category: CreatorCategory;
  portfolio_url?: string;
  location?: string;
  social_media?: SocialMedia;
  image_url?: string;
  featured: boolean;
  products?: string[];
  revenue?: number;
  sales_count?: number;
  showcase_images?: string[];
  achievements?: string[];
  featured_project?: FeaturedProject;
  created_at?: string;
  updated_at?: string;
};
