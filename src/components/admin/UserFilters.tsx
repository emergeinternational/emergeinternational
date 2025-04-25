
import { useState } from "react";
import { Filter, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

export type DateRange = 'today' | 'this-week' | 'last-30-days' | 'all-time';

export type UserFilterState = {
  search: string;
  role: UserRole | 'all';
  dateRange: DateRange;
  verified?: boolean | null;
  showAllUsers: boolean;
}

interface UserFiltersProps {
  filters: UserFilterState;
  onFilterChange: (filters: Partial<UserFilterState>) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  activeFilterCount: number;
}

const UserFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  onRefresh,
  isLoading,
  activeFilterCount,
}: UserFiltersProps) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput });
  };

  const handleRoleChange = (value: string) => {
    onFilterChange({ role: value as UserRole | 'all' });
  };

  const handleDateRangeChange = (value: string) => {
    onFilterChange({ dateRange: value as DateRange });
  };

  const isFiltered = activeFilterCount > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 mr-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-8 pr-12"
          />
          <Button 
            type="submit" 
            size="sm" 
            variant="ghost" 
            className="absolute right-0 top-0 h-full px-3"
          >
            Search
          </Button>
        </form>
        
        <div className="flex gap-2">
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-10"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
              <Badge variant="secondary" className="ml-2 px-1 py-0 h-5">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {isFiltered && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0 h-5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuCheckboxItem 
                checked={filters.showAllUsers}
                onCheckedChange={(checked) => 
                  onFilterChange({ showAllUsers: checked })
                }
              >
                Show all users
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Status Filters</DropdownMenuLabel>
              
              <DropdownMenuCheckboxItem
                checked={filters.verified === true}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onFilterChange({ verified: true });
                  } else {
                    onFilterChange({ verified: null });
                  }
                }}
              >
                Verified
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={filters.verified === false}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onFilterChange({ verified: false });
                  } else {
                    onFilterChange({ verified: null });
                  }
                }}
              >
                Unverified
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <Select 
              value={filters.role} 
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.dateRange} 
              onValueChange={handleDateRangeChange}
            >
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="Signup date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={onRefresh}
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="h-10"
            >
              <svg
                className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>
      </div>
      
      {/* Active filters display */}
      {isFiltered && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.search && (
            <Badge variant="secondary" className="px-2 py-1">
              Search: {filters.search}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-1 h-4 w-4 p-0" 
                onClick={() => onFilterChange({ search: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.role !== 'all' && (
            <Badge variant="secondary" className="px-2 py-1">
              Role: {filters.role}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-1 h-4 w-4 p-0" 
                onClick={() => onFilterChange({ role: 'all' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.dateRange !== 'all-time' && (
            <Badge variant="secondary" className="px-2 py-1">
              Date: {filters.dateRange.replace(/-/g, ' ')}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-1 h-4 w-4 p-0" 
                onClick={() => onFilterChange({ dateRange: 'all-time' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.verified !== null && (
            <Badge variant="secondary" className="px-2 py-1">
              {filters.verified ? 'Verified' : 'Unverified'}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-1 h-4 w-4 p-0" 
                onClick={() => onFilterChange({ verified: null })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default UserFilters;
