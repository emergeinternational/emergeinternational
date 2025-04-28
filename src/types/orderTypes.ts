
export type OrderStatus = 
  | 'pending' 
  | 'cancelled' 
  | 'processing' 
  | 'completed' 
  | 'shipped' 
  | 'delivered'
  | 'refunded'
  | 'abandoned';

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string; // Allow any string to match database
  payment_method?: string;
  shipping_address_id?: string;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItem[];
  profiles?: {
    full_name?: string;
    email?: string;
  };
  shipping_addresses?: {
    address_line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onRefresh?: () => void;
  onViewDetails?: (order: Order) => void;
}
