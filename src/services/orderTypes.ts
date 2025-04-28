
export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
}

export interface CustomerInfo {
  full_name?: string;
  email?: string;
  phone_number?: string;
}

export interface ShippingAddress {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'abandoned';
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  total_amount: number;
  shipping_address_id?: string;
  created_at?: string;
  updated_at?: string;
  user?: CustomerInfo;
  order_items?: OrderItem[];
  shipping_addresses?: ShippingAddress;
}
