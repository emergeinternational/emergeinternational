
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { OrderFiltersState, ORDER_STATUSES } from "./OrdersManagerNew";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderFiltersProps {
  filters: OrderFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<OrderFiltersState>>;
}

const OrderFiltersNew = ({ filters, setFilters }: OrderFiltersProps) => {
  // Clear search
  const handleClearSearch = () => {
    setFilters(prev => ({ ...prev, searchQuery: "" }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by order ID, customer name or email..."
            className="pl-10"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          />
          {filters.searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
              type="button"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Status Tabs (Filters) */}
      <Tabs 
        value={filters.status} 
        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        className="w-full"
      >
        <TabsList className="w-full flex justify-start overflow-x-auto no-scrollbar">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          {ORDER_STATUSES.map(status => (
            <TabsTrigger key={status.value} value={status.value}>
              {status.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Active filters indicators */}
      {filters.searchQuery && (
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-100 text-sm px-3 py-1 rounded-full flex items-center">
            Search: "{filters.searchQuery}"
            <button onClick={handleClearSearch} className="ml-2 text-gray-500 hover:text-gray-700">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFiltersNew;
