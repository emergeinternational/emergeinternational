
export type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active?: boolean;
  created_at?: string;
  loading?: boolean;
}
