
// Export all certificate-related functions from the module files

// Settings-related exports
export { 
  getCertificateSettings,
  updateCertificateSettings 
} from './settings';

// Certificate management exports
export {
  generateCertificate,
  getUserCertificates,
  downloadCertificate
} from './certificate';

// Eligibility-related exports
export {
  getEligibleUsers,
  updateCertificateApproval,
  userMeetsRequirements
} from './eligibility';

// Type exports
export type { 
  CertificateSettings,
  UserCertificate,
  CertificateEligibility
} from './types';
