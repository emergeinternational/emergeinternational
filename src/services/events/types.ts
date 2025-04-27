
export interface TicketType {
  id?: string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
  benefits?: string[];
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
  ticket_types?: TicketType[];
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
  ticket_types?: TicketType[];
}

export interface CreateTicketTypePayload {
  name: string;
  price: number;
  description?: string;
  quantity: number;
}
