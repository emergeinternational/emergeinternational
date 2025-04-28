
export interface DonationPageSettings {
  id: string;
  hero_title: string;
  hero_description?: string;
  hero_image_url?: string;
  payment_methods?: string[];
  currency_options?: string[];
  suggested_amounts?: number[];
  min_donation_amount?: number;
  max_donation_amount?: number;
  thank_you_message?: string;
  is_active?: boolean;
  featured_member?: {
    name: string;
    role: string;
    image_url: string;
    description: string;
  };
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}
