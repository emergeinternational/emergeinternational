
import { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { OrderFiltersState, ORDER_STATUSES, PAYMENT_STATUSES } from "./OrdersManager";

interface OrderFiltersProps {
  filters: OrderFiltersState;
  setFilters: (filters: OrderFiltersState) => void;
}

const OrderFilters = ({ filters, setFilters }: OrderFiltersProps) => {
  // Local state for date range to handle calendar UI
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: filters.dateRange.from,
    to: filters.dateRange.to,
  });

  // Update parent filters when date range changes
  useEffect(() => {
    if (dateRange.from !== filters.dateRange.from || dateRange.to !== filters.dateRange.to) {
      setFilters({
        ...filters,
        dateRange,
      });
    }
  }, [dateRange, filters, setFilters]);

  const handleStatusChange = (value: string) => {
    setFilters({
      ...filters,
      status: value ? [value] : [],
    });
  };

  const handlePaymentStatusChange = (value: string) => {
    setFilters({
      ...filters,
      paymentStatus: value ? [value] : [],
    });
  };

  const handleSearchChange = (value: string) => {
    setFilters({
      ...filters,
      searchQuery: value,
    });
  };

  const handleResetFilters = () => {
    setFilters({
      status: [],
      paymentStatus: [],
      dateRange: {
        from: undefined,
        to: undefined,
      },
      searchQuery: "",
    });
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Order Status</label>
          <Select
            value={filters.status[0] || ""}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Status</label>
          <Select
            value={filters.paymentStatus[0] || ""}
            onValueChange={handlePaymentStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Payment Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Payment Statuses</SelectItem>
              {PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to
                }}
                onSelect={(selected) => {
                  setDateRange({
                    from: selected?.from,
                    to: selected?.to
                  });
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Search Orders</label>
          <Input
            placeholder="Search by ID, customer, or email..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleResetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default OrderFilters;
