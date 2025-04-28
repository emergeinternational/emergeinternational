
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
