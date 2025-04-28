
// Designer related types
export type CreatorCategory = 
  | 'fashion_designer' 
  | 'model' 
  | 'photographer' 
  | 'event_planner'
  | 'interior_designer'
  | 'graphic_designer'
  | 'visual_artist'
  | 'creative_director';

export type DesignerSpecialty = 
  | 'apparel'
  | 'accessories'
  | 'footwear'
  | 'jewelry'
  | 'other';

export interface SocialMedia {
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  portfolio?: string;
  other?: string;
}

export interface FeaturedProject {
  title: string;
  description: string;
  image_url?: string;
  date?: string;
}

export interface ProductDimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit?: string;
}

export interface Designer {
  id: string;
  full_name: string;
  email?: string;
  bio?: string;
  specialty: string | DesignerSpecialty; // Modified to accommodate string values
  category: CreatorCategory;
  portfolio_url?: string;
  location?: string;
  social_media?: SocialMedia;
  featured_project?: FeaturedProject;
  showcase_images?: string[];
  achievements?: string[];
  products?: string[];
  image_url?: string;
  featured: boolean;
  revenue?: number;
  sales_count?: number;
  updated_at: string;
  created_at?: string;
}
