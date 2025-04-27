
export interface TalentApplication {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  country?: string;
  category_type?: string;
  experience_years?: number;
  portfolio_url?: string;
  photo_url?: string;
  social_media?: {
    instagram?: string;
    tiktok?: string;
    telegram?: string;
  };
  skills?: string[];
  notes?: string;
  status?: string;
  created_at: string;
}
