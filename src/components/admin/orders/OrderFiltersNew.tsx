
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '../../ui/date-range-picker';
import { OrderFiltersState } from '@/types/orderTypes';
import { DateRange } from 'react-day-picker';
import { Badge } from "@/components/ui/badge";

interface OrderFiltersProps {
  filters: OrderFiltersState;
  onFilterChange: (filters: OrderFiltersState) => void;
}

export const OrderFiltersNew: React.FC<OrderFiltersProps> = ({ filters, onFilterChange }) => {
  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value
    });
  };

  const handlePaymentStatusChange = (value: string) => {
    // Convert to array if it's a string
    let newPaymentStatus: string | string[];
    
    if (typeof filters.paymentStatus === 'string') {
      newPaymentStatus = value;
    } else {
      // It's already an array
      newPaymentStatus = [value];
    }
    
    onFilterChange({
      ...filters,
      paymentStatus: newPaymentStatus
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFilterChange({
      ...filters,
      dateRange: {
        from: range?.from || null,
        to: range?.to || null
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={filters.searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      <div className="w-full sm:w-[180px]">
        <Select
          value={typeof filters.status === 'string' ? filters.status : filters.status[0]}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-[180px]">
        <Select 
          value={typeof filters.paymentStatus === 'string' ? filters.paymentStatus : filters.paymentStatus[0] || ''}
          onValueChange={handlePaymentStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-auto">
        <DatePickerWithRange 
          date={{
            from: filters.dateRange.from || undefined,
            to: filters.dateRange.to || undefined
          }}
          onSelect={handleDateRangeChange}
        />
      </div>
      
      {/* Active filters */}
      {(filters.searchQuery || 
       (typeof filters.status === 'string' && filters.status) || 
       (Array.isArray(filters.status) && filters.status.length > 0) || 
       (typeof filters.paymentStatus === 'string' && filters.paymentStatus) || 
       (Array.isArray(filters.paymentStatus) && filters.paymentStatus.length > 0) || 
       filters.dateRange.from || 
       filters.dateRange.to) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.searchQuery && (
            <Badge variant="secondary" className="px-2 py-1">
              Search: {filters.searchQuery}
            </Badge>
          )}
          
          {typeof filters.status === 'string' && filters.status && (
            <Badge variant="secondary" className="px-2 py-1">
              Status: {filters.status}
            </Badge>
          )}
          
          {typeof filters.paymentStatus === 'string' && filters.paymentStatus && (
            <Badge variant="secondary" className="px-2 py-1">
              Payment: {filters.paymentStatus}
            </Badge>
          )}
          
          {filters.dateRange.from && (
            <Badge variant="secondary" className="px-2 py-1">
              From: {filters.dateRange.from.toLocaleDateString()}
            </Badge>
          )}
          
          {filters.dateRange.to && (
            <Badge variant="secondary" className="px-2 py-1">
              To: {filters.dateRange.to.toLocaleDateString()}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderFiltersNew;
