
// Local auth service specific to shop module that doesn't depend on external auth providers
// This is a temporary solution until full auth restoration

// Simplified auth status interface
export interface ShopAuthStatus {
  isAdmin: boolean;
  isAuthenticated: boolean;
  userId: string | null;
}

// Default auth status (fallback when no real auth is available)
const defaultAuthStatus: ShopAuthStatus = {
  isAdmin: true, // Setting default to true for development convenience
  isAuthenticated: true,
  userId: 'mock-user-id',
};

let currentAuthStatus = defaultAuthStatus;

// Simple function to get current auth status
export const getAuthStatus = (): ShopAuthStatus => {
  // Try to use the global auth service if available, but fall back to mock data
  try {
    // This would be replaced with actual auth integration when Auth module is re-integrated
    // For now we're just using our mock data
    return currentAuthStatus;
  } catch (error) {
    console.warn('Using mock auth data for Shop module (Auth module not available)');
    return defaultAuthStatus;
  }
};

// Optional: Add methods to update status for testing different user states
export const setMockAuthStatus = (status: Partial<ShopAuthStatus>): void => {
  currentAuthStatus = { ...currentAuthStatus, ...status };
  console.log('Auth status updated:', currentAuthStatus);
};

// Simplified auth initialization for isolated shop module - returns a promise to match the interface
export const initializeAuth = async (): Promise<void> => {
  console.log('Shop auth initialized with mock data');
  // No actual async operations needed, but returns a promise to match the interface
  return Promise.resolve();
};

// Simplified auth listener for isolated shop module
export const setupAuthListener = (): (() => void) => {
  console.log('Shop auth listener setup (mock)');
  // Return cleanup function
  return () => {
    console.log('Shop auth listener cleaned up (mock)');
  };
};
