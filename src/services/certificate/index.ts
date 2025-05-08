
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
  checkUserEligibility,
  getUsersEligibleForCertificates,
  getEligibleUsers,
  updateCertificateApproval,
  userMeetsRequirements,
  getUsersByStatus
} from './eligibility';

export type {
  CertificateSettings,
  CertificateEligibility,
  UserCertificate,
  CertificateStatus,
  EligibleUser
} from './types';
