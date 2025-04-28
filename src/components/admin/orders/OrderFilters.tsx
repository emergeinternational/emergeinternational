
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CheckIcon, Filter, Search, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ORDER_STATUSES, PAYMENT_STATUSES, OrderFiltersState } from "./OrdersManager";

interface OrderFiltersProps {
  filters: OrderFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<OrderFiltersState>>;
}

const OrderFilters = ({ filters, setFilters }: OrderFiltersProps) => {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPaymentStatusOpen, setIsPaymentStatusOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const toggleStatusFilter = (value: string) => {
    setFilters(prev => {
      if (prev.status.includes(value)) {
        return {
          ...prev,
          status: prev.status.filter(status => status !== value)
        };
      } else {
        return {
          ...prev,
          status: [...prev.status, value]
        };
      }
    });
  };

  const togglePaymentStatusFilter = (value: string) => {
    setFilters(prev => {
      if (prev.paymentStatus.includes(value)) {
        return {
          ...prev,
          paymentStatus: prev.paymentStatus.filter(status => status !== value)
        };
      } else {
        return {
          ...prev,
          paymentStatus: [...prev.paymentStatus, value]
        };
      }
    });
  };

  const handleDateRangeChange = (date: Date | undefined) => {
    const { from, to } = filters.dateRange;
    
    if (!from) {
      setFilters({
        ...filters,
        dateRange: { from: date, to }
      });
    } else if (from && !to && date && date >= from) {
      setFilters({
        ...filters,
        dateRange: { from, to: date }
      });
      setIsDateRangeOpen(false);
    } else {
      setFilters({
        ...filters,
        dateRange: { from: date, to: undefined }
      });
    }
  };

  const resetDateRange = () => {
    setFilters({
      ...filters,
      dateRange: { from: undefined, to: undefined }
    });
  };

  const resetAllFilters = () => {
    setFilters({
      status: [],
      paymentStatus: [],
      dateRange: { from: undefined, to: undefined },
      searchQuery: ""
    });
  };

  // Count active filters
  const activeFiltersCount = 
    filters.status.length + 
    filters.paymentStatus.length + 
    (filters.dateRange.from ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by order ID, customer name or email..."
            className="pl-10"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          />
          {filters.searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setFilters({ ...filters, searchQuery: "" })}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="mr-2 h-4 w-4" />
                Status
                {filters.status.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 min-w-4 rounded-full">
                    {filters.status.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <Command>
                <CommandInput placeholder="Filter status..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {ORDER_STATUSES.map((status) => (
                      <CommandItem
                        key={status.value}
                        onSelect={() => toggleStatusFilter(status.value)}
                        className="flex items-center justify-between"
                      >
                        <span>{status.label}</span>
                        {filters.status.includes(status.value) && <CheckIcon className="h-4 w-4" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => setFilters({ ...filters, status: [] })}
                      className="text-sm text-center justify-center text-gray-500 hover:text-gray-900"
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover open={isPaymentStatusOpen} onOpenChange={setIsPaymentStatusOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="mr-2 h-4 w-4" />
                Payment
                {filters.paymentStatus.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 min-w-4 rounded-full">
                    {filters.paymentStatus.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <Command>
                <CommandInput placeholder="Filter payment status..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {PAYMENT_STATUSES.map((status) => (
                      <CommandItem
                        key={status.value}
                        onSelect={() => togglePaymentStatusFilter(status.value)}
                        className="flex items-center justify-between"
                      >
                        <span>{status.label}</span>
                        {filters.paymentStatus.includes(status.value) && <CheckIcon className="h-4 w-4" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => setFilters({ ...filters, paymentStatus: [] })}
                      className="text-sm text-center justify-center text-gray-500 hover:text-gray-900"
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="mr-2 h-4 w-4" />
                Date
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <Badge variant="secondary" className="ml-2 px-1 min-w-4 rounded-full">
                    ✓
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Date Range</h4>
                  <p className="text-xs text-gray-500">
                    {filters.dateRange.from
                      ? filters.dateRange.to
                        ? `${format(filters.dateRange.from, "MMM dd, yyyy")} - ${format(filters.dateRange.to, "MMM dd, yyyy")}`
                        : `From ${format(filters.dateRange.from, "MMM dd, yyyy")}`
                      : "Select a date range"}
                  </p>
                </div>
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to,
                  }}
                  onSelect={(range) => {
                    setFilters({
                      ...filters,
                      dateRange: {
                        from: range?.from,
                        to: range?.to,
                      },
                    });
                  }}
                  numberOfMonths={2}
                  defaultMonth={filters.dateRange.from}
                  disabled={{ after: new Date() }}
                />
                <div className="flex justify-end">
                  {(filters.dateRange.from || filters.dateRange.to) && (
                    <Button variant="ghost" size="sm" onClick={resetDateRange}>
                      Reset
                    </Button>
                  )}
                  <Button size="sm" onClick={() => setIsDateRangeOpen(false)}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.status.map((status) => (
            <Badge key={status} variant="secondary" className="px-2 py-1">
              {ORDER_STATUSES.find(s => s.value === status)?.label || status}
              <button 
                className="ml-1 text-gray-500 hover:text-gray-800"
                onClick={() => toggleStatusFilter(status)}
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
          {filters.paymentStatus.map((status) => (
            <Badge key={status} variant="secondary" className="px-2 py-1">
              Payment: {PAYMENT_STATUSES.find(s => s.value === status)?.label || status}
              <button 
                className="ml-1 text-gray-500 hover:text-gray-800"
                onClick={() => togglePaymentStatusFilter(status)}
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
          {filters.dateRange.from && (
            <Badge variant="secondary" className="px-2 py-1">
              Date: {filters.dateRange.from ? format(filters.dateRange.from, "MMM dd") : ""}
              {filters.dateRange.to ? ` - ${format(filters.dateRange.to, "MMM dd")}` : ""}
              <button 
                className="ml-1 text-gray-500 hover:text-gray-800"
                onClick={resetDateRange}
              >
                <X size={14} />
              </button>
            </Badge>
          )}
          {filters.searchQuery && (
            <Badge variant="secondary" className="px-2 py-1">
              "{filters.searchQuery}"
              <button 
                className="ml-1 text-gray-500 hover:text-gray-800"
                onClick={() => setFilters({ ...filters, searchQuery: "" })}
              >
                <X size={14} />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={resetAllFilters} className="text-sm">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderFilters;
