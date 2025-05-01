
// Re-export all certificate-related functionality
export {
  getCertificateSettings,
  updateCertificateSettings
} from './settings';

export {
  generateCertificate,
  getUserCertificates,
  downloadCertificate
} from './certificate';

export {
  checkEligibility,
  getEligibilityStatus,
  updateEligibilityStatus,
  adminUpdateEligibility,
  userMeetsRequirements,
  getEligibleUsers,
  updateCertificateApproval,
  getUsersByStatus
} from './eligibility';

export type {
  CertificateSettings,
  CertificateEligibility,
  CertificateStatus,
  UserCertificate,
  EligibleUser
} from './types';
