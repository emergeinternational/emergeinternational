
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { ORDER_STATUSES, PAYMENT_STATUSES } from './OrderHelper';

export interface OrderFilterState {
  search: string;
  status: string | null;
  paymentStatus: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
}

interface OrderFiltersProps {
  filters: OrderFilterState;
  onChange: (filters: OrderFilterState) => void;
  onReset: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onChange,
  onReset
}) => {
  const handleChange = (name: keyof OrderFilterState, value: any) => {
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <div className="relative">
            <Search className="h-4 w-4 absolute top-3 left-3 text-gray-400" />
            <Input
              placeholder="Order ID, Customer..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Order Status</label>
          <Select
            value={filters.status || ""}
            onValueChange={(value) => handleChange('status', value === "" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any status</SelectItem>
              {ORDER_STATUSES.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Payment Status</label>
          <Select
            value={filters.paymentStatus || ""}
            onValueChange={(value) => handleChange('paymentStatus', value === "" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any payment status</SelectItem>
              {PAYMENT_STATUSES.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>
          <DatePicker
            date={filters.dateFrom}
            setDate={(date) => handleChange('dateFrom', date)}
            placeholder="Select from date"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>
          <DatePicker
            date={filters.dateTo}
            setDate={(date) => handleChange('dateTo', date)}
            placeholder="Select to date"
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default OrderFilters;
