
export type CertificateStatus = 'pending' | 'approved' | 'rejected' | 'ineligible' | 'denied';

export interface CertificateEligibility {
  id?: string;
  user_id: string;
  online_courses_completed: number;
  workshops_completed: number;
  is_eligible: boolean;
  admin_approved: boolean;
  status: CertificateStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CertificateSettings {
  id?: string;
  min_courses_required: number;
  min_workshops_required: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CertificateStatusUpdateRequest {
  userId: string;
  status: CertificateStatus;
  reason?: string;
}

export interface UserCertificate {
  id?: string;
  user_id: string;
  course_title: string;
  issue_date: string;
  expiry_date?: string;
  certificate_file?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EligibleUser extends CertificateEligibility {
  profiles?: {
    full_name?: string;
    email?: string;
  };
}
