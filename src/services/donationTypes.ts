
export interface Donation {
  id: string;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'approved' | 'rejected' | 'failed' | 'refunded';
  payment_proof_url?: string;
  message?: string;
  certificate_issued: boolean;
  certificate_url?: string;
  created_at?: string;
  updated_at?: string;
  donor_id?: string;
  user_id: string;
  donor?: Donor; // Add this relation for join queries
}

export interface Donor {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  user_id?: string;
  total_donations?: number;
  last_donation_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DonationPageSettings {
  id: string;
  hero_title: string;
  hero_description?: string;
  hero_image_url?: string;
  min_donation_amount: number;
  max_donation_amount: number;
  suggested_amounts: number[];
  currency_options: string[];
  payment_methods: string[];
  thank_you_message: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}
