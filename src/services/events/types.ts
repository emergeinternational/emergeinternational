
export interface TicketType {
  id?: string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
  benefits?: string[];
  tickets_sold?: number;
  event_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  location?: string;
  capacity?: number;
  is_featured?: boolean;
  category?: string;
  image_url?: string;
  currency_code?: string;
  max_tickets?: number;
  price?: number;
  ticket_types?: TicketType[];
  created_at?: string;
  updated_at?: string;
  organizer_id?: string;
}

export interface CreateEventPayload {
  name: string;
  description?: string;
  date: string;
  location?: string;
  capacity?: number;
  is_featured?: boolean;
  category?: string;
  image_url?: string;
  currency_code?: string;
  max_tickets?: number;
  price?: number;
  ticket_types?: TicketType[];
}

export interface UpdateEventPayload {
  name?: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number;
  is_featured?: boolean;
  category?: string;
  image_url?: string;
  currency_code?: string;
  max_tickets?: number;
  price?: number;
  ticket_types?: TicketType[];
}

export interface CreateTicketTypePayload {
  name: string;
  price: number;
  description?: string;
  quantity: number;
}
