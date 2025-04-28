
export type TalentStatus = 'pending' | 'approved' | 'rejected' | 'on_hold';

export interface TalentApplication {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  skills?: string[] | null;
  portfolio_url?: string | null;
  social_media?: {
    instagram?: string;
    tiktok?: string;
    telegram?: string;
  } | null;
  status: TalentStatus;
  notes?: string | null;
  created_at: string;
  country?: string | null;
  age?: number | null;
  category_type?: string | null;
  photo_url?: string | null;
  gender?: string | null;
  experience_years?: number | null;
  measurements?: Record<string, any> | null;
}

export interface TalentFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  age: number;
  gender: string;
  city: string;
  country: string;
  socialMediaHandle?: string;
  telegramHandle?: string;
  portfolioUrl?: string;
  category: string;
  talentDescription: string;
  availability?: string;
  consent: boolean;
  measurements?: {
    height?: string;
    weight?: string;
    chest?: string;
    bust?: string;
    waist?: string;
    hips?: string;
    shoulders?: string;
    inseam?: string;
  };
  dressSize?: string;
  shoeSize?: string;
}

export interface TalentRegistrationProps {
  onSubmitSuccess: () => void;
}
