
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCurrency } from '@/hooks/useCurrency';

interface TicketType {
  id: string;
  type: string;
  price: number;
  description?: string;
  available_quantity: number;
  benefits?: string[];
}

interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchange_rate: number;
}

interface TicketSelectorProps {
  tickets: TicketType[];
  selectedTicket: TicketType | null;
  onSelectTicket: (ticket: TicketType) => void;
  currency: Currency | null;
}

export const TicketSelector: React.FC<TicketSelectorProps> = ({
  tickets,
  selectedTicket,
  onSelectTicket,
  currency
}) => {
  const { convertPrice } = useCurrency();

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center p-4 border rounded bg-gray-50">
        <p className="text-gray-500">No tickets available for this event.</p>
      </div>
    );
  }

  return (
    <RadioGroup 
      value={selectedTicket?.id}
      onValueChange={(value) => {
        const ticket = tickets.find(t => t.id === value);
        if (ticket) {
          onSelectTicket(ticket);
        }
      }}
      className="space-y-3"
    >
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className={`border rounded-md p-4 transition-colors ${
            selectedTicket?.id === ticket.id 
              ? 'border-emerge-gold bg-emerge-cream/20' 
              : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={ticket.id} id={`ticket-${ticket.id}`} />
            <Label 
              htmlFor={`ticket-${ticket.id}`} 
              className="flex-grow cursor-pointer"
            >
              <div className="flex justify-between">
                <span className="font-medium">{ticket.type}</span>
                <span className="font-bold">
                  {currency?.symbol} {convertPrice(ticket.price).toFixed(2)}
                </span>
              </div>
              
              {ticket.description && (
                <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
              )}
              
              {ticket.available_quantity <= 5 && ticket.available_quantity > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  Only {ticket.available_quantity} left!
                </p>
              )}
              
              {ticket.available_quantity === 0 && (
                <p className="text-xs text-red-600 mt-1">Sold out</p>
              )}
              
              {ticket.benefits && ticket.benefits.length > 0 && (
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  {ticket.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="mr-1">•</span> {benefit}
                    </li>
                  ))}
                </ul>
              )}
            </Label>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
};
