
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '../../ui/date-range-picker';
import { X } from 'lucide-react';
import { ORDER_STATUSES, PAYMENT_STATUSES, OrderStatus, PaymentStatus, OrderFiltersState } from '@/types/orderTypes';

interface OrderFiltersNewProps {
  filters: OrderFiltersState;
  onFilterChange: (filters: OrderFiltersState) => void;
}

export function OrderFiltersNew({ filters, onFilterChange }: OrderFiltersNewProps) {
  // Ensure all properties exist on filters
  const filtersWithDefaults = {
    ...filters,
    searchQuery: filters.searchQuery || filters.searchTerm || '',
    paymentStatus: filters.paymentStatus || 'all'
  };

  const handleResetFilters = () => {
    onFilterChange({
      searchTerm: '',
      status: 'all',
      dateRange: {
        from: undefined,
        to: undefined,
      },
      paymentStatus: 'all',
      searchQuery: ''
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filtersWithDefaults,
      searchTerm: event.target.value,
      searchQuery: event.target.value
    });
  };

  const handleStatusChange = (value: OrderStatus | 'all') => {
    onFilterChange({
      ...filtersWithDefaults,
      status: value
    });
  };

  const handlePaymentStatusChange = (value: PaymentStatus | 'all') => {
    onFilterChange({
      ...filtersWithDefaults,
      paymentStatus: value
    });
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    onFilterChange({
      ...filtersWithDefaults,
      dateRange: range
    });
  };

  const isFiltersActive = 
    (filtersWithDefaults.searchTerm && filtersWithDefaults.searchTerm.length > 0) || 
    filtersWithDefaults.status !== 'all' ||
    filtersWithDefaults.paymentStatus !== 'all' ||
    filtersWithDefaults.dateRange.from !== undefined || 
    filtersWithDefaults.dateRange.to !== undefined;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            type="search"
            placeholder="Search orders..."
            value={filtersWithDefaults.searchQuery || filtersWithDefaults.searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        
        <div>
          <Select
            value={filtersWithDefaults.status}
            onValueChange={(value: string) => handleStatusChange(value as OrderStatus | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Order status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={filtersWithDefaults.paymentStatus}
            onValueChange={(value: string) => handlePaymentStatusChange(value as PaymentStatus | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Statuses</SelectItem>
              {PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DateRangePicker 
          dateRange={filtersWithDefaults.dateRange} 
          onDateRangeChange={handleDateRangeChange} 
        />
      </div>

      {isFiltersActive && (
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="text-sm text-gray-500 mr-2">Active filters:</div>

          {filtersWithDefaults.searchQuery && filtersWithDefaults.searchQuery.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: {filtersWithDefaults.searchQuery}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange({...filtersWithDefaults, searchTerm: '', searchQuery: ''})} 
              />
            </Badge>
          )}

          {filtersWithDefaults.status !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {filtersWithDefaults.status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange({...filtersWithDefaults, status: 'all'})} 
              />
            </Badge>
          )}

          {filtersWithDefaults.paymentStatus !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Payment: {filtersWithDefaults.paymentStatus}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange({...filtersWithDefaults, paymentStatus: 'all'})} 
              />
            </Badge>
          )}

          {(filtersWithDefaults.dateRange.from || filtersWithDefaults.dateRange.to) && (
            <Badge variant="outline" className="flex items-center gap-1">
              Date Range
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange({...filtersWithDefaults, dateRange: { from: undefined, to: undefined }})} 
              />
            </Badge>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleResetFilters}
            className="ml-auto"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default OrderFiltersNew;
