
// String-based role types
export type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

// Auth related types
export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  role?: UserRole;
  avatar_url?: string;
  updated_at: string;
  created_at: string;
  // Additional profile fields
  phone_number?: string;
  country?: string;
  city?: string;
  language?: string;
}

// Helper functions
export const isAdminRole = (role?: string): boolean => {
  return role === 'admin';
};

export const isEditorOrAbove = (role?: string): boolean => {
  return role === 'admin' || role === 'editor';
};

export const isViewerOrAbove = (role?: string): boolean => {
  return role === 'admin' || role === 'editor' || role === 'viewer';
};
