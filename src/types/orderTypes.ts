
// Updated order types to use string-based status

export type OrderStatus = string;
export type PaymentStatus = string;

export interface ShippingAddress {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
}

export interface OrderCustomer {
  id: string;
  email?: string;
  full_name?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_method?: string;
  shipping_address_id?: string;
  total_amount: number;
  created_at?: string;
  updated_at?: string;
  customer?: OrderCustomer;
  shipping_address?: ShippingAddress;
  items?: OrderItem[];
}

export interface OrderFiltersState {
  status: string | string[];
  searchQuery: string;
  paymentStatus: string | string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onViewDetails?: (order: Order) => void;
}

export interface OrdersSummary {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}
