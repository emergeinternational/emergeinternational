
// Order related types for the application
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  created_at?: string;
}

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

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  payment_method?: string;
  shipping_address_id?: string;
  created_at?: string;
  updated_at?: string;
  
  // Joined data
  shipping_address?: ShippingAddress;
  order_items?: OrderItem[];
  profiles?: UserProfile;
}

export interface OrderFiltersState {
  searchTerm: string;
  status: OrderStatus | 'all';
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  paymentStatus?: PaymentStatus | 'all'; // Added missing property
  searchQuery?: string; // Added missing property
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing', 
  'shipped', 
  'delivered', 
  'cancelled', 
  'refunded'
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'pending',
  'paid',
  'failed',
  'refunded'
];

export const ORDER_PAYMENT_METHODS = [
  'credit_card',
  'bank_transfer',
  'mobile_money',
  'cash',
  'other'
];
