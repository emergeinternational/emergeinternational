
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserList from './users/UserList';
import SearchBar from './users/SearchBar';
import PaginationControls from './users/Pagination';
import RoleFilter from './users/filters/RoleFilter';
import StatusFilter from './users/filters/StatusFilter';
import { UserManagementProvider, useUserManagement } from '@/contexts/UserManagementContext';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';

const UserManagementContent = () => {
  const { user: currentUser } = useAuth();
  const {
    users,
    loading,
    currentPage,
    totalPages,
    filters,
    setFilters,
    setCurrentPage,
    refreshUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser
  } = useUserManagement();

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <SearchBar 
          initialValue={filters.search} 
          onSearch={(value) => setFilters({ search: value })} 
        />
        
        <div className="flex items-center gap-2">
          <RoleFilter
            value={filters.role}
            onChange={(value) => setFilters({ role: value })}
          />
          
          <StatusFilter
            value={filters.status}
            onChange={(value) => setFilters({ status: value })}
          />
          
          <Button
            variant="outline"
            onClick={() => refreshUsers()}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <UserList
          users={users}
          isLoading={loading}
          currentUserId={currentUser?.id}
          onEditUser={(user) => console.log('Edit user:', user)}
          onDeleteUser={deleteUser}
          onStatusChange={updateUserStatus}
          onRoleChange={updateUserRole}
        />
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

const UserManagement = () => {
  return (
    <UserManagementProvider>
      <UserManagementContent />
    </UserManagementProvider>
  );
};

export default UserManagement;
