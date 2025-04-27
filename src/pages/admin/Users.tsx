
import React from 'react';
import AdminLayout from "@/layouts/AdminLayout";
import UserFilters, { UserFilterState } from '@/components/admin/UserFilters';
import UserManagement from '@/components/admin/UserManagement';

const Users = () => {
  const [filters, setFilters] = React.useState<UserFilterState>({
    search: '',
    role: 'all',
    dateRange: 'all-time',
    verified: null,
    showAllUsers: true
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFilterChange = (newFilters: Partial<UserFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      dateRange: 'all-time',
      verified: null,
      showAllUsers: true
    });
  };

  const handleRefresh = () => {
    // This will be handled by UserManagement component's own refresh
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  // Calculate active filter count
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.role !== 'all') count++;
    if (filters.dateRange !== 'all-time') count++;
    if (filters.verified !== null) count++;
    return count;
  }, [filters]);

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Users Management</h1>
        <UserManagement />
      </div>
    </AdminLayout>
  );
};

export default Users;
