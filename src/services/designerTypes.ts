
export type DesignerCategory = "apparel" | "accessories" | "footwear" | "jewelry" | "other";

export interface Designer {
  id: string;
  full_name: string;
  email?: string;
  bio?: string;
  specialty: DesignerCategory;
  portfolio_url?: string;
  social_media?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  products?: string[]; // Array of product IDs
  featured: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  sales_count?: number;
  revenue?: number;
}
