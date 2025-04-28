
export interface Donation {
  id: string;
  amount: number;
  currency: string;
  payment_status: string;
  payment_method?: string;
  message?: string;
  certificate_url?: string;
  payment_proof_url?: string;
  user_id: string;
  donor_id?: string;
  updated_at?: string;
  certificate_issued?: boolean;
  created_at?: string;
  donor?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

export interface DonationPageSettings {
  id: string;
  hero_title: string;
  hero_description?: string;
  hero_image_url?: string;
  thank_you_message?: string;
  suggested_amounts?: number[];
  min_donation_amount?: number;
  max_donation_amount?: number;
  payment_methods?: string[];
  currency_options?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
  featured_member?: string; // Add the missing property
}
