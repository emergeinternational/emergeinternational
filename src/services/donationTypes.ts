
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
}
