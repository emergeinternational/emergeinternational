
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

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'abandoned';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_status?: PaymentStatus;
  payment_method?: string;
  total_amount: number;
  shipping_address_id?: string;
  created_at?: string;
  updated_at?: string;
  user?: CustomerInfo;
  order_items?: OrderItem[];
}
