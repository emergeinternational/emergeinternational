
export type DesignerCategory = 'apparel' | 'accessories' | 'footwear' | 'jewelry' | 'other';

export interface SocialMedia {
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface Designer {
  id: string;
  full_name: string;
  email?: string | null;
  bio?: string | null;
  specialty: DesignerCategory;
  portfolio_url?: string | null;
  social_media?: SocialMedia;
  products?: string[];
  featured: boolean;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  sales_count?: number;
  revenue?: number;
}
