
export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}

export interface Designer {
  id: string;
  full_name: string;
  email?: string;
  bio?: string;
  specialty: 'apparel' | 'accessories' | 'footwear' | 'jewelry' | 'other';
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
