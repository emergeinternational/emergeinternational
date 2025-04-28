
export type TalentStatus = 'pending' | 'approved' | 'rejected' | 'on_hold';

// The old TalentApplication interface remains for backward compatibility
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
  sync_status?: string | null;
}

// New enum types to match database enums
export type TalentCategory = "model" | "designer" | "photographer" | "actor" | "musical_artist" | "fine_artist" | "event_planner";
export type TalentLevel = "beginner" | "intermediate" | "expert";

// New interface for the talent table
export interface Talent {
  id: string;
  full_name: string;
  email: string;
  category: TalentCategory;
  level: TalentLevel;
  portfolio_url?: string | null;
  social_media_links?: {
    instagram?: string;
    tiktok?: string;
    telegram?: string;
    portfolio?: string;
    other?: string[];
  } | null;
  profile_image_url?: string | null;
  created_at: string;
  updated_at: string;
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
