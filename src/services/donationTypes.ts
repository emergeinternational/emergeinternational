export interface Donor {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  total_donations?: number;
  last_donation_date?: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_proof_url?: string;
  message?: string;
  certificate_issued: boolean;
  certificate_url?: string;
  created_at?: string;
  updated_at?: string;
  donor?: Donor;
}

export interface DonationPageSettings {
  id: string;
  hero_title: string;
  hero_description: string | null;
  hero_image_url: string | null;
  featured_member: {
    name: string;
    role: string;
    bio: string;
    image_url: string;
  } | null;
  min_donation_amount: number;
  max_donation_amount: number;
  suggested_amounts: number[];
  currency_options: string[];
  payment_methods: string[];
  thank_you_message: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
  is_active: boolean;
}
