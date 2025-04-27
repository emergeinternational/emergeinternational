
// This file re-exports functionality from the refactored certificate module
// to maintain backward compatibility with existing imports

export * from './certificate';
export * from './eligibility';
export * from './settings';
export * from './types';

// Add these functions for use in CertificateManagement
export const approveCertificate = async (userId: string, courseId: string) => {
  // In a real implementation, this would make a request to approve the certificate
  console.log(`Approving certificate for user ${userId} and course ${courseId}`);
  return { success: true };
};

export const rejectCertificate = async (userId: string, courseId: string, reason: string) => {
  // In a real implementation, this would make a request to reject the certificate
  console.log(`Rejecting certificate for user ${userId} and course ${courseId}. Reason: ${reason}`);
  return { success: true };
};
