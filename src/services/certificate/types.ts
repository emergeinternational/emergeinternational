
export type CertificateStatus = 'pending' | 'approved' | 'rejected' | 'denied' | 'ineligible';

export interface Certificate {
  id: string;
  user_id: string;
  course_title: string;
  issue_date: string;
  expiry_date?: string;
  certificate_file?: string;
}

// Alias for backward compatibility
export type UserCertificate = Certificate;

export interface CertificateSettingsProps {
  id?: string;
  min_courses_required: number;
  min_workshops_required: number;
  updated_at?: string;
}

// Alias for backward compatibility
export type CertificateSettings = CertificateSettingsProps;

export interface EligibleUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  online_courses_completed: number;
  workshops_completed: number;
  is_eligible: boolean;
  admin_approved: boolean;
  status: CertificateStatus;
}

export interface AppCertificate {
  id: string;
  user_id: string;
  course_title: string;
  issue_date: string;
  expiry_date?: string;
  certificate_file?: string;
}

export interface CertificateEligibility {
  id: string;
  user_id: string;
  online_courses_completed: number;
  workshops_completed: number;
  is_eligible: boolean;
  admin_approved: boolean;
  status: CertificateStatus;
  created_at?: string;
  updated_at?: string;
  min_courses_required?: number;
  min_workshops_required?: number;
}
