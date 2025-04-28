
export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}

export type DesignerCategory = 'apparel' | 'accessories' | 'footwear' | 'jewelry' | 'other';

export interface Designer {
  id: string;
  full_name: string;
  email?: string;
  bio?: string;
  specialty: DesignerCategory;
  portfolio_url?: string;
  image_url?: string;
  social_media?: SocialMedia;
  featured: boolean;
  products?: string[];
  revenue?: number;
  sales_count?: number;
  created_at?: string;
  updated_at?: string;
}
