
export type CertificateStatus = 'pending' | 'approved' | 'rejected' | 'ineligible';

export interface CertificateSettings {
  id?: string;
  min_courses_required: number;
  min_workshops_required: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CertificateEligibility {
  online_courses_completed: number;
  workshops_completed: number;
  min_courses_required: number;
  min_workshops_required: number;
  is_eligible: boolean;
  admin_approved: boolean;
  status: CertificateStatus;
}

export interface UserCertificate {
  id?: string;
  user_id?: string;
  course_title: string;
  issue_date?: string;
  expiry_date?: string;
  certificate_file?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EligibleUser {
  id?: string;
  user_id: string;
  email?: string;
  full_name?: string;
  online_courses_completed: number;
  workshops_completed: number;
  is_eligible: boolean;
  admin_approved: boolean;
  status: CertificateStatus;
}
